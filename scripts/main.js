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
    initialize() {
        DOM.initialize();
        Screen.initialize();
        Settings.initialize();
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
            setting: get(".setting"),
            about: get(".about"),
            orientationInfo: get(".orientationInfo"), // this catches the device when on portrait device
        };

        this.currentPage = null;
        this.previousPage = null;

        this.startButton = get("#start");
        this.settingButton = get("#setting");
        this.volumeButton = get("#volume");
        this.textButton = get("#text");
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
            Screen.getOrientation();
        }
    }
};

const Screen = {
    initialize() {
        DOM.currentPage = DOM.pages.mainMenu;

        this.open(DOM.currentPage);

        EventBus.on("screen:change", (page) => {
            this.open(page);
        });
    },

    open(page) {
        this.hideAllPages();

        DOM.previousPage = DOM.currentPage;
        DOM.currentPage = page;

        this.show(page);
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

    hideAllPages() {
        Object.values(DOM.pages).forEach(page => this.hide(page));
    }
};

const Settings = {
    cache: {},

    initialize() {
        on(DOM.volumeButton, "click", () => this.changeContent(DOM.volumeButton));
        on(DOM.textButton, "click", () => this.changeContent(DOM.textButton));
        on(DOM.backButton, "click", () => Screen.back());

        EventBus.on("setting:change", (category, data) => {
            // Handle setting changes
        });
    },

    openVolumeSettings() {
        return `
            <div class="setting-control">
                <label for="volume-master">Master Volume</label>
                <input type="range" id="volume-master" name="Master Volume">
            </div>

            <div class="setting-control">
                <label for="volume-sfx">SFX Volume</label>
                <input type="range" id="volume-sfx" name="SFX Volume">
            </div>

            <div class="setting-control">
                <label for="volume-bg">BG Volume</label>
                <input type="range" id="volume-bg" name="BG Volume">
            </div>
        `;
    },

    openTextSettings() {
        return `
            <div class="setting-control">
                <label for="text-speed">Text Speed</label>
                <input type="range" id="text-speed" name="Text Speed">
            </div>

            <div class="setting-control">
                <label for="text-size">Text Size</label>
                <input type="range" id="text-size" name="Text Size">
            </div>
        `;
    },

    changeContent(element) {
        const category = DOM.settingCategory;
        category.innerHTML = `<h2>${element.textContent}</h2>`;

        const key = element.id;

        if (!this.cache[key]) {
            if (element === DOM.volumeButton) {
                this.cache[key] = this.openVolumeSettings();
            } else if (element === DOM.textButton) {
                this.cache[key] = this.openTextSettings();
            }
        }

        DOM.settingContent.innerHTML = this.cache[key];
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
