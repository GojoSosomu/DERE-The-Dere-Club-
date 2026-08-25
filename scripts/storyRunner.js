import { StoryGraph } from './storyGraph.js';
import { EventBus } from './eventBus.js';
import { DOM } from './dom.js';
import { Dialogue } from './dialogue.js';
import { GotoNode, SpeakerNode } from './storyNodes.js';

export const StoryRunner = {
    initialize(storyId) {
        this.currentStory = StoryGraph.getStory(storyId);

        this.currentScene = this.currentStory.getStartScene();
        this.currentNode = this.currentScene.firstNode;

        EventBus.on("dialogue:advance", () => this.next());
        EventBus.on("choice:selected", option => this.choose(option));
        EventBus.on("story:finished", () => {
            EventBus.emit("screen:change", DOM.pages.demo);
        });
    },

    start() {
        console.log(this.currentScene);
        EventBus.emit("scene:enter", this.currentScene);
        this.render();
    },

    advance()
    {
        if(!(this.currentNode instanceof SpeakerNode))
            return;

        this.currentNode = this.currentNode.next;
    },

    render() {
        if(this.currentNode == null) {
            EventBus.emit("story:finished");
            return;
        }

        const node = this.currentNode;

        node.applyEffects();

        EventBus.emitAsync("node:enter", node);

        if(node instanceof GotoNode)
            this.goto(node.sceneId);
    },

    goto(sceneId) {
        const scene = this.currentScene = this.currentStory.getScene(sceneId);
        this.currentNode = this.currentScene.firstNode;

        EventBus.emit("scene:enter", this.currentScene);

        this.render();
    },

    next() {
        if (Dialogue.isTyping) {
            Dialogue.finishTyping();
            return;
        }

        this.advance();

        if(this.currentNode == null) {
            EventBus.emit("story:finished");
            return;
        }

        this.render();
    },

    choose(option) {
        console.log(option.text);
        option.applyEffects();

        this.currentNode = option.next;
        this.render();
    }
}