import { CharacterEnum } from './enums.js';
import { EventBus } from './eventBus.js';

export const Relationship = {
    data: {},

    initialize() {
        this.data = {};

        Object.values(CharacterEnum).forEach(character => {
            this.data[character] = 0;
        });

        EventBus.emit("relationship:change", this.data);
    },

    change(character, amount) {
        if (!(character in this.data))
            throw new Error(`Unknown character: ${character}`);

        this.data[character] = Math.max(
            -100,
            Math.min(100, this.data[character] + amount)
        );

        EventBus.emit("relationship:change", this.data);
    },

    get(character) {
        return this.data[character] ?? 0;
    }
};