import { DOM } from './dom.js';
import { on } from './utils.js';
import { Sleep } from './utils.js';
import { Audio } from './audio.js';
import { Screen } from './screen.js';
import { EventBus } from './eventBus.js';
import { SaveLoad } from './saveLoad.js';
import { StoryRunner } from './storyRunner.js';

export const Events = {
    initialize() {
        this.lastTouch = 0;
        on(DOM.startButton, "click", async () => {
            await Audio.bgm.play();

            Screen.open(DOM.pages.loading);

            await Sleep(5000);

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