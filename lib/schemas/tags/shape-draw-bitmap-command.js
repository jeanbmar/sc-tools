const { SmartBuffer } = require('../../smart-buffer-extra');
const Tag = require('../tag');

class ShapeDrawBitmapCommand extends Tag {
    constructor() {
        super();
        this.textureIndex = 0;
        this.vertexCount = 0;
        this.normalizedXY = [];
        this.normalizedUV = [];
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.textureIndex = smartBuf.readUInt8();
        this.vertexCount = this.tagSignature === 4 ? 4 : smartBuf.readUInt8();
        for (let i = 0; i < this.vertexCount; i += 1) {
            this.normalizedXY.push([smartBuf.readInt32LE(), smartBuf.readInt32LE()]);
        }
        for (let i = 0; i < this.vertexCount; i += 1) {
            this.normalizedUV.push([smartBuf.readUInt16LE(), smartBuf.readUInt16LE()]);
        }
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeUInt8(this.textureIndex);
        if (this.tagSignature !== 4) smartBuf.writeUInt8(this.vertexCount);
        this.normalizedXY.flat().forEach((nXY) => smartBuf.writeInt32LE(nXY));
        this.normalizedUV.flat().forEach((nUV) => smartBuf.writeUInt16LE(nUV));
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = ShapeDrawBitmapCommand;
