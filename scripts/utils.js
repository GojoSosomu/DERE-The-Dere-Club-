export const get = (selector) => document.querySelector(selector);
export const getAll = (selector) => document.querySelectorAll(selector);
export const on = (element, event, callback) => {
    if (element) element.addEventListener(event, callback);
};
export const Sleep = ms => new Promise(resolve => setTimeout(resolve, ms));