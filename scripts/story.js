export class Story {
    constructor(id, start, scenes) {
        this.id = id;
        this.start = start;

        this.scenes = scenes
    }

    getScene(sceneId) {
        return this.scenes.get(sceneId);
    }

    getStartScene() {
        return this.getScene(this.start);
    }
}