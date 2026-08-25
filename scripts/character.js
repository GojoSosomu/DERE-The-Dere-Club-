import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';
import { CharacterPositionValue } from './enums.js';
import { SpeakerNode } from './storyNodes.js';

let activeStage = [];

export const Character = {
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

        const img = existing.element;

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

        img.style.left =
            `${CharacterPositionValue[position]}%`;

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
        const img = data.element;

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

    moveCharacter(img, stageData, position) {
        img.style.left =
            `${CharacterPositionValue[position]}%`;

        img.dataset.position = position;

        stageData.position = position;
    },

    clearStage() {
        [...activeStage].forEach(actor => {
            this.removeCharacter(actor.position);
        });
    },

    restoreStage() {
        DOM.stage.innerHTML = "";

        const savedStage = [...activeStage];

        activeStage = [];

        for (const actor of savedStage) {
            this.spawnCharacter(
                actor.character,
                actor.emotion,
                actor.position
            );
        }
    },

    // functions for making the js modulated

    restoreStage(savedStage = null) {
        DOM.stage.innerHTML = "";

        const stageToLoad = savedStage ?? [...activeStage];

        activeStage = [];

        for (const actor of stageToLoad) {
            this.spawnCharacter(actor.character, actor,emotion, actor.position);
        }
    },

    getStagePreview() {
        return activeStage.map(actor => ({
            character: actor.character,
            emotion: actor.emotion,
            position: actor.position
        }));
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