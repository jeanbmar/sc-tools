const { SmartBuffer } = require('../../smart-buffer-extra');
const Tag = require('../tag');

class Matrix2x3 extends Tag {
    constructor() {
        super();
        this.normalizedScalars = [];
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        for (let i = 0; i < 6; i += 1) {
            this.normalizedScalars.push(smartBuf.readInt32LE());
        }
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        this.normalizedScalars.forEach((normalizedScalar) => smartBuf.writeInt32LE(normalizedScalar));
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = Matrix2x3;
