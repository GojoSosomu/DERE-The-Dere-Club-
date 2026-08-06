"use strict";

const get = (selector) => document.querySelector(selector);
const getAll = (selector) => document.querySelectorAll(selector);
const on = (element, event, callback) => {
    if (element) element.addEventListener(event, callback);
};

const CharacterEnum = Object.freeze({
    PENNY: "penny",
    YURI: "yuri",
    JOHN: "john",
    ALI: "ali",
    ERIKA: "erika",
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

let activeStage = [
    { slotId: "far-left",  character: null },
    { slotId: "left",      character: null },
    { slotId: "center",    character: null },
    { slotId: "right",     character: null },
    { slotId: "far-right", character: null }
];

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
    }
};

const Engine = {
    async initialize() {
        DOM.initialize();
        Screen.initialize();
        Settings.initialize();
        Background.initialize();
        Dialogue.initialize();
        Character.initialize();
        Choice.initialize();
        Events.initialize();
        Audio.initialize();
        Debug.initialize();
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
            orientationInfo: get(".orientationInfo"),
            demo: get(".demo"),
        };

        this.currentPage = null;
        this.previousPage = null;

        this.startButton = get("#start");
        this.settingButton = get("#setting");
        this.aboutButton = get("#about");
        this.backButton = get("#back-button");
        this.backButtonAbout = get("#back-button-ab");
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
        on(DOM.startButton, "click", () => {
            StoryRunner.initialize("year1");
            StoryRunner.start();
            Screen.open(DOM.pages.gameplay);
        });

        on(DOM.menuButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.resumeButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.settingsButton, "click", () => Screen.open(DOM.pages.setting));
        on(DOM.saveButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.loadButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.quitButton, "click", () => Screen.open(DOM.pages.mainMenu));

        on(DOM.dialogueBox, "click", () => {
            if (
                DOM.popups.choice.popup &&
                DOM.popups.choice.popup.classList.contains("hidden")
            ) {
                EventBus.emit("dialogue:clicked");
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

        window.onresize = () => {
            Screen.updateOrientation();
        };
    }
};

const Screen = {
    orientation: null,

    initialize() {
        DOM.currentPage = DOM.pages.mainMenu;

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
    initialize() {
        this.#gameSlot = {
            slot1: null,
            slot2: null,
            slot3: null,
            slot4: null,
        };

        EventBus.on("data:save", data => this.save(data));
        EventBus.on("data:load", () => this.load());
    },

    save(data) {
        localStorage.setItem(
            "save",
            JSON.stringify(data)
        );
    },

    load() {
        const data = JSON.parse(localStorage.getItem("save"));

        return PersistentData.fromJSON(data);
    }
};

class PersistentData {
    constructor(settingConfiguration, thumbnailData) {
        this.settingConfiguration = settingConfiguration;
        this.thumbnailData = thumbnailData;
    }

    static fromJSON(data) {
        let persistent = Object.assign(
            new PersistentData(),
            data
        );

        persistent.thumbnailData = SceneData.fromJSON(persistent.thumbnailData);

        return persistent;
    }
}

class ThumbnailData {
    constructor(title, playTime, sceneData) {
        this.title = title;
        this.timestamp = Date.now();
        this.playTime = playTime;
        this.sceneData = sceneData;
    }

    static fromJSON(data) {
        let thumbnail = Object.assign(
            new ThumbnailData(),
            data
        );

        thumbnail.sceneData = SceneData.fromJSON(thumbnail.sceneData);

        return thumbnail;
    }
}

class SceneData {
    constructor(sceneId, nodeIndex) {
        this.sceneId = sceneId;
        this.nodeIndex = nodeIndex;
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
            output.push(`${id}{"${id} ${node.speaker}"}`);

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
        const storyData = await JsonLoader.load(`../data/scene/${yearSelection}.json`);

        StoryBuilder.initialize(storyData);

        console.log(GraphBuilder.sceneMap);

        const storyMap = new Map();
        storyMap.set(storyData.id,
            new Story(
                storyData.id,
                storyData.start,
                GraphBuilder.sceneMap
            )
        );

        StoryGraph.initialize(storyMap);
        console.log(StoryGraph.storyMap.get("year1"));
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
    parse(data, index) {
        switch(data.type) {
            case "speaker":
                return this.parseSpeaker(data, index);
            case "choice":
                return this.parseChoice(data, index);
            case "goto":
                return this.parseGoto(data, index);
        }
    },

    parseGoto(data, index) {
        const node = new GotoNode(data.scene);
        node.index = index++;

        return node;
    },

    parseSpeaker(data, index) {
        const node = new SpeakerNode(data);
        node.stage = this.parseStage(data.stage);
        node.index = index++;

        return node;
    },

    parseStage(stage) {
        if(stage == null)
            return null;

        const operations = [];

        if(Object.keys(stage).length === 0) {
            operations.push({
                type: "clear"
            });

            return operations;
        }

        operations.push({
            type: "clear"
        });

        for(const [slot, value] of Object.entries(stage)) {
            if(value == null)
                continue;
            else {
                operations.push({
                    type: "set",
                    slot,
                    character: value.character,
                    emotion: value.emotion
                });
            }
        }

        return operations;
    },

    parseChoice(data, index) {
        const node = new ChoiceNode();
        node.index = index++;

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
        this.index = -1;
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
    constructor(id, background) {
        this.id = id;
        this.background = background;

        this.firstNode = null;
        this.lastNode = null;
    }

    findNode(index) {
        return this.#dfs(this.firstNode, index);
    }

    #dfs(node, nodeIndex) {
        if (node == null)
            return null;

        if (node.index === nodeIndex)
            return node;

        if (node instanceof ChoiceNode) {
            for (const choice of node.choices) {
                const found = this.#dfs(choice.next, nodeIndex);

                if (found != null)
                    return found;
            }

            return null;
        }

        return this.#dfs(node.next, nodeIndex);
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
                sceneData.background
            );

            GraphBuilder.beginScene(scene);

            this.buildDialogue(sceneId, sceneData.dialogue);
        }

        GraphBuilder.finalize();
    },

    buildDialogue(sceneId, dialogue, isBranch = false, onContinue = null, index = -1) {
        let firstNode = null;
        let previousNode = null;
        let deadEndNodes = [];

        for(let i = 0; i < dialogue.length; i++) {
            const data = dialogue[i];
            const node = StoryParser.parse(data, index);

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
                        true
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
    initialize(storyMap) {
        this.storyMap = storyMap;
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

        EventBus.on("dialogue:clicked", () => this.next());
        EventBus.on("choice:selected", option => this.choose(option));
        EventBus.on("story:finished", () => {
            EventBus.emit("screen:change", DOM.pages.demo);
        });
    },

    start() {
        EventBus.emit("background:show", this.currentScene.background);
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

        EventBus.emit("node:enter", this.currentNode);

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
        sfxVolume: 100,
        bgVolume: 100,
        textSpeed: 50,
        tab: "volume"
    },

    initialize() {
        this.refresh();

        on(DOM.settingOptionButtons.volumeButton, "click", () => this.changeContent(DOM.settingOptionButtons.volumeButton));
        on(DOM.settingOptionButtons.textButton, "click", () => this.changeContent(DOM.settingOptionButtons.textButton));
        on(DOM.backButton, "click", () => Screen.back());

        EventBus.on("setting:change", data => Object.assign(this.data, data));
    },

    openCurrentData() {
        if (this.currentContent === "volume") {
            return {
                masterVolume: get("#volume-master").value,
                sfxVolume: get("#volume-sfx").value,
                bgVolume: get("#volume-bg").value
            };
        }

        if (this.currentContent === "text") {
            return {
                textSpeed: get("#text-speed").value
            };
        }
    },

    openVolumeSettings() {
        return `
            <div class="setting-control">
                <label for="volume-master">Master Volume</label>
                <input type="range" id="volume-master" name="Master Volume" value="${this.data.masterVolume}">
            </div>

            <div class="setting-control">
                <label for="volume-sfx">SFX Volume</label>
                <input type="range" id="volume-sfx" name="SFX Volume" value="${this.data.sfxVolume}">
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
        }

        if (this.currentContent === "text") {
            DOM.settingContent.innerHTML = this.openTextSettings();
        }
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
    initialize() {
        EventBus.on("node:enter", node => {
            if(node instanceof SpeakerNode)
                Dialogue.render(node.text, node.speaker);
        });
    },

    getProfileImageSrc(character) {
        return `images/profiles/${character}_profile.png`;
    },

    render(text, speakerKey) {
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

        console.log(text);
        DOM.dialogueText.textContent = text;
    }
};

const Character = {
    initialize() {
        EventBus.on("node:enter", node => {
            if(node.stage)
                Character.applyStage(node.stage);
        });
    },

    getCharacterImageSrc(character, emotion) {
        return `images/characters/${character}/${character}_${emotion}.png`;
    },

    spawnCharacter(character, emotion, slotId, from = "bottom") {
        let targetSlot = document.getElementById(slotId);
        if (!targetSlot) return;

        targetSlot.innerHTML = "";
        this.enterCharacter(slotId, this.getCharacterImageSrc(character, emotion), from);

        let stageSlot = activeStage.find(slot => slot.slotId === slotId);
        if (stageSlot) {
            stageSlot.character = character;
        }
    },

    enterCharacter(slotId, imgSrc, from = "bottom") {
        const slot = document.getElementById(slotId);
        const img = document.createElement("img");
        img.src = imgSrc;
        img.className = `character enter-from-${from} not-speaking`;
        slot.appendChild(img);

        requestAnimationFrame(() => {
            img.classList.add("on-stage");
            img.classList.remove("not-speaking");
        });
    },

    leaveCharacter(slot) {
        const character = slot.querySelector("img");
        if (!character) return;

        character.classList.remove("on-stage");
        character.classList.add("not-speaking");

        character.addEventListener("transitionend", () => {
            slot.innerHTML = "";
        }, { once: true });
    },

    clearStage() {
        activeStage.forEach(slot => {
            this.removeCharacter(slot);
        });
    },

    removeCharacter(slot) {
        const slotEl = document.getElementById(slot.slotId);

        if (slotEl)
            this.leaveCharacter(slotEl);

        console.log(slot);
        slot.character = null;
    },

    applyStage(operations) {
        for(const operation of operations) {
            switch(operation.type) {
                case "clear":
                    this.clearStage();
                    break;

                case "set":
                    this.spawnCharacter(
                        operation.character,
                        operation.emotion,
                        operation.slot
                    );
                    break;
            }
        }
    },

    highlightSpeaker(activeSpeakerKey) {
        activeStage.forEach(slot => {
            const slotEl = document.getElementById(slot.slotId);
            if (!slotEl) return;

            const img = slotEl.querySelector("img");
            if (!img) return;

            if (slot.character === activeSpeakerKey) {
                img.classList.remove("not-speaking");
            } else {
                img.classList.add("not-speaking");
            }
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

const Audio = {
    initialize() {
        EventBus.on("step:rendered", (step) => {
            if (step.bgm) this.playBGM(step.bgm);
            if (step.sfx) this.playSFX(step.sfx);
        });
    },
    
    playBGM(src) {
        console.log(`Playing background music: ${src}`);
    },
    
    playSFX(src) {
        console.log(`Playing sound effect: ${src}`);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Engine.initialize();
});