import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';
import { Settings } from './settings.js';
import { Audio } from './audio.js';
import { CharacterEnum } from './enums.js';
import { SpeakerNode } from './storyNodes.js';
import { Sleep } from './utils.js';

export const Dialogue = {
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