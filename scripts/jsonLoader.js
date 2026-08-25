export const JsonLoader = {
    async load(src) {
        const response = await fetch(src);

        if(!response.ok)
            throw new Error(`Failed to load '${src}'.`);

        return await response.json();
    }
};