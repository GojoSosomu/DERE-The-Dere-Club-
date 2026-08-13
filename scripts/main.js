"use strict";

const get = (selector) => document.querySelector(selector);
const getAll = (selector) => document.querySelectorAll(selector);
const on = (element, event, callback) => {
    if (element) element.addEventListener(event, callback);
};

const CharacterPosition = Object.freeze({
    FAR_LEFT: "far-left",
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    FAR_RIGHT: "far-right"
});

const CharacterPositionValue = Object.freeze({
    "far-left": 0,
    "left": 20,
    "center": 40,
    "right": 60,
    "far-right": 80
});

const CharacterEnum = Object.freeze({
    PENNY: "penny",
    YURI: "yuri",
    JOHN: "john",
    ALI: "ali",
    ERIKA: "erika"
});

const SpeakerEnum = Object.freeze({
    ...CharacterEnum,
    DEFAULT: "default",
    NARRATOR: "narrator"
});

const EmotionEnum = Object.freeze({
    NEUTRAL: "neutral",
    HAPPY: "happy",
    SAD: "sad",
    SHOCK: "shock",
    ANGRY: "angry",
    BLUSH: "blush",
    INFATUATION: "infatuation"
});

let activeStage = [];

const Sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const EventBus = {
    events: {},

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },

    emit(event, ...data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...data));
        }
    },

    async emitAsync(event, ...data) {
        if (!this.events[event])
            return;

        await Promise.all(
            this.events[event].map(callback => callback(...data))
        );
    }
};

const Engine = {
    async initialize() {
        DOM.initialize();
        Storage.initialize();
        Audio.initialize();
        Screen.initialize();
        Settings.initialize();
        Background.initialize();
        CharacterProfile.initialize();
        Dialogue.initialize();
        Character.initialize();
        Choice.initialize();
        Events.initialize();
        Debug.initialize();
        SaveLoad.initialize();
        await StoryLoader.initialize("year1");
    }
};

const DOM = {
    initialize() {
        this.pages = {
            mainMenu: get(".main-menu"),
            gameplay: get(".gameplay"),
            setting: get(".setting"),
            about: get(".about"),
            characterProfile: get(".character-profile"),
            orientationInfo: get(".orientationInfo"),
            persistent: get(".save-load"), 
            demo: get(".demo"),
            loading: get(".loading"),
            start: get(".start"),
        };

        this.currentPage = null;
        this.previousPage = null;

        this.initialButton = get("#initial");
        this.startButton = get("#start");
        this.settingButton = get("#setting");
        this.aboutButton = get("#about");
        this.characterProfileButton = get("#character-profile");
        this.backButton = get("#back-button");
        this.backButtonAbout = get("#back-button-ab");
        this.characterProfileBackButton = get(".character-profile-back");
        this.menuButton = get("#open-menu");
        this.resumeButton = get("#resume");
        this.settingsButton = get("#settings");
        this.saveButton = get("#save");
        this.loadButton = get("#load");
        this.quitButton = get("#quit");

        this.background = get(".background");
        this.stage = get(".stage");
        this.dialogueBox = get(".dialogue-box");
        this.speaker = get(".speaker");
        this.dialogueText = get(".dialogue-body p") || get("#dialogue");
        this.profile = get(".speaker-profile");
        this.nextIndicator = get(".next-indicator");

        this.settingCategory = get(".setting-category");
        this.settingContent = get(".setting-content");
        this.settingOptionButtons = {
            volumeButton: get("#volume"),
            textButton: get("#text")
        };

        this.backButtonSaveLoad = get("#save-load-back");
        this.saveLoadTitle = get(".save-load-header h1");
        this.dataSlots = getAll(".data-slot");
        this.preview = {
            speaker: get("#preview-speaker"),
            dialogue: get("#preview-dialogue"),
            title: get("#preview-title"),
            date: get("#preview-date"),
            profile: get(".preview-speaker .speaker-profile")
        };

        this.characterProfileImg = get(".character-profile-image");
        this.characterProfileName = get(".character-profile-name");
        this.characterDescription = get(".character-profile-description");
        this.characterSpritePreview = get(".character-sprite-preview");
        this.characterList = get(".character-list");

        this.backButtonDemo = get("#demo-back-button");

        this.popups = {
            choice: {
                popup: get(".choice-popup"),
                container: get(".choice-container")
            },

            menu: {
                popup: get(".menu-popup"),
                container: get(".menu-container")
            }
        };
    }
};

