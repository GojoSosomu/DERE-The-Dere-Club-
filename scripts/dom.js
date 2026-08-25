import { get, getAll } from './utils.js';

export const DOM = {
    initialize() {
        this.pages = {
            mainMenu: get(".main-menu"),
            gameplay: get(".gameplay"),
            setting: get(".setting"),
            about: get(".about"),
            characterProfile: get(".character-profile"),
            orientationInfo: get(".orientationInfo"),
            persistent: get(".save-load"), 
            demo: get(".demo"),
            loading: get(".loading"),
            start: get(".start"),
        };

        this.currentPage = null;
        this.previousPage = null;

        this.initialButton = get("#initial");
        this.startButton = get("#start");
        this.settingButton = get("#setting");
        this.aboutButton = get("#about");
        this.characterProfileButton = get("#character-profile");
        this.backButton = get("#back-button");
        this.backButtonAbout = get("#back-button-ab");
        this.characterProfileBackButton = get(".character-profile-back");
        this.menuButton = get("#open-menu");
        this.resumeButton = get("#resume");
        this.settingsButton = get("#settings");
        this.saveButton = get("#save");
        this.loadButton = get("#load");
        this.quitButton = get("#quit");

        this.gameplayInfo = get(".gameplay-info");
        this.relationshipTracker = get(".relationship-tracker");

        this.background = get(".background");
        this.stage = get(".stage");
        this.dialogueBox = get(".dialogue-box");
        this.speaker = get(".speaker");
        this.dialogueText = get(".dialogue-body p") || get("#dialogue");
        this.profile = get(".speaker-profile");
        this.nextIndicator = get(".next-indicator");

        this.settingCategory = get(".setting-category");
        this.settingContent = get(".setting-content");
        this.settingOptionButtons = {
            volumeButton: get("#volume"),
            textButton: get("#text")
        };

        this.backButtonSaveLoad = get("#save-load-back");
        this.saveLoadTitle = get(".save-load-header h1");
        this.dataSlots = getAll(".data-slot");
        this.preview = {
            speaker: get("#preview-speaker"),
            dialogue: get("#preview-dialogue"),
            title: get("#preview-title"),
            date: get("#preview-date"),
            profile: get(".preview-speaker .speaker-profile")
        };

        this.characterProfileImg = get(".character-profile-image");
        this.characterProfileName = get(".character-profile-name");
        this.characterProfileDescription = get(".character-profile-description");
        this.characterSpritePreview = get(".character-sprite-preview");
        this.characterList = get(".character-list");

        this.backButtonDemo = get("#demo-back-button");

        this.popups = {
            choice: {
                popup: get(".choice-popup"),
                container: get(".choice-container")
            },

            menu: {
                popup: get(".menu-popup"),
                container: get(".menu-container")
            }
        };
    }
};