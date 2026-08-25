import { DOM } from './dom.js';
import { on } from './utils.js';
import { JsonLoader } from './jsonLoader.js';
import { Character } from './character.js';
import { Dialogue } from './dialogue.js';
import { CharacterEnum, EmotionEnum } from './enums.js';

export const CharacterProfile = {
    async initialize() {
        this.characterInfo = await JsonLoader.load("data/character_info.json");

        on(DOM.characterProfileButton, "click",() => this.refillCharacterList());
        on(DOM.characterList, "click", e => {
            const button = e.target.closest(".character-list-button");
            if(button) this.displayCharacter(button.dataset.character);
        });
        this.displayCharacter();
    },

    displayCharacter(name = "penny") {
        const characterData = this.characterInfo[name];
        const characterName = characterData["character_name"];
        const characterDescription = characterData["character_description"];

        DOM.characterProfileName.textContent = characterName;
        DOM.characterProfileDescription.querySelector("p").textContent = characterDescription;
        DOM.characterProfileImg.querySelector("img").src = Dialogue.getProfileImageSrc(name);
        DOM.characterSpritePreview.querySelector("img").src = Character.getCharacterImageSrc(name, EmotionEnum.NEUTRAL);
    },

    refillCharacterList() {
        DOM.characterList.replaceChildren();
        Object.values(CharacterEnum).forEach(character => {
            const characterButton = document.createElement("button");
            characterButton.className = "button character-list-button";
            characterButton.dataset.character = character;
            characterButton.textContent = character.slice(0, 1).toUpperCase() + character.slice(1);
            DOM.characterList.appendChild(characterButton);
        });
    }
};