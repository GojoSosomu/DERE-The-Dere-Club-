import { GotoNode, SpeakerNode, ChoiceNode } from './storyNodes.js';

export const StoryParser = {
    parse(data) {
        switch(data.type) {
            case "speaker":
                return this.parseSpeaker(data);
            case "choice":
                return this.parseChoice(data);
            case "goto":
                return this.parseGoto(data);
        }
    },

    parseGoto(data) {
        return new GotoNode(data);
    },

    parseSpeaker(data) {
        const node = new SpeakerNode(data);
        node.stage = this.parseStage(data.stage);

        return node;
    },

    parseStage(stage) {
        if(stage == null)
            return null;

        const operations = [];

        if(Object.entries(stage).length === 0) {
            operations.push({
                type: "clear"
            });
            return operations;
        }

        for(const [position, value] of Object.entries(stage)) {
            if(value == null) {
                operations.push({
                    type: "remove",
                    position
                });

                continue;
            }

            operations.push({
                type: "set",
                position,
                character: value.character,
                emotion: value.emotion
            });
        }

        return operations;
    },

    parseChoice(data) {
        const node = new ChoiceNode(data);

        for (const choice of data.choices) {
            node.choices.push({
                text: choice.text,
                dialogue: choice.dialogue
            });
        }

        return node;
    }
}