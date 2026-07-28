let activeStage = [
    { slotId: "far-left", character: null },
    { slotId: "left",     character: "Kyle" },
    { slotId: "center",   character: null },
    { slotId: "right",    character: "Monika" },
    { slotId: "far-right",character: null }
];


function spawnCharacter(characterImageSrc, slotId) {
    let targetSlot = document.getElementById(slotId);
    targetSlot.innerHTML = "";
    
    let characterImg = document.createElement("img");
    characterImg.src = characterImageSrc;
    characterImg.className = "character-sprite";
    
    targetSlot.appendChild(characterImg);
}

spawnCharacter("images/Angel Naval Profile.png", "far-right");
spawnCharacter("images/Angel Naval Profile.png", "right");
spawnCharacter("images/Angel Naval Profile.png", "center");
spawnCharacter("images/Angel Naval Profile.png", "left");
spawnCharacter("images/Angel Naval Profile.png", "far-left");

