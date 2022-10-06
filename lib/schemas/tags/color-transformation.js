const { SmartBuffer } = require('../../smart-buffer-extra');
const Tag = require('../tag');

class ColorTransformation extends Tag {
    constructor() {
        super();
        this.ra = 0;
        this.ga = 255;
        this.ba = 0;
        this.am = 0;
        this.rm = 255;
        this.gm = 0;
        this.bm = 0;
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.ra = smartBuf.readUInt8();
        this.ga = smartBuf.readUInt8();
        this.ba = smartBuf.readUInt8();
        this.am = smartBuf.readUInt8();
        this.rm = smartBuf.readUInt8();
        this.gm = smartBuf.readUInt8();
        this.bm = smartBuf.readUInt8();
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeUInt8(this.ra);
        smartBuf.writeUInt8(this.ga);
        smartBuf.writeUInt8(this.ba);
        smartBuf.writeUInt8(this.am);
        smartBuf.writeUInt8(this.rm);
        smartBuf.writeUInt8(this.gm);
        smartBuf.writeUInt8(this.bm);
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = ColorTransformation;
