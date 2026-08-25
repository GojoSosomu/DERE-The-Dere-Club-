import { SpeakerNode, ChoiceNode, GotoNode } from './storyNodes.js';

export const Debug = {
    initialize() {
        this.nodeIds = new Map();
        this.nextId = 0;
    },

    getId(node) {
        if(!this.nodeIds.has(node))
            this.nodeIds.set(node, `N${this.nextId++}`);

        return this.nodeIds.get(node);
    },

    toMermaid(sceneMap) {
        this.initialize();

        let output = [
            "flowchart TD"
        ];

        for(const [sceneId, scene] of sceneMap) {
            output.push(`subgraph ${sceneId}`);
            this.walk(scene.firstNode, output, new Set());
            output.push("end");
            output.push("");
        }

        return output.join("\n");
    },

    walk(node, output, visited) {
        if(node == null || visited.has(node))
            return;

        visited.add(node);

        const id = this.getId(node);

        if(node instanceof SpeakerNode) {
            output.push(`${id}{"${id}-${node.index} ${node.speaker}"}`);

            if(node.next) {
                const nextId = this.getId(node.next);
                output.push(`${id} --> ${nextId}`);
                this.walk(node.next, output, visited);
            }
        }

        else if(node instanceof ChoiceNode) {
            output.push(`${id}{"Choice"}`);

            for(const option of node.choices) {
                if(option.next) {
                    const optionId = this.getId(option.next);

                    output.push(`${id} -->|"${option.text}"| ${optionId}`);

                    this.walk(option.next, output, new Set(visited));
                }
            }

            if(node.next) {
                const nextId = this.getId(node.next);

                output.push(`${id} -.-> ${nextId}`);

                this.walk(node.next, output, visited);
            }
        }

        else if(node instanceof GotoNode) {
            output.push(`${id}(["Goto: ${node.sceneId}"])`);

            if(node.next) {
                const nextId = this.getId(node.next);

                output.push(`${id} --> ${nextId}`);

                this.walk(node.next, output, visited);
            }
        }
    }
};