import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';

export const Background = {
    initialize() {
        EventBus.on("scene:enter", scene => {
            Background.show(scene.background);
        });
    },

    show(background) {
        DOM.background.src = this.getBackgroundImageSrc(background);
    },

    getBackgroundImageSrc(background) {
        return `images/background/${background}.jpg`;
    }
}