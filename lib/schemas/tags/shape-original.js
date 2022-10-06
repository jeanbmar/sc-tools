const { SmartBuffer } = require('../../smart-buffer-extra');
const ShapeDrawBitmapCommand = require('./shape-draw-bitmap-command');
const Tag = require('../tag');

const EndOfFile = new Tag();

class ShapeOriginal extends Tag {
    constructor() {
        super();
        this.exportId = -1;
        this.shapeDrawBitmapCommandCount = 0;
        this.shapeDrawBitmapCommands = [];
        this.totalVertexCount = 0;
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.exportId = smartBuf.readInt16LE();
        this.shapeDrawBitmapCommandCount = smartBuf.readInt16LE();
        this.totalVertexCount = this.tagSignature === 18
            ? smartBuf.readInt16LE()
            : 4 * this.shapeDrawBitmapCommandCount;
        let tagSignature;
        do {
            tagSignature = smartBuf.readUInt8();
            const tagSize = smartBuf.readInt32LE();
            smartBuf.readOffset -= 5;
            switch (tagSignature) {
            case 0:
                EndOfFile.decode(smartBuf);
                break;
            case 4:
            case 17:
            case 22:
                this.shapeDrawBitmapCommands.push(ShapeDrawBitmapCommand.decode(smartBuf));
                break;
            case 6:
                throw new Error('tag shape draw color fill command not supported');
            default:
                throw new Error(`unknown tag signature ${tagSignature} of size ${tagSize} found when decoding ${this.constructor.name}`);
            }
        } while (tagSignature);
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeInt16LE(this.exportId);
        smartBuf.writeInt16LE(this.shapeDrawBitmapCommands.length);
        if (this.tagSignature === 18) smartBuf.writeInt16LE(this.totalVertexCount);
        this.shapeDrawBitmapCommands.forEach((shapeDrawBitmapCommand) => shapeDrawBitmapCommand.encode(smartBuf));
        EndOfFile.encode(smartBuf);
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = ShapeOriginal;
