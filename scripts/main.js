let activeStage = [
    { slotId: "far-left", character: null },
    { slotId: "left",     character: null },
    { slotId: "center",   character: null },
    { slotId: "right",    character: null },
    { slotId: "far-right",character: null }
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
    return "images/characters/" + character + "/" + character + "_" + emotion + ".png";
}

function getProfileImageSrc(character) {
    return "images/profiles/" + character + "_profile" + ".png";
}

function spawnCharacter(characterImageSrc, slotId) {
    let targetSlot = document.getElementById(slotId);
    targetSlot.innerHTML = "";
    
    let characterImg = document.createElement("img");
    characterImg.src = characterImageSrc;
    characterImg.className = "character-sprite";
    
    targetSlot.appendChild(characterImg);
}

function setDialogue(speaker, text, profileImageSrc) {
    let dialogueBox = document.querySelector(".dialogue-box");
    let speakerBox = dialogueBox.querySelector(".speaker");
    speakerBox.textContent = speaker;
    let speakerProfile = dialogueBox.querySelector(".speaker-profile");
    speakerProfile.src = profileImageSrc;
    let dialogueContent = dialogueBox.querySelector(".dialogue-content");
    dialogueContent.querySelector("p").textContent = text;

}

spawnCharacter(getCharacterImageSrc(Character.ANGEL, Emotion.NEUTRAL), "center");
setDialogue(Character.ANGEL, "FACK YOU! WHY NOT KISS ME ALREADT!!", getProfileImageSrc(Character.ANGEL));