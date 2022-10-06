const Header = require('./header');
const ShapeOriginal = require('./tags/shape-original');
const MovieClipOriginal = require('./tags/movie-clip-original');
const TextFieldOriginal = require('./tags/text-field-original');
const SwfTexture = require('./tags/swf-texture');
const Matrix2x3 = require('./tags/matrix-2x3');
const ColorTransformation = require('./tags/color-transformation');
const Timeline = require('./tags/timeline');
const Flag = require('./tags/flag');
const MovieClipModifierOriginal = require('./tags/movie-clip-modifier-original');
const Tag38 = require('./tags/tag-38');
const Tag42 = require('./tags/tag-42');
const Tag = require('./tag');

const EndOfFile = new Tag();

class SupercellSC {
    constructor() {
        this.header = new Header();
        this.exports = [];
        this.shapes = [];
        this.movieClips = [];
        this.textures = [];
        this.textFields = [];
        this.matrices = [];
        this.colorTransformations = [];
        this.timelines = [];
        this.lowresFlag = false;
        this.textureFileFlag = false;
        this.multiresFlag = false;
        this.movieClipModifiers = [];
        this.tag38s = [];
        this.tag42s = [];
    }

    static decode(smartBuf) {
        const file = new this();
        file.decode(smartBuf);
        return file;
    }

    decode(smartBuf) {
        this.header.decode(smartBuf);
        const exportIds = [];
        for (let i = smartBuf.readUInt16LE(); i; i -= 1) {
            exportIds.push(smartBuf.readUInt16LE());
        }
        exportIds.forEach((exportId) => { this.exports.push({ exportId, exportName: smartBuf.readAscii() }); });
        while (smartBuf.remaining()) {
            const tagSignature = smartBuf.readUInt8();
            const tagSize = smartBuf.readInt32LE();
            const before = smartBuf.readOffset;
            smartBuf.readOffset -= 5;
            switch (tagSignature) {
            case 0:
                EndOfFile.decode(smartBuf);
                if (smartBuf.remaining()) {
                    throw new Error(`found EndOfFile tag but ${smartBuf.remaining()} bytes are remaining`);
                }
                break;
            case 1:
            case 16:
            case 28:
            case 29:
            case 34:
            case 19:
            case 24:
            case 27:
                this.textures.push(SwfTexture.decode(smartBuf));
                break;
            case 2:
            case 18:
                this.shapes.push(ShapeOriginal.decode(smartBuf));
                break;
            case 3:
            case 10:
            case 12:
            case 14:
            case 35:
                this.movieClips.push(MovieClipOriginal.decode(smartBuf));
                break;
            case 7:
            case 15:
            case 20:
            case 21:
            case 25:
            case 33:
            case 44:
                this.textFields.push(TextFieldOriginal.decode(smartBuf));
                break;
            case 8:
                this.matrices.push(Matrix2x3.decode(smartBuf));
                break;
            case 9:
                this.colorTransformations.push(ColorTransformation.decode(smartBuf));
                break;
            case 13:
                this.timelines.push(Timeline.decode(smartBuf));
                break;
            case 23:
                this.lowresFlag = true;
                Flag.decode(smartBuf);
                break;
            case 26:
                this.textureFileFlag = true;
                Flag.decode(smartBuf);
                break;
            case 30:
                this.multiresFlag = true;
                Flag.decode(smartBuf);
                break;
            case 36:
                throw new Error('tag Matrix2x3_2 is not implemented');
            case 37:
                this.movieClipModifiers.push(MovieClipModifierOriginal.decode(smartBuf));
                break;
            case 38:
            case 39:
            case 40:
                this.tag38s.push(Tag38.decode(smartBuf));
                break;
            case 42:
                this.tag42s.push(Tag42.decode(smartBuf));
                break;
            default:
                throw new Error(`unknown tag signature ${tagSignature} of size ${tagSize} found when decoding ${this.constructor.name}`);
            }
            if (before !== smartBuf.readOffset - tagSize) {
                throw new Error(`inconsistent tag size for tag signature ${tagSignature} (expected ${tagSize}, read ${smartBuf.readOffset - before})`);
            }
        }
    }

    encode(smartBuf) {
        this.header.encode(smartBuf);
        smartBuf.writeUInt16LE(this.exports.length);
        this.exports.forEach(({ exportId }) => smartBuf.writeUInt16LE(exportId));
        this.exports.forEach(({ exportName }) => smartBuf.writeAscii(exportName));
        if (this.lowresFlag) Flag.encode(smartBuf, 23);
        if (!this.lowresFlag && this.multiresFlag) Flag.encode(smartBuf, 30);
        if (this.textureFileFlag) Flag.encode(smartBuf, 26);
        this.textures.forEach((texture) => texture.encode(smartBuf));
        this.shapes.forEach((shape) => shape.encode(smartBuf));
        this.textFields.forEach((textField) => textField.encode(smartBuf));
        this.matrices.forEach((matrix) => matrix.encode(smartBuf));
        this.colorTransformations.forEach((colorTransformation) => colorTransformation.encode(smartBuf));
        this.movieClips.forEach((movieClip) => movieClip.encode(smartBuf));
        this.timelines.forEach((timeline) => timeline.encode(smartBuf));
        this.movieClipModifiers.forEach((movieClipModifier) => movieClipModifier.encode(smartBuf));
        this.tag38s.forEach((tag38) => tag38.encode(smartBuf));
        this.tag42s.forEach((tag42) => tag42.encode(smartBuf));
        EndOfFile.encode(smartBuf);
    }
}

module.exports = SupercellSC;
