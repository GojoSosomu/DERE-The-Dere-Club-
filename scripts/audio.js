import { Settings } from './settings.js';
import { EventBus } from './eventBus.js';
import { SpeakerEnum } from './enums.js';

export const Audio = {
    VoiceConfig: {
        default: 1.0,
        penny: 1.0,
        yuri: 0.85,
        john: 1.15,
        ali: 1.05,
        erika: 0.95,
        narrator: 0.7
    },

    initialize() {
        this.voice = {};

        this.bgm = new window.Audio("audios/backgroundMusic/Main_Lobby.mp3");
        this.bgm.loop = true;
        this.updateVolume();

        EventBus.on("scene:enter", scene => {
            if (scene.bgm)
                this.playBGM(scene.bgm);
        });
    },

    playBGM(src) {
        const path = `audios/backgroundMusic/${src}.mp3`;

        if (this.bgm.src.endsWith(path))
            return;

        this.bgm.src = path;
        this.bgm.currentTime = 0;
        this.updateVolume();

        if (this.isAudioAllowed) {
            this.bgm.play().catch(e => console.error("BGM Play failed:", e));
        }
    },

    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
    },

    playSFX(src) {
        console.log(`Playing sound effect: ${src}`);
    },

    playVoiceBlip(speaker) {
        const trueSpeaker = speaker && SpeakerEnum[speaker.toUpperCase()] ? speaker : SpeakerEnum.DEFAULT;

        if (!(trueSpeaker in this.voice)) {
            this.voice[trueSpeaker] = new window.Audio(
                `audios/voice/${trueSpeaker}.wav`
            );
        }        

        const audio = this.voice[trueSpeaker];
        const baseRate = this.VoiceConfig[trueSpeaker] ?? 1;

        audio.currentTime = 0;
        audio.playbackRate = 0.2 + Math.random() * baseRate;
        audio.volume = (Number(Settings.data.masterVolume) / 100) * (Number(Settings.data.vaVolume) / 100);
        
        audio.play().catch(e => console.error("Voice play failed:", e));
    },

    updateVolume() {
        this.bgm.volume = (Settings.data.masterVolume / 100) * (Settings.data.bgVolume / 100);
    }
};