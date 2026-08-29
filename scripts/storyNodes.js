import { StoryElement } from './effects.js';

export class Node extends StoryElement {
    constructor(type, data = {}) {
        super(data);
        this.type = type;
        this.id = data.id;
    }
}

export class LinearNode extends Node {
    constructor(type, data) {
        super(type, data);

        this.next = null;
    }
}

export class SpeakerNode extends LinearNode {
    constructor(data) {
        super("speaker", data);

        this.speaker = data.speaker;
        this.text = data.text;
        this.stage = {};
    }
}

export class ChoiceNode extends Node {
    constructor(data) {
        super("choice", data);

        this.choices = [];
    }
}

export class ChoiceOption extends StoryElement {
    constructor(data) {
        super(data);

        this.text = data.text;
        this.next = null;
    }
}

export class CommandNode extends LinearNode {
    constructor(type) {
        super(type);
    }
}

export class GotoNode extends CommandNode {
    constructor(data) {
        super("goto", data);

        this.sceneId = data.scene;
    }
}