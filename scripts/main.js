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

function getcharacterImageSrc(character, emotion) {
    return "images/characters/" + character + "/" + character + "_" + emotion + ".png";
}

function spawnCharacter(characterImageSrc, slotId) {
    let targetSlot = document.getElementById(slotId);
    targetSlot.innerHTML = "";
    
    let characterImg = document.createElement("img");
    characterImg.src = characterImageSrc;
    characterImg.className = "character-sprite";
    
    targetSlot.appendChild(characterImg);
}

spawnCharacter(getcharacterImageSrc(Character.ANGEL, Emotion.NEUTRAL), "center");
