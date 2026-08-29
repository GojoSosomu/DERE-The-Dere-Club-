import { ChoiceNode } from './storyNodes.js';

export class Scene {
    constructor(id, background, bgm) {
        this.id = id;
        this.background = background;
        this.bgm = bgm;

        this.firstNode = null;
        this.lastNode = null;
    }

    findNode(id) {
        return this.#dfs(this.firstNode, id, new Set());
    }

    #dfs(node, nodeId, visited) {
        if(node == null || visited.has(node))
            return null;

        if(node.id === nodeId)
            return node;

        visited.add(node);

        if(node instanceof ChoiceNode) {
            for(const choice of node.choices) {
                const found = this.#dfs(
                    choice.next,
                    nodeId,
                    visited
                );

                if(found != null)
                    return found;
            }

            return null;
        }

        return this.#dfs(
            node.next,
            nodeId,
            visited
        );
    }
}