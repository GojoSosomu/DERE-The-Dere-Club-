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
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

const Engine = {
    initialize() {
        DOM.initialize();
        Screen.initialize();
        Dialogue.initialize();
        Character.initialize();
        Choice.initialize();
        Events.initialize();
        Audio.initialize();
    }
};

const DOM = {
    initialize() {
        this.pages = {
            mainMenu: get(".main-menu"),
            gameplay: get(".gameplay"),
            setting: get(".setting")
        };

        this.startButton = get("#start");
        this.settingButton = get("#setting");
        this.aboutButton = get("#about");
        this.menuButton = get("#open-menu");

        this.stage = get(".stage");
        this.dialogueBox = get(".dialogue-box");
        this.speaker = get(".speaker");
        this.dialogueText = get(".dialogue-content p") || get("#dialogue");
        this.profile = get(".speaker-profile");
        this.nextIndicator = get(".next-indicator");

        this.choicePopup = get(".choice-popup");
        this.choiceContainer = get(".choice-options");
    }
};

const Events = {
    initialize() {
        on(DOM.startButton, "click", () => Screen.openGameplay());
        on(DOM.menuButton, "click", () => Screen.openMainMenu());
        
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
        
        on(DOM.settingButton, "click", () => Screen.openSetting());
        on(DOM.aboutButton, "click", () => console.log("About"));
    }
};

const Screen = {
    initialize() {
        this.show(DOM.pages.mainMenu);
        this.hide(DOM.pages.gameplay);
        
        EventBus.on("screen:change", (target) => {
            if (target === "gameplay") this.openGameplay();
            if (target === "menu") this.openMainMenu();
        });
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

    hideAllPages() {
        Object.values(DOM.pages).forEach(page => this.hide(page));
    },

    openMainMenu() {
        this.hideAllPages();
        this.show(DOM.pages.mainMenu);
    },

    openGameplay() {
        this.hideAllPages();
        this.show(DOM.pages.gameplay);
    },
    
    openSetting() {
        this.hideAllPages();
        this.show(DOM.pages.setting);
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
        DOM.choiceContainer.innerHTML = ""; 
        options.forEach(option => {
            const button = document.createElement("button");
            button.className = "choice-button";
            button.textContent = option.text;
            button.dataset.target = option.target;
            DOM.choiceContainer.appendChild(button);
        });
        Screen.show(DOM.choicePopup);
    },

    select(targetNodeKey) {
        Screen.hide(DOM.choicePopup);
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
