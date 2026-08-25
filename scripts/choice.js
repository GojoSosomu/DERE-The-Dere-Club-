import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';
import { Screen } from './screen.js';
import { ChoiceNode } from './storyNodes.js';

export const Choice = {
    initialize() {
        EventBus.on("choice:selected", () => this.hideThePopUp());

        EventBus.on("node:enter", node => {
            if(node instanceof ChoiceNode)
                Choice.show(node.choices);
        });
    },

    show(options) {
        DOM.popups.choice.container.innerHTML = "";

        options.forEach(option => {
            const button = document.createElement("button");
            button.className = "button choice-button";
            button.textContent = option.text;
            button.choice = option;

            DOM.popups.choice.container.appendChild(button);
        });

        Screen.show(DOM.popups.choice.popup);
    },

    hideThePopUp() {
        Screen.hide(DOM.popups.choice.popup);
    }
};