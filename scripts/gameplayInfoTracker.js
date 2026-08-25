import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';

export const GameplayInfoTracker = {
    initialize() {
        EventBus.on("relationship:change", data => this.updateRelationship(data));
    },

    updateRelationship(data) {
        DOM.relationshipTracker.innerHTML = '';

        Object.entries(data).forEach(([character, value]) => {
            const relationshipItem = document.createElement("div");
            relationshipItem.className = "relationship-character";
            const relationshipGroup = document.createElement("div");
            const characterName = document.createElement("span");
            characterName.className = 'character-name';
            characterName.textContent = character.slice(0, 1).toUpperCase() + character.slice(1) + ': ';
            const relationshipValue = document.createElement("span");
            relationshipValue.className = 'relationship-value';
            relationshipValue.textContent = value;
            relationshipGroup.appendChild(characterName);
            relationshipGroup.appendChild(relationshipValue);
            relationshipItem.appendChild(relationshipGroup);
            DOM.relationshipTracker.appendChild(relationshipItem);
        });
    }
};