import { Scene } from './scene.js';
import { StoryParser } from './storyParser.js';
import { GotoNode, ChoiceNode, ChoiceOption } from './storyNodes.js';

export const GraphBuilder = {
    initialize() {
        this.sceneMap = new Map();
        this.pendingGoto = [];
    },

    beginScene(sceneNode) {
        this.sceneMap.set(sceneNode.id, sceneNode);
    },

    finalize() {
        for(const gotoNode of this.pendingGoto) {
            gotoNode.next = this.sceneMap.get(gotoNode.sceneId).firstNode;
            if(gotoNode.next == null)
                throw new Error(`Scene '${gotoNode.sceneId}' does not exist.`);
        }
    }
}

export const StoryBuilder = {
    initialize(storyData) {
        GraphBuilder.initialize();

        for(const [sceneId, sceneData] of Object.entries(storyData.scenes)) {
            const scene = new Scene(
                sceneId, 
                sceneData.background, 
                sceneData.bgm
            );

            GraphBuilder.beginScene(scene);
            scene.firstNode = this.buildDialogue(sceneId, sceneData.dialogue).firstNode;
        }

        GraphBuilder.finalize();
    },

    buildDialogue(sceneId, dialogue, onContinue = null) {
        let firstNode = null;
        let deadEndNodes = [];

        for(let i = 0; i < dialogue.length; i++) {
            const data = dialogue[i];
            const node = StoryParser.parse(data);

            if(firstNode == null)
                firstNode = node;

            if(onContinue != null) {
                onContinue(node);
                onContinue = null;
            }

            for(const end of deadEndNodes)
                end.next = node;

            if(node instanceof GotoNode)
                GraphBuilder.pendingGoto.push(node);

            if(node instanceof ChoiceNode) {
                const branches = node.choices.map(optionData => {
                    const branch = this.buildDialogue(
                        sceneId, 
                        optionData.dialogue
                    );
                    const option = new ChoiceOption(optionData);
                    option.next = branch.firstNode;
                    return { 
                        option, 
                        deadEnds: branch.deadEndNodes 
                    };
                });

                node.choices = branches.map(b => b.option);
                deadEndNodes = branches.flatMap(b => b.deadEnds);
                continue;
            }

            deadEndNodes = [node];
        }

        return { 
            firstNode, 
            deadEndNodes 
        };
    }
}