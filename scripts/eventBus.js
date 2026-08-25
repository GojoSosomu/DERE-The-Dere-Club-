export const EventBus = {
    events: {},

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },

    emit(event, ...data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...data));
        }
    },

    async emitAsync(event, ...data) {
        if (!this.events[event])
            return;

        await Promise.all(
            this.events[event].map(callback => callback(...data))
        );
    }
};