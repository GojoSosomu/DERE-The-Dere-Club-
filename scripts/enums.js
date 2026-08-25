export const CharacterPosition = Object.freeze({
    FAR_LEFT: "far-left",
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    FAR_RIGHT: "far-right"
});

export const CharacterPositionValue = Object.freeze({
    "far-left": 0,
    "left": 20,
    "center": 40,
    "right": 60,
    "far-right": 80
});

export const CharacterEnum = Object.freeze({
    PENNY: "penny",
    YURI: "yuri",
    JOHN: "john",
    ALI: "ali",
    ERIKA: "erika"
});

export const SpeakerEnum = Object.freeze({
    ...CharacterEnum,
    DEFAULT: "default",
    NARRATOR: "narrator"
});

export const EmotionEnum = Object.freeze({
    NEUTRAL: "neutral",
    HAPPY: "happy",
    SAD: "sad",
    SHOCK: "shock",
    ANGRY: "angry",
    BLUSH: "blush",
    INFATUATION: "infatuation"
});