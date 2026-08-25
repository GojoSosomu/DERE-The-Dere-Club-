import { JsonLoader } from './jsonLoader.js';
import { StoryBuilder, GraphBuilder } from './graphBuilder.js';
import { StoryGraph } from './storyGraph.js';
import { Story } from './story.js';

export const StoryLoader = {
    async initialize(yearSelection) {
        if (StoryGraph.storyMap.has(yearSelection))
            return;

        const storyData = await JsonLoader.load(`data/year/${yearSelection}.json`);

        StoryBuilder.initialize(storyData);

        StoryGraph.initialize(
            new Story(
                storyData.id,
                storyData.start,
                GraphBuilder.sceneMap
            )
        );
        console.log(StoryGraph.storyMap.get(yearSelection));
    }
};