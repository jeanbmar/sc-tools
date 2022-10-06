const { SmartBuffer } = require('../../smart-buffer-extra');
const Tag = require('../tag');

class ScalingGrid extends Tag {
    constructor() {
        super();
        this.normalizedScalar0 = 0;
        this.normalizedScalar1 = 0;
        this.normalizedScalar2 = 0;
        this.normalizedScalar3 = 0;
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.normalizedScalar0 = smartBuf.readInt32LE();
        this.normalizedScalar1 = smartBuf.readInt32LE();
        this.normalizedScalar2 = smartBuf.readInt32LE();
        this.normalizedScalar3 = smartBuf.readInt32LE();
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeInt32LE(this.normalizedScalar0);
        smartBuf.writeInt32LE(this.normalizedScalar1);
        smartBuf.writeInt32LE(this.normalizedScalar2);
        smartBuf.writeInt32LE(this.normalizedScalar3);
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = ScalingGrid;
