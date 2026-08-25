import { ChoiceNode } from './storyNodes.js';

export class Scene {
    constructor(id, background, bgm) {
        this.id = id;
        this.background = background;
        this.bgm = bgm;

        this.firstNode = null;
        this.lastNode = null;
    }

    findNode(index) {
        return this.#dfs(this.firstNode, index, new Set());
    }

    #dfs(node, nodeIndex, visited) {
        if(node == null || visited.has(node))
            return null;

        if(node.index === nodeIndex)
            return node;

        visited.add(node);

        if(node instanceof ChoiceNode) {
            for(const choice of node.choices) {
                const found = this.#dfs(
                    choice.next,
                    nodeIndex,
                    visited
                );

                if(found != null)
                    return found;
            }

            return null;
        }

        return this.#dfs(
            node.next,
            nodeIndex,
            visited
        );
    }
}