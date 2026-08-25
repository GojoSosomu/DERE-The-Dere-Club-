import { Relationship } from './relationship.js';

export class Effect {
    constructor(data) {
        this.type = data.type;
    }

    apply() {
        throw new Error("Effect.apply() must be implemented.");
    }
}

export class RelationshipEffect extends Effect {
    constructor() {
        super({ type: "relationship" });

        this.relations = [];
    }

    apply() {
        for (const relation of this.relations) {
            Relationship.change(
                relation.character,
                relation.amount
            );
        }
    }
}

export class RelationshipItem {
    constructor(character, amount) {
        this.character = character;
        this.amount = amount;
    }
}

export const EffectFactory = {
    create(data) {
        switch (data.type) {
            case "relationship": {
                const effect = new RelationshipEffect();

                effect.relations = data.relations.map(
                    relation => new RelationshipItem(
                        relation.character,
                        relation.amount
                    )
                );

                return effect;
            }
            default:
                throw new Error(`Unknown effect: ${data.type}`);
        }
    }
};

export class StoryElement {
    constructor(data = {}) {
        this.effects = (data.effects ?? [])
            .map(effect => EffectFactory.create(effect));
    }

    applyEffects() {
        for (const effect of this.effects) {
            effect.apply();
        }
    }
}