export const StoryGraph = {
    storyMap: new Map(),

    initialize(story) {
        this.storyMap.set(story.id, story);
    },

    getStory(yearSelection) {
        return this.storyMap.get(yearSelection);
    },
}