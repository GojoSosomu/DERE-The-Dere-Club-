let activeStage = [
    { slotId: "far-left",  character: null },
    { slotId: "left",      character: null },
    { slotId: "center",    character: null },
    { slotId: "right",     character: null },
    { slotId: "far-right", character: null }
];

const Character = Object.freeze({
    PENNY: "penny",
    YURI: "yuri",
    JOHN: "john",
    ALI: "ali",
    ERI: "eri",
    ANGEL: "angel"
});

const Emotion = Object.freeze({
    NEUTRAL: "neutral",
    HAPPY: "happy",
    SAD: "sad",
    SHOCK: "shock",
    ANGRY: "angry",
    BLUSH: "blush",
    INFATUATION: "infatuation"
});

function getCharacterImageSrc(character, emotion) {
    return `images/characters/${character}/${character}_${emotion}.png`;
}

function getProfileImageSrc(character) {
    return `images/profiles/${character}_profile.png`;
}

function spawnCharacter(character, emotion, slotId) {
    let targetSlot = document.getElementById(slotId);
    if (!targetSlot) return;
    
    targetSlot.innerHTML = "";
    
    let characterImg = document.createElement("img");
    characterImg.src = getCharacterImageSrc(character, emotion);
    characterImg.className = "character-sprite";
    
    targetSlot.appendChild(characterImg);

    let stageSlot = activeStage.find(slot => slot.slotId === slotId);
    if (stageSlot) {
        stageSlot.character = character;
    }
}

function setDialogue(speaker, text) {
    let dialogueBox = document.querySelector(".dialogue-box");
    if (!dialogueBox) return;

    let speakerBox = dialogueBox.querySelector(".speaker");
    speakerBox.textContent = speaker.charAt(0).toUpperCase() + speaker.slice(1);
    
    let speakerProfile = dialogueBox.querySelector(".speaker-profile");
    speakerProfile.src = getProfileImageSrc(speaker);
    
    let dialogueContent = dialogueBox.querySelector(".dialogue-content p");
    dialogueContent.textContent = text;
}

spawnCharacter(Character.ANGEL, Emotion.NEUTRAL, "center");
setDialogue(Character.ANGEL, "FACK YOU! WHY NOT KISS ME ALREADY!!");
