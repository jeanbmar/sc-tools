const Matrix = require('./matrix');
const MovieClip = require('./movie-clip');
const MovieClipModifier = require('./movie-clip-modifier');
const Shape = require('./shape');
const Tag38 = require('./tag-38');
const TextField = require('./text-field');
const Texture = require('./texture');

class SupercellSC {
    constructor(rawFile) {
        this.displayObjects = new Map();
        this.textures = rawFile.textures.map((rawTexture) => new Texture(rawTexture));
        this.matrices = rawFile.matrices.map((rawMatrix) => new Matrix(rawMatrix));
        this.shapes = rawFile.shapes.map((rawShape) => new Shape(rawShape, this));
        this.shapes.forEach((shape) => this.displayObjects.set(shape.exportId, shape));
        this.textFields = rawFile.textFields.map((rawTextField) => new TextField(rawTextField));
        this.textFields.forEach((rawTextField) => this.displayObjects.set(rawTextField.exportId, rawTextField));
        this.movieClipModifiers = rawFile.movieClipModifiers.map((rawModifier) => new MovieClipModifier(rawModifier));
        this.movieClipModifiers.forEach((modifier) => this.displayObjects.set(modifier.exportId, modifier));
        this.tag38s = rawFile.tag38s.map((rawTag38) => new Tag38(rawTag38));
        this.tag38s.forEach((tag38) => this.displayObjects.set(tag38.exportId, tag38));
        this.movieClips = rawFile.movieClips.map((rawMovieClip) => {
            const movieClip = new MovieClip(rawMovieClip, this);
            this.displayObjects.set(movieClip.exportId, movieClip);
            return movieClip;
        });
        this.exportables = new Map(
            rawFile.exports.map((item) => [item.exportName, this.displayObjects.get(item.exportId)]),
        );
        this.movieClips.forEach((movieClip) => {
            movieClip.asciis.forEach((ascii, index) => {
                if ((movieClip.displayObjects[index] instanceof MovieClip) && ascii !== null) {
                    this.exportables.set(ascii, movieClip.displayObjects[index]);
                }
            });
        });
    }

    getExport(name) {
        return this.exportables.get(name);
    }

    getAvailableExportNames() {
        return Array.from(this.exportables.keys());
    }

    getMatrix(index) {
        return this.matrices[index];
    }

    getDisplayObject(id) {
        return this.displayObjects.get(id);
    }

    getTexture(index) {
        return this.textures[index];
    }
}

module.exports = SupercellSC;
