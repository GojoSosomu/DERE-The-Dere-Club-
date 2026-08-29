import { ChoiceNode } from './storyNodes.js';

export class Scene {
    constructor(id, background, bgm) {
        this.id = id;
        this.background = background;
        this.bgm = bgm;

        this.firstNode = null;
        this.lastNode = null;
    }

    findNode(targetId) {
        const stack = [this.firstNode];
        const visited = new Set();

        while (stack.length > 0) {
            const node = stack.pop();
            if (node == null || visited.has(node)) continue;
            if (node.id === targetId) return node;
                visited.add(node);

            if (node instanceof ChoiceNode) {
                for (const choice of node.choices) stack.push(choice.next);
            } else {
                stack.push(node.next);
            }
        }
        return null;
    }
}