const Events = {
    initialize() {
        this.lastTouch = 0;
        on(DOM.startButton, "click", async () => {
            await Audio.bgm.play();

            Screen.open(DOM.pages.loading);

            if (await SaveLoad.continueGame())
                return;

            StoryRunner.initialize("year1");
            StoryRunner.start();

            Screen.open(DOM.pages.gameplay);
        });

        on(DOM.menuButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.resumeButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.settingsButton, "click", () => Screen.open(DOM.pages.setting));
        on(DOM.saveButton, "click", () => {
            EventBus.emit("saveLoad:changeMode", "save");
            Screen.open(DOM.pages.persistent);
        });
        on(DOM.loadButton, "click", () => {
            EventBus.emit("saveLoad:changeMode", "load");
            Screen.open(DOM.pages.persistent);
        });
        on(DOM.quitButton, "click", () => Screen.open(DOM.pages.mainMenu));

        on(DOM.dialogueBox, "click", () => {
            if (
                DOM.popups.choice.popup &&
                DOM.popups.choice.popup.classList.contains("hidden")
            ) {
                EventBus.emit("dialogue:advance");
            }
        });

        on(document, "keydown", (e) => {
            if (e.code !== "Space")
                return;

            e.preventDefault();

            if (
                DOM.popups.choice.popup &&
                DOM.popups.choice.popup.classList.contains("hidden")
            ) {
                EventBus.emit("dialogue:advance");
            }
        });

        on(DOM.popups.choice.container, "click", (e) => {
            if (e.target.classList.contains("choice-button")) {
                EventBus.emit("choice:selected", e.target.choice);
            }
        });

        on(DOM.settingButton, "click", () => Screen.open(DOM.pages.setting));
        on(DOM.aboutButton, "click", () => Screen.open(DOM.pages.about));
        on(DOM.backButtonAbout, "click", () => Screen.back());
        on(DOM.characterProfileButton, "click", () => Screen.open(DOM.pages.characterProfile));
        on(DOM.characterProfileBackButton, "click", () => Screen.back());

        on(DOM.backButtonSaveLoad, "click", () => Screen.back());
        DOM.dataSlots.forEach(slot => {
            on(slot, "click", e => {
                const slot = e.target.closest(".data-slot");
                if(!slot)
                    return;

                SaveLoad.displayPreview(slot.dataset.slot);
            });

            on(slot, "dblclick", e => {
                const slot = e.target.closest(".data-slot");
                if(!slot)
                    return;

                EventBus.emit(
                    slot.classList.contains("save-slot")
                        ? "gameSlot:save"
                        : "gameSlot:load",
                    slot
                );
            });

            on(slot, "touchend", e => {
                const now = Date.now();

                if (now - this.lastTouch < 300) {
                    const slot = e.target.closest(".data-slot");
                    if(!slot)
                        return;

                    EventBus.emit(
                        slot.classList.contains("save-slot")
                            ? "gameSlot:save"
                            : "gameSlot:load",
                        slot
                    );
                }

                this.lastTouch = now;
            });
        });

        on(DOM.backButtonDemo, "click", () => Screen.open(DOM.pages.mainMenu));

        on(DOM.initialButton, "click", () => {
            Audio.bgm.play();
            Screen.open(DOM.pages.mainMenu);
        });

        on(window, "resize", () => Screen.updateOrientation());
    }
};

