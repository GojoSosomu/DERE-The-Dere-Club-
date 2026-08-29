import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';
import { Storage, SceneData, GameSlotData } from './storage.js';
import { GraphBuilder } from './graphBuilder.js';
import { StoryRunner } from './storyRunner.js';
import { StoryLoader } from './storyLoader.js';
import { Character } from './character.js';
import { Dialogue } from './dialogue.js';
import { Screen } from './screen.js';
import { Relationship } from './relationship.js';
import { SpeakerNode } from './storyNodes.js';

export const SaveLoad = {
    initialize() {
        EventBus.on("saveLoad:changeMode", mode => this.changeMode(mode));
        EventBus.on("gameSlot:save", slot => this.saveSlot(slot.dataset.slot));
        EventBus.on("gameSlot:load", slot => this.loadSlot(slot.dataset.slot));

        this.displaySlots();
    },

    changeMode(mode) {
        for(const slot of DOM.dataSlots) {
            slot.classList.toggle("save-slot", mode === "save");
            slot.classList.toggle("load-slot", mode === "load");
        }
    },

    displaySlots() {
        for(const slot of DOM.dataSlots) {
            const slotId = slot.dataset.slot;
            const gameSlot = Storage.getGameSlot(slotId);

            const title = slot.querySelector(".slot-title");
            const info = slot.querySelector(".slot-info");

            if(!gameSlot) {
                title.textContent = slotId.toUpperCase();
                info.textContent = "Empty";
                info.classList.add("empty");
                continue;
            }

            title.textContent = gameSlot.title;
            info.textContent = new Date(gameSlot.timestamp).toLocaleString();
            info.classList.remove("empty");
        }
    },

    displayPreview(slotId) {
        const gameSlotData = Storage.getGameSlot(slotId);

        if(!gameSlotData)
            return;

        const sceneData = gameSlotData.sceneData;
        const scene = GraphBuilder.sceneMap.get(sceneData.sceneId);

        const currentNode = scene.findNode(sceneData.currentId);
        const previousNode = scene.findNode(this.getPreviousId(sceneData.currentId));
        
        let chosenNode = currentNode;

        if(!(currentNode instanceof SpeakerNode))
            chosenNode = previousNode;

        DOM.preview.title.textContent = gameSlotData.title;
        DOM.preview.date.textContent = gameSlotData.timestamp;
        DOM.preview.speaker.textContent = chosenNode?.speaker ?? "";
        DOM.preview.dialogue.textContent = chosenNode?.text ?? "";

        if(chosenNode?.speaker) {
            DOM.preview.profile.src =
                Dialogue.getProfileImageSrc(
                    chosenNode.speaker
                );

            DOM.preview.profile.classList.remove("hidden");
        }
    },

    saveSlot(slotId) {
        const scene = StoryRunner.currentScene;
        const currentNode = StoryRunner.currentNode;

        const stageData = Character.getStagePreview();

        const sceneData = new SceneData(
            scene.id,
            currentNode.id,
            stageData,
            structuredClone(Relationship.data)
        );

        Storage.updateGameSlot(
            slotId,
            new GameSlotData(
                StoryRunner.currentStory.id,
                scene.id,
                sceneData
            )
        );

        Storage.currentSlot = slotId;

        EventBus.emit("data:save");

        this.displaySlots();
        this.displayPreview(slotId);
    },

    loadSlot(slotId) {
        const gameSlot = Storage.getGameSlot(slotId);

        if(!gameSlot)
            return;

        Storage.currentSlot = slotId;

        const sceneData = gameSlot.sceneData;
        const scene = GraphBuilder.sceneMap.get(sceneData.sceneId);

        const currentNode = scene.findNode(sceneData.currentId);
        const previousNode = scene.findNode(this.getPreviousId(sceneData.currentId));
        
        let chosenNode = currentNode;

        if(!(currentNode instanceof SpeakerNode))
            chosenNode = previousNode;

        StoryRunner.currentScene = scene;
        StoryRunner.currentNode = chosenNode;

        Relationship.data = structuredClone(
            sceneData.relationship
        );

        Character.restoreStage(structuredClone(sceneData.stage));

        Screen.open(DOM.pages.gameplay);

        StoryRunner.start();
    },

    async continueGame() {
        const slotId = Storage.currentSlot;
        if (!slotId)
            return false;

        const gameSlot = Storage.getGameSlot(slotId);
        if (!gameSlot)
            return false;

        await StoryLoader.initialize(gameSlot.yearSelection);
        StoryRunner.initialize(gameSlot.yearSelection);
        this.loadSlot(slotId);

        return true;
    },

    getPreviousId(nodeId) {
        let text = nodeId.split("/");
        let index = Math.max(0, Number(text.pop()) - 1);
        return `${text}/${index}`;
    }
};