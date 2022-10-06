class MovieClipModifier {
    constructor(rawModifier) {
        Object.assign(this, rawModifier);
    }

    // eslint-disable-next-line class-methods-use-this
    render() {
        // no nothing
    }

    // eslint-disable-next-line class-methods-use-this
    ensureBounds() {
        // do nothing
    }
}

module.exports = MovieClipModifier;
