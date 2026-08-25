import { DOM } from './dom.js';
import { Storage } from './storage.js';
import { Audio } from './audio.js';
import { Screen } from './screen.js';
import { Settings } from './settings.js';
import { Background } from './background.js';
import { CharacterProfile } from './characterProfile.js';
import { GameplayInfoTracker } from './gameplayInfoTracker.js';
import { Relationship } from './relationship.js';
import { Dialogue } from './dialogue.js';
import { Character } from './character.js';
import { Choice } from './choice.js';
import { Events } from './events.js';
import { Debug } from './debug.js';
import { SaveLoad } from './saveLoad.js';
import { StoryLoader } from './storyLoader.js';

export const Engine = {
    async initialize() {
        DOM.initialize();
        Storage.initialize();
        Audio.initialize();
        Screen.initialize();
        Settings.initialize();
        Background.initialize();
        await CharacterProfile.initialize();
        GameplayInfoTracker.initialize();
        Relationship.initialize();
        Dialogue.initialize();
        Character.initialize();
        Choice.initialize();
        Events.initialize();
        Debug.initialize();
        SaveLoad.initialize();
        await StoryLoader.initialize("year1");
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await Engine.initialize();
});