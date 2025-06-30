export default class Datastore<K> {
    private buffer: Array<K>;
    private maxSize: number;
    private searchFunction: (item: K, key: string) => boolean;

    constructor(
        initial = <K[]>[],
        searchFunction: (item: K, key: string) => boolean,
        maxSize = 100,
    ) {
        const diff = initial.length - 100;
        const sI = diff < 0 ? 0 : diff;
        this.buffer = initial.slice(sI);
        this.maxSize = maxSize;
        this.searchFunction = searchFunction;
    }

    add(key: string, value: K) {
        if (
            !this.buffer.find((item) => this.searchFunction(item, key)) &&
            (isNaN(this.maxSize) ? true : this.buffer.length >= this.maxSize)
        ) {
            this.buffer.shift();
        }
        this.buffer.push(value);
    }

    get(key: string): K | undefined {
        const item = this.buffer.find((item) => this.searchFunction(item, key));
        if (!item) return undefined;
        return item;
    }

    find(fn: (item: K) => boolean): K | undefined {
        const item = this.buffer.find((item) => fn(item));
        if (!item) return undefined;
        return item;
    }

    has(key: string): boolean {
        return !!this.buffer.find((item) => this.searchFunction(item, key));
    }

    delete(key: string): boolean {
        const index = this.buffer.findIndex((item) =>
            this.searchFunction(item, key),
        );
        if (index > -1) {
            this.buffer.splice(index, 1);
        }
        return true;
    }

    size(): number {
        return this.buffer.length;
    }

    item(n: number): K | undefined {
        return this.buffer.at(n);
    }

    values(): K[] {
        return this.buffer;
    }
}
