import { DOM } from './dom.js';
import { get, on } from './utils.js';
import { EventBus } from './eventBus.js';
import { Storage } from './storage.js';
import { Audio } from './audio.js';
import { Screen } from './screen.js';

export const Settings = {
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