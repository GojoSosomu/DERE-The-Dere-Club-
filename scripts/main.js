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
    ERI: "eri",
    ANGEL: "angel"
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
        Dialogue.initialize();
        Character.initialize();
        Choice.initialize();
        Events.initialize();
        Audio.initialize();
        await StoryLoader.initialize("../data/scene/year1.json");
    }
};

const DOM = {
    initialize() {
        this.pages = {
            mainMenu: get(".main-menu"),
            gameplay: get(".gameplay"),
            setting: get(".setting"),
            about: get(".about"),
            orientationInfo: get(".orientationInfo"), // this catches the device when on portrait device
        };

        this.currentPage = null;
        this.previousPage = null;

        this.startButton = get("#start");
        this.settingButton = get("#setting");
        this.aboutButton = get("#about");
        this.backButton = get("#back-button"); // this is the button on settings/about scene
        this.backButtonAbout = get("#back-button-ab");
        this.menuButton = get("#open-menu");
        this.resumeButton = get("#resume");
        this.settingsButton = get("#settings");
        this.saveButton = get("#save");
        this.loadButton = get("#load");
        this.quitButton = get("#quit");

        this.stage = get(".stage");
        this.dialogueBox = get(".dialogue-box");
        this.speaker = get(".speaker");
        this.dialogueText = get(".dialogue-content p") || get("#dialogue");
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
                container: get(".choice-options")
            },

            menu: {
                popup: get(".menu-popup"),
                container: get(".menu-options")
            }
        };
    }
};

const Events = {
    initialize() {
        on(DOM.startButton, "click", () => Screen.open(DOM.pages.gameplay));
        on(DOM.menuButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.resumeButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.settingsButton, "click", () => Screen.open(DOM.pages.setting));
        on(DOM.saveButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.loadButton, "click", () => Screen.toggle(DOM.popups.menu.popup));
        on(DOM.quitButton, "click", () => Screen.open(DOM.pages.mainMenu));

        on(DOM.dialogueBox, "click", () => {
            if (DOM.choicePopup && DOM.choicePopup.classList.contains("hidden")) {
                EventBus.emit("dialogue:clicked");
            }
        });

        on(DOM.choiceContainer, "click", (e) => {
            if (e.target.classList.contains("choice-button")) {
                EventBus.emit("choice:selected", e.target.dataset.target);
            }
        });
        
        on(DOM.settingButton, "click", () => Screen.open(DOM.pages.setting));
        on(DOM.aboutButton, "click", () => Screen.open(DOM.pages.about));
        on(DOM.backButtonAbout, "click", () => Screen.back());
        window.onresize = () => {
            Screen.updateOrientation();
        }
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

const StoryLoader = {
    async initialize(storySrc) {
        const storyData = await JsonLoader.load(storySrc);

        StoryBuilder.initialize(storyData);

        console.log(GraphBuilder.sceneMap);
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
                return new SpeakerNode(data);
            case "choice":
                return new ChoiceNode(data);
            case "goto":
                return new GotoNode(data.scene);
        }
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

    connectNodes(node) {
        if(this.previousNode == null)
            this.currentScene.firstNode = node;
        else 
            this.previousNode.next = node;

        if(node.type == "choice")
            return;

        this.previousNode = node;

        if(node instanceof GotoNode)
            this.pendingGoto.push(node);
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
    }
}

class Scene {
    constructor(id, background) {
        this.id = id;
        this.background = background;

        this.firstNode = null;
        this.lastNode = null;
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
        this.position = data.position ?? null;
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

    buildDialogue(sceneId, dialogue) {
        let firstNode = null;

        for(const data of dialogue) {
            const previous = GraphBuilder.previousNode;

            GraphBuilder.previousNode = null;
            const node = StoryParser.parse(data);

            if(firstNode == null)
                firstNode = node;

            

            if(data.type === "choice") {
                GraphBuilder.connectNodes(node);
                for(const choice of data.choices)
                    GraphBuilder.previousNode = this.buildDialogue(sceneId, choice.dialogue);
                    node.choices.push(
                        GraphBuilder.previousNode
                    );

                    GraphBuilder.previousNode = previous;
            } else
                GraphBuilder.connectNodes(node);
        }

        return firstNode;
    }
}

const StoryRunner = {
    initialize(storyGraph) {

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

const Dialogue = {
    initialize() {
        EventBus.on("step:rendered", (step) => {
            this.render(step.text, step.speaker);
        });
    },

    getProfileImageSrc(character) {
        return `images/profiles/${character}_profile.png`;
    },

    render(text, speakerKey) {
        if (!DOM.dialogueBox) return;

        if (speakerKey) {
            DOM.speaker.textContent = speakerKey.charAt(0).toUpperCase() + speakerKey.slice(1);
            if (DOM.profile) {
                DOM.profile.src = this.getProfileImageSrc(speakerKey);
                DOM.profile.classList.remove("hidden");
                DOM.profile.classList.add("visible");
            }
        } else {
            DOM.speaker.textContent = "";
            if (DOM.profile) {
                DOM.profile.classList.remove("visible");
                DOM.profile.classList.add("hidden");
            }
        }

        if (DOM.dialogueText) {
            DOM.dialogueText.textContent = text;
        }
    }
};

const Character = {
    initialize() {
        EventBus.on("step:rendered", (step) => {
            if (step.clearStage) this.clearStage();
            if (step.spawn) {
                step.spawn.forEach(s => this.spawnCharacter(s.character, s.emotion, s.slotId, s.from));
            }
            this.highlightSpeaker(step.speaker);
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
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = `character enter-from-${from} not-speaking`;
        slot.appendChild(img);
        
        requestAnimationFrame(() => {
            img.classList.add('on-stage');
            img.classList.remove('not-speaking');
        });
    },

    clearStage() {
        activeStage.forEach(slot => {
            const slotEl = document.getElementById(slot.slotId);
            if (slotEl) slotEl.innerHTML = "";
            slot.character = null;
        });
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
        EventBus.on("choice:selected", (targetNodeKey) => this.select(targetNodeKey));
    },

    show(options) {
        DOM.popups.choice.container.innerHTML = ""; 
        options.forEach(option => {
            const button = document.createElement("button");
            button.className = "choice-button";
            button.textContent = option.text;
            button.dataset.target = option.target;
            DOM.popups.choice.container.appendChild(button);
        });
        Screen.show(DOM.popups.choice.popup);
    },

    select(targetNodeKey) {
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
