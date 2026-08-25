import { DOM } from './dom.js';
import { EventBus } from './eventBus.js';

export const Screen = {
    orientation: null,

    initialize() {
        DOM.currentPage = DOM.pages.start;

        this.open(DOM.currentPage);

        EventBus.on("screen:change", (page) => {
            this.open(page);
        });
    },

    updateOrientation() {
        const orientation =
            window.innerWidth > window.innerHeight
                ? "landscape"
                : "portrait";

        if (orientation === this.orientation) return;

        this.orientation = orientation;

        if (orientation === "landscape") {
            this.open(DOM.currentPage);
        } else {
            this.hide(DOM.currentPage);
            this.show(DOM.pages.orientationInfo);
        }
    },

    open(page) {
        if (!page) return;

        this.hideAllPages();
        this.hideAllPopups();

        [DOM.previousPage, DOM.currentPage] = [
            DOM.currentPage,
            page
        ];

        this.show(DOM.currentPage);
    },

    back() {
        if (!DOM.previousPage) return;

        this.hideAllPages();

        [DOM.currentPage, DOM.previousPage] = [
            DOM.previousPage,
            DOM.currentPage
        ];

        this.show(DOM.currentPage);
    },

    show(element) {
        if (element) {
            element.classList.remove("hidden");
            element.classList.add("visible");
        }
    },

    hide(element) {
        if (element) {
            element.classList.remove("visible");
            element.classList.add("hidden");
        }
    },

    toggle(element) {
        element.classList.contains("hidden")
            ? this.show(element)
            : this.hide(element);
    },

    hideAllPopups() {
        Object.values(DOM.popups).forEach(popup => {
            this.hide(popup.popup);
        });
    },

    hideAllPages() {
        Object.values(DOM.pages).forEach(page => this.hide(page));
    }
};