const Screen = {
    orientation: null,

    initialize() {
        DOM.currentPage = DOM.pages.start;

        this.open(DOM.currentPage);

        EventBus.on("screen:change", (page) => {
            this.open(page);
        });
    },

    updateOrientation() {
        const orientation =
            window.innerWidth > window.innerHeight
                ? "landscape"
                : "portrait";

        if (orientation === this.orientation) return;

        this.orientation = orientation;

        if (orientation === "landscape") {
            this.open(DOM.currentPage);
        } else {
            this.hide(DOM.currentPage);
            this.show(DOM.pages.orientationInfo);
        }
    },

    open(page) {
        if (!page) return;

        this.hideAllPages();
        this.hideAllPopups();

        [DOM.previousPage, DOM.currentPage] = [
            DOM.currentPage,
            page
        ];

        this.show(DOM.currentPage);
    },

    back() {
        if (!DOM.previousPage) return;

        this.hideAllPages();

        [DOM.currentPage, DOM.previousPage] = [
            DOM.previousPage,
            DOM.currentPage
        ];

        this.show(DOM.currentPage);
    },

    show(element) {
        if (element) {
            element.classList.remove("hidden");
            element.classList.add("visible");
        }
    },

    hide(element) {
        if (element) {
            element.classList.remove("visible");
            element.classList.add("hidden");
        }
    },

    toggle(element) {
        element.classList.contains("hidden")
            ? this.show(element)
            : this.hide(element);
    },

    hideAllPopups() {
        Object.values(DOM.popups).forEach(popup => {
            this.hide(popup.popup);
        });
    },

    hideAllPages() {
        Object.values(DOM.pages).forEach(page => this.hide(page));
    }
};

const Storage = {
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

class PersistentData {
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

class GameSlotData {
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

class SceneData {
    constructor(sceneId, nodeIndex, stage) {
        this.sceneId = sceneId;
        this.currentIndex = nodeIndex;
        this.previousIndex = Math.max(0, this.currentIndex - 1);
        this.stage = stage;
    }

    static fromJSON(data) {
        return Object.assign(
            new SceneData(),
            data
        );
    }
}

const Debug = {
    initialize() {
        this.nodeIds = new Map();
        this.nextId = 0;
    },

    getId(node) {
        if(!this.nodeIds.has(node))
            this.nodeIds.set(node, `N${this.nextId++}`);

        return this.nodeIds.get(node);
    },

    toMermaid(sceneMap) {
        this.initialize();

        let output = [
            "flowchart TD"
        ];

        for(const [sceneId, scene] of sceneMap) {
            output.push(`subgraph ${sceneId}`);
            this.walk(scene.firstNode, output, new Set());
            output.push("end");
            output.push("");
        }

        return output.join("\n");
    },

    walk(node, output, visited) {
        if(node == null || visited.has(node))
            return;

        visited.add(node);

        const id = this.getId(node);

        if(node instanceof SpeakerNode) {
            output.push(`${id}{"${id}-${node.index} ${node.speaker}"}`);

            if(node.next) {
                const nextId = this.getId(node.next);
                output.push(`${id} --> ${nextId}`);
                this.walk(node.next, output, visited);
            }
        }

        else if(node instanceof ChoiceNode) {
            output.push(`${id}{"Choice"}`);

            for(const option of node.choices) {
                if(option.next) {
                    const optionId = this.getId(option.next);

                    output.push(`${id} -->|"${option.text}"| ${optionId}`);

                    this.walk(option.next, output, new Set(visited));
                }
            }

            if(node.next) {
                const nextId = this.getId(node.next);

                output.push(`${id} -.-> ${nextId}`);

                this.walk(node.next, output, visited);
            }
        }

        else if(node instanceof GotoNode) {
            output.push(`${id}(["Goto: ${node.sceneId}"])`);

            if(node.next) {
                const nextId = this.getId(node.next);

                output.push(`${id} --> ${nextId}`);

                this.walk(node.next, output, visited);
            }
        }
    }
};

const StoryLoader = {
    async initialize(yearSelection) {
        if (StoryGraph.storyMap.has(yearSelection))
            return;

        const storyData = await JsonLoader.load(`data/scene/${yearSelection}.json`);

        StoryBuilder.initialize(storyData);

        StoryGraph.initialize(
            new Story(
                storyData.id,
                storyData.start,
                GraphBuilder.sceneMap
            )
        );
        console.log(StoryGraph.storyMap.get(yearSelection));
    }
};

const JsonLoader = {
    async load(src) {
        const response = await fetch(src);

        if(!response.ok)
            throw new Error(`Failed to load '${src}'.`);

        return await response.json();
    }
};

const StoryParser = {
    parse(data) {
        switch(data.type) {
            case "speaker":
                return this.parseSpeaker(data);
            case "choice":
                return this.parseChoice(data);
            case "goto":
                return this.parseGoto(data);
        }
    },

    parseGoto(data) {
        const node = new GotoNode(data.scene);

        return node;
    },

    parseSpeaker(data) {
        const node = new SpeakerNode(data);
        node.stage = this.parseStage(data.stage);

        return node;
    },

    parseStage(stage) {
        if(stage == null)
            return null;

        const operations = [];

        if(Object.entries(stage).length === 0) {
            operations.push({
                type: "clear"
            });
            return operations;
        }

        for(const [position, value] of Object.entries(stage)) {
            if(value == null) {
                operations.push({
                    type: "remove",
                    position
                });

                continue;
            }

            operations.push({
                type: "set",
                position,
                character: value.character,
                emotion: value.emotion
            });
        }

        return operations;
    },

    parseChoice(data) {
        const node = new ChoiceNode();

        for(const choice of data.choices) {
            node.choices.push({
                text: choice.text,
                dialogue: choice.dialogue
            });
        }

        return node;
    }
}

const GraphBuilder = {
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

class Node {
    constructor(type) {
        this.type = type;
        this.index = 0;
    }
}

class Story {
    constructor(id, start, scenes) {
        this.id = id;
        this.start = start;

        this.scenes = scenes
    }

    getScene(sceneId) {
        return this.scenes.get(sceneId);
    }

    getStartScene() {
        return this.getScene(this.start);
    }
}

class Scene {
    constructor(id, background, bgm) {
        this.id = id;
        this.background = background;
        this.bgm = bgm;

        this.firstNode = null;
        this.lastNode = null;
    }

    findNode(index) {
        return this.#dfs(this.firstNode, index, new Set());
    }

    #dfs(node, nodeIndex, visited) {
        if(node == null || visited.has(node))
            return null;

        if(node.index === nodeIndex)
            return node;

        visited.add(node);

        if(node instanceof ChoiceNode) {
            for(const choice of node.choices) {
                const found = this.#dfs(
                    choice.next,
                    nodeIndex,
                    visited
                );

                if(found != null)
                    return found;
            }

            return null;
        }

        return this.#dfs(
            node.next,
            nodeIndex,
            visited
        );
    }
}

class LinearNode extends Node {
    constructor(type) {
        super(type);

        this.next = null;
    }
}

class SpeakerNode extends LinearNode {
    constructor(data) {
        super("speaker");

        this.speaker = data.speaker;
        this.text = data.text;
        this.stage = {};
    }
}

class ChoiceNode extends Node {
    constructor(data) {
        super("choice");

        this.choices = [];
    }
}

class ChoiceOption {
    constructor(text) {
        this.text = text;

        this.next = null;
    }
}

class CommandNode extends LinearNode {
    constructor(type) {
        super(type);
    }
}

class GotoNode extends CommandNode {
    constructor(sceneId) {
        super("goto");

        this.sceneId = sceneId;
    }
}

const StoryBuilder = {
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

                    const option = new ChoiceOption(optionData.text);
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

const StoryGraph = {
    storyMap: new Map(),

    initialize(story) {
        this.storyMap.set(story.id, story);
    },

    getStory(yearSelection) {
        return this.storyMap.get(yearSelection);
    },
}

const StoryRunner = {
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

        EventBus.emitAsync("node:enter", this.currentNode);

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
        console.log(option);
        this.currentNode = option.next;
        this.render();
    }
}

const Settings = {
    data: {
        masterVolume: 100,
        vaVolume: 100,
        bgVolume: 100,
        textSpeed: 75,
        tab: "volume"
    },

    initialize() {
        const savedData = Storage.persistentData.settingConfiguration;
        if (savedData)
            this.data = structuredClone(savedData);
        Audio.updateVolume();

        this.refresh();

        on(DOM.settingOptionButtons.volumeButton, "click", () => this.changeContent(DOM.settingOptionButtons.volumeButton));
        on(DOM.settingOptionButtons.textButton, "click", () => this.changeContent(DOM.settingOptionButtons.textButton));
        on(DOM.backButton, "click", () => {
            this.save();
            Screen.back();
        });

        EventBus.on("setting:change", data => Object.assign(this.data, data));
    },

    openCurrentData(tab = this.currentContent) {
        if (tab === "volume") {
            return {
                masterVolume: Number(get("#volume-master").value),
                vaVolume: Number(get("#volume-va").value),
                bgVolume: Number(get("#volume-bg").value),
                tab: "volume"
            };
        }

        if (tab === "text") {
            return {
                textSpeed: Number(get("#text-speed").value),
                tab: "text"
            };
        }

        return {};
    },

    openVolumeSettings() {
        return `
            <div class="setting-control">
                <label for="volume-master">Master Volume</label>
                <input type="range" id="volume-master" name="Master Volume" value="${this.data.masterVolume}">
            </div>

            <div class="setting-control">
                <label for="volume-va">VA Volume</label>
                <input type="range" id="volume-va" name="VA Volume" value="${this.data.vaVolume}">
            </div>

            <div class="setting-control">
                <label for="volume-bg">BG Volume</label>
                <input type="range" id="volume-bg" name="BG Volume" value="${this.data.bgVolume}">
            </div>
        `;
    },

    openTextSettings() {
        return `
            <div class="setting-control">
                <label for="text-speed">Text Speed</label>
                <input type="range" id="text-speed" name="Text Speed" value="${this.data.textSpeed}">
            </div>
        `;
    },

    changeContent(element) {
        if (this.currentContent) {
            EventBus.emit("setting:change", this.openCurrentData());
        }

        DOM.settingCategory.innerHTML = `<h2>${element.textContent}</h2>`;

        this.currentContent = element.id;

        if (this.currentContent === "volume") {
            DOM.settingContent.innerHTML = this.openVolumeSettings();
            on(DOM.settingContent, "input", e => {
                if (e.target.id === "volume-bg") {
                    Settings.data.bgVolume = Number(e.target.value);
                }

                if (e.target.id === "volume-master") {
                    Settings.data.masterVolume = Number(e.target.value);
                }
                
                if (e.target.id === "volume-va") {
                    this.data.vaVolume = Number(e.target.value);
                }
                
                Audio.updateVolume();
            });
        }

        if (this.currentContent === "text") {
            DOM.settingContent.innerHTML = this.openTextSettings();
            on(DOM.settingContent, "input", e => {
                if (e.target.id === "text-speed") {
                    this.data.textSpeed = Number(e.target.value);
                }
            });
        }
    },

    save() {
        this.data.tab = this.currentContent;
        EventBus.emit("data:save");
    },

    refresh() {
        this.changeContent(DOM.settingOptionButtons[this.data.tab + "Button"]);
    }
};

const Background = {
    initialize() {
        EventBus.on("scene:enter", scene => {
            Background.show(scene.background);
        });
    },

    show(background) {
        DOM.background.src = this.getBackgroundImageSrc(background);
    },

    getBackgroundImageSrc(background) {
        return `images/background/${background}.jpg`;
    }
}

const Dialogue = {
    isTyping: false,
    skipRequested: false,

    initialize() {
        this.currentText = "";

        EventBus.on("node:enter", async node => {
            if(node instanceof SpeakerNode)
                await Dialogue.render(node.text, node.speaker);
        });
    },

    getProfileImageSrc(character) {
        return `images/profiles/${character}_profile.png`;
    },

    async render(text, speakerKey) {
        if (!DOM.dialogueBox) return;

        if (speakerKey) {
            DOM.speaker.textContent = speakerKey.charAt(0).toUpperCase() + speakerKey.slice(1);
            console.log(speakerKey);

            if (CharacterEnum[speakerKey.toUpperCase()]) {
                DOM.profile.src = this.getProfileImageSrc(speakerKey.toLowerCase());
                DOM.profile.classList.remove("hidden");
                DOM.profile.classList.add("visible");
            } else {
                DOM.profile.classList.remove("visible");
                DOM.profile.classList.add("hidden");
            }
        } else {
            DOM.speaker.textContent = "";
            DOM.profile.classList.remove("visible");
            DOM.profile.classList.add("hidden");
        }

        this.currentText = text;
        console.log(this.currentText);
        await this.type(this.currentText, speakerKey);
    },

    write(text) {
        DOM.dialogueText.textContent = text;
    },

    async type(text, speaker) {
        this.isTyping = true;
        this.skipRequested = false;

        for (let i = 0; i <= text.length && this.isTyping; i++) {
            this.write(text.slice(0, i));

            if (text[i] && text[i] !== " " && i % 4 === 0) {
                Audio.playVoiceBlip(speaker);
            }

            const normalized = this.inverseLerp(Number(Settings.data.textSpeed), 0, 100);

            const delay = 50 - normalized * (50 - 10);

            await Sleep(delay);
        }

        this.isTyping = false;
    },

    inverseLerp(value, min, max) {
        return (value - min) / (max - min);
    },

    finishTyping() {
        this.skipRequested = true;
        this.write(this.currentText);
        this.isTyping = false;
    }
};

const Character = {
    initialize() {
        EventBus.on("node:enter", node => {
            if (node.stage)
                this.applyStage(node.stage);

            if (node instanceof SpeakerNode)
                this.highlightSpeaker(node.speaker);
        });
    },

    getCharacterImageSrc(character, emotion) {
        return `images/characters/${character}/${character}_${emotion}.png`;
    },

    applyStage(operations) {
        for (const operation of operations) {
            switch (operation.type) {
                case "set":
                    this.setCharacter(
                        operation.character,
                        operation.emotion,
                        operation.position
                    );
                    break;
                case "remove":
                    this.removeCharacter(operation.position);
                    break;
                case "clear":
                    this.clearStage();
                    break;
            }
        }
    },

    setCharacter(character, emotion, position) {
        const existing = activeStage.find(
            entry => entry.character === character
        );

        if (!existing) {
            this.spawnCharacter(
                character,
                emotion,
                position
            );

            return;
        }

        const img = document.querySelector(`.character[data-character="${character}"]`);

        if (!img)
            return;

        if (existing.emotion !== emotion) {
            img.src = this.getCharacterImageSrc(
                character,
                emotion
            );

            existing.emotion = emotion;
        }

        if (existing.position !== position) {
            this.moveCharacter(
                img,
                existing,
                position
            );
        }
    },

    spawnCharacter(character, emotion, position) {
        const img = document.createElement("img");

        img.src = this.getCharacterImageSrc(
            character,
            emotion
        );

        img.className = "character";

        img.dataset.character = character;
        img.dataset.position = position;

        img.style.left = `${CharacterPositionValue[position]}%`;

        DOM.stage.appendChild(img);

        requestAnimationFrame(() => {
            img.classList.add("on-stage");
        });

        activeStage.push({
            character,
            emotion,
            position,
            element: img
        });
    },

    removeCharacter(position) {
        const index = activeStage.findIndex(
            entry => entry.position === position
        );

        if (index === -1)
            return;

        const data = activeStage[index];

        const img = document.querySelector(
            `.character[data-character="${data.character}"]`
        );

        if (img) {
            img.classList.remove("on-stage");
            img.classList.add("leaving");

            img.addEventListener(
                "transitionend",
                () => img.remove(),
                { once: true }
            );
        }

        activeStage.splice(index, 1);
    },

    moveCharacter(stageData, position) {
        stageData.element.style.left = `${CharacterPositionValue[position]}%`;

        stageData.element.dataset.position = position;

        stageData.position = position;
    },

    clearStage() {
        activeStage.forEach(actor => {
            if (actor.character != null)
                this.removeCharacter(actor.position);
        });
    },

    restoreStage() {
        DOM.stage.innerHTML = ``;
        activeStage.forEach(actor => {
            if (!actor.character)
                return;

            this.spawnCharacter(
                actor.character,
                actor.emotion,
                actor.position
            );
        });
    },

    highlightSpeaker(activeSpeakerKey) {
        activeStage.forEach(actor => {
            const img = actor.element;

            if (!img)
                return;

            img.classList.toggle(
                "not-speaking",
                actor.character !== activeSpeakerKey
            );
        });
    }
};

const Choice = {
    initialize() {
        EventBus.on("choices:triggered", (options) => this.show(options));
        EventBus.on("choice:selected", () => this.hideThePopUp());

        EventBus.on("node:enter", node => {
            if(node instanceof ChoiceNode)
                Choice.show(node.choices);
        });
    },

    show(options) {
        DOM.popups.choice.container.innerHTML = "";

        options.forEach(option => {
            const button = document.createElement("button");
            button.className = "button choice-button";
            button.textContent = option.text;
            button.choice = option;

            DOM.popups.choice.container.appendChild(button);
        });

        Screen.show(DOM.popups.choice.popup);
    },

    hideThePopUp() {
        Screen.hide(DOM.popups.choice.popup);
    }
};

const CharacterProfile = {
    initialize() {
        on(DOM.characterProfileButton, "click", CharacterProfile.refillCharacterList);
    },

    displayCharacter() {

    },

    refillCharacterList() {
        DOM.characterList.replaceChildren();
        Object.values(CharacterEnum).forEach(character => {
            const characterButton = document.createElement("button");
            characterButton.className = "button character-list-button";
            characterButton.dataset.character = character;
            characterButton.textContent = character.slice(0, 1).toUpperCase() + character.slice(1);
            DOM.characterList.appendChild(characterButton);
        });
    }
};

const SaveLoad = {
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

        const currentNode = scene.findNode(sceneData.currentIndex);
        const previousNode = scene.findNode(sceneData.previousIndex);

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

        const stageData = activeStage.map(actor => ({
            character: actor.character,
            emotion: actor.emotion,
            position: actor.position
        }));

        const sceneData = new SceneData(
            scene.id,
            currentNode.index,
            stageData
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

        StoryRunner.currentScene = scene;
        StoryRunner.currentNode = scene.findNode(
            sceneData.currentIndex
        );

        activeStage = structuredClone(sceneData.stage);
        Character.restoreStage();
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
    }
};

const Audio = {
    VoiceConfig: {
        default: 1.0,
        penny: 1.0,
        yuri: 0.85,
        john: 1.15,
        ali: 1.05,
        erika: 0.95,
        narrator: 0.7
    },

    initialize() {
        this.voice = {};

        this.bgm = new window.Audio("audios/backgroundMusic/Main_Lobby.mp3");
        this.bgm.loop = true;
        this.updateVolume();

        EventBus.on("scene:enter", scene => {
            if (scene.bgm)
                this.playBGM(scene.bgm);
        });
    },

    playBGM(src) {
        const path = `audios/backgroundMusic/${src}.mp3`;

        if (this.bgm.src.endsWith(path))
            return;

        this.bgm.src = path;
        this.bgm.currentTime = 0;
        this.updateVolume();

        if (this.isAudioAllowed) {
            this.bgm.play().catch(e => console.error("BGM Play failed:", e));
        }
    },

    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
    },

    playSFX(src) {
        console.log(`Playing sound effect: ${src}`);
    },

    playVoiceBlip(speaker) {
        const trueSpeaker = speaker && SpeakerEnum[speaker.toUpperCase()] ? speaker : SpeakerEnum.DEFAULT;

        if (!(trueSpeaker in this.voice)) {
            this.voice[trueSpeaker] = new window.Audio(
                `audios/voice/${trueSpeaker}.wav`
            );
        }        

        const audio = this.voice[trueSpeaker];
        const baseRate = this.VoiceConfig[trueSpeaker] ?? 1;

        audio.currentTime = 0;
        audio.playbackRate = 0.2 + Math.random() * baseRate;
        audio.volume = (Number(Settings.data.masterVolume) / 100) * (Number(Settings.data.vaVolume) / 100);
        
        audio.play().catch(e => console.error("Voice play failed:", e));
    },

    updateVolume() {
        this.bgm.volume = (Settings.data.masterVolume / 100) * (Settings.data.bgVolume / 100);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await Engine.initialize();
});