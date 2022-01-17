import events from 'events';

class DataStore {
    constructor(data) {
        this.data = data;
        this.emitter = new events.EventEmitter();
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
        this.updated();
    }

    setError(error) {
        this.error = error;
    }

    getError() {
        return this.error;
    }

    subscribe(callback) {
        this.emitter.addListener('update', callback);
    }

    unsubscribe(callback) {
        this.emitter.removeListener('update', callback);
    }

    updated() {
        this.emitter.emit('update', this.getData());
    }
}

export default DataStore;