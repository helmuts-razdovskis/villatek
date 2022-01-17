export class ModelEntry {
    // from: mconnection (where this.variant=from.variantTo and from.variant=this.parent)
    // state: int (-1 - temp, 0 - normal (default), 1 - selected?)
    constructor(from, state) {
        this.snaps = []; // ModelEntry[]
        this.from = from;
        this.state = state || 0;
    }

    getVariant = () => this.from.variantTo;
    getTo = () => this.from.variant;
    getState = () => this.state;
    setState = (state) => this.state = state;
    getSnaps = () => this.snaps;

    addConnection(connection, state) {
        if (this.snaps.find(c => c.snap === connection.snap))
            if (state === -1) {
                return
            } else {
                throw Error(`Variant "${this.getVariant().code}" already connected on snap "${connection.snap}"!`)
            }

        const result = new ModelEntry(connection, state);
        this.snaps.push(result);
        return result;
    }
    removeConnection(connectionId) {
        this.snaps.splice(this.snaps.findIndex(c => c.connection.id === connectionId), 1);
    }
    addTempConnections(blockId) {
        const snaps = this.getVariant().connections.filter(cto => cto.variantTo.block.id === blockId);
        const result = snaps.reduce((acc, snap) => {
            const con = this.addConnection(snap, -1);
            con && acc.push(con);
            return acc;
        }, []);
        return this.snaps.reduce((acc, con) => acc.concat(con.addTempConnections(blockId)), result);
    }
    removeTempConnections() {
        const result = this.snaps.filter (c => c.state === -1);
        this.snaps = this.snaps.filter(c => c.state !== -1);
        return this.snaps.reduce((acc, con) => acc.concat(con.removeTempConnections()), result);
    }

    forEach(callback)  {
        if (callback) {
            callback(this);
            this.snaps.forEach(item => {
                item.forEach(callback);
            });
        }
    }

    reduce(callback, initial) {
        if (callback) {
            initial = callback(initial, this);
            this.snaps.forEach(item => {
                initial = item.reduce(callback, initial);
            });
        }
        return initial;
    }
}