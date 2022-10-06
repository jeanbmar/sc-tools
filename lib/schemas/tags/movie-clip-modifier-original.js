const { SmartBuffer } = require('../../smart-buffer-extra');
const Tag = require('../tag');

class MovieClipModifierOriginal extends Tag {
    constructor() {
        super();
        this.exportId = -1;
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.exportId = smartBuf.readInt16LE();
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeInt16LE(this.exportId);
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = MovieClipModifierOriginal;
