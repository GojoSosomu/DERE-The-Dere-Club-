import { EventBus } from './eventBus.js';
import { Settings } from './settings.js';

export const Storage = {
    currentSlot: null,

    initialize() {
        this.persistentData = new PersistentData(
            Settings.data, 
            {
                slot1: null,
                slot2: null,
                slot3: null,
                slot4: null,
            }
        );

        this.load();

        EventBus.on("data:save", () => this.save());
        EventBus.on("data:load", () => this.load());
    },

    save() {
        this.persistentData.settingConfiguration = structuredClone(Settings.data);

        localStorage.setItem(
            "save",
            JSON.stringify(this.persistentData)
        );

        localStorage.setItem(
            "currentSlot",
            this.currentSlot
        );
    },

    load() {
        const data = JSON.parse(localStorage.getItem("save"));

        this.currentSlot = localStorage.getItem("currentSlot");
        
        if(data == null)
            return;

        this.persistentData = PersistentData.fromJSON(data);
        EventBus.emit("setting:change", this.persistentData.settingConfiguration);
    },

    updateGameSlot(slotId, gameSlotData) {
        this.persistentData.gameSlot[slotId] = gameSlotData;
    },

    getGameSlot(slotId) {
        return this.persistentData.gameSlot[slotId];
    },

    clearGameSlot(slotId) {
        this.persistentData.gameSlot[slotId] = null;
    }
};

export class PersistentData {
    constructor(settingConfiguration, gameSlot) {
        this.settingConfiguration = settingConfiguration;
        this.gameSlot = gameSlot;
    }

    static fromJSON(data) {
        const persistent = Object.assign(
            new PersistentData(),
            data
        );

        for(const slotId in persistent.gameSlot) {
            if(persistent.gameSlot[slotId]) {
                persistent.gameSlot[slotId] =GameSlotData.fromJSON(persistent.gameSlot[slotId]);
            }
        }

        return persistent;
    }
}

export class GameSlotData {
    constructor(yearSelection, title, sceneData) {
        this.yearSelection = yearSelection;
        this.title = title;
        this.timestamp = Date.now();
        this.sceneData = sceneData;
    }

    static fromJSON(data) {
        const gameSlot = Object.assign(
            new GameSlotData(),
            data
        );

        gameSlot.sceneData = SceneData.fromJSON(gameSlot.sceneData);

        return gameSlot;
    }
}

export class SceneData {
    constructor(sceneId, nodeIndex, stage, relationship) {
        this.sceneId = sceneId;
        this.currentIndex = nodeIndex;
        this.previousIndex = Math.max(0, this.currentIndex - 1);
        this.stage = stage;
        this.relationship = relationship;
    }

    static fromJSON(data) {
        return Object.assign(
            new SceneData(),
            data
        );
    }
}

