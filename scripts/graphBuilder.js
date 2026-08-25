import { Scene } from './scene.js';
import { StoryParser } from './storyParser.js';
import { GotoNode, ChoiceNode, ChoiceOption } from './storyNodes.js';

export const GraphBuilder = {
    initialize() {
        this.sceneMap = new Map();

        this.pendingGoto = [];

        this.currentScene = null;
        this.previousNode = null;
    },
    
    beginScene(sceneNode) {
        this.currentScene = sceneNode;

        this.sceneMap.set(sceneNode.id, sceneNode);

        this.previousNode = null;
    },

    connectLinear(node) {
        if(this.previousNode == null)
            this.currentScene.firstNode = node;
        else
            this.previousNode.next = node;

        this.previousNode = node;

        if(node instanceof GotoNode)
            this.pendingGoto.push(node);

    },

    connectBranch(previousNode, node) {
        if(previousNode != null)
            previousNode.next = node;

        if(node instanceof GotoNode)
            this.pendingGoto.push(node);

        return node;

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

            this.buildDialogue(sceneId, sceneData.dialogue);
        }

        GraphBuilder.finalize();
    },

    buildDialogue(sceneId, dialogue, isBranch = false, onContinue = null, counter = { value: 0 }) {
        let firstNode = null;
        let previousNode = null;
        let deadEndNodes = [];

        for(let i = 0; i < dialogue.length; i++) {
            const data = dialogue[i];
            const node = StoryParser.parse(data);
            node.index = counter.value++;

            if(firstNode == null)
                firstNode = node;

            if(onContinue != null) {
                onContinue(node);
                onContinue = null;
            }

            for(const end of deadEndNodes)
                end.next = node;

            deadEndNodes = [];

            if(isBranch)
                previousNode = GraphBuilder.connectBranch(previousNode, node);
            else
                GraphBuilder.connectLinear(node);

            if(node instanceof ChoiceNode) {
                const branchDeadEnds = [];
                const newChoices = [];

                for(const optionData of node.choices) {
                    const branch = this.buildDialogue(
                        sceneId,
                        optionData.dialogue,
                        true,
                        null,
                        counter
                    );

                    const option = new ChoiceOption(optionData);
                    option.next = branch.firstNode;

                    newChoices.push(option);
                    branchDeadEnds.push(...branch.deadEndNodes);
                }

                node.choices = newChoices;
                deadEndNodes = branchDeadEnds;
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