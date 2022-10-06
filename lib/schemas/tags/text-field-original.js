const { SmartBuffer } = require('../../smart-buffer-extra');
const Tag = require('../tag');

class TextFieldOriginal extends Tag {
    constructor() {
        super();
        this.exportId = -1;
        this.fontName = 'Times New Roman';
        this.color = -1;
        this.textField_4 = false;
        this.textField_5 = false;
        this.multiLineFlag = false;
        this.textField_7 = false;
        this.fontAlign = 0;
        this.fontSize = 12;
        this.pointX = 0;
        this.pointY = 0;
        this.pointU = 0;
        this.pointV = 0;
        this.textField_14 = false;
        this.textField_15 = null;
        this.textField_16 = false;
        this.textField_17 = 0;
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.exportId = smartBuf.readInt16LE();
        this.fontName = smartBuf.readAscii();
        this.color = smartBuf.readInt32LE();
        this.textField_4 = smartBuf.readBoolean();
        this.textField_5 = smartBuf.readBoolean();
        this.multiLineFlag = smartBuf.readBoolean();
        this.textField_7 = smartBuf.readBoolean();
        this.fontAlign = smartBuf.readUInt8(); // 0 or 1 or 2 = Align ? (3 = ALIGN_JUSTIFY)
        this.fontSize = smartBuf.readUInt8(); // 8, 12, 14, 16, 18, 20, 22, 36 or 45
        this.pointX = smartBuf.readInt16LE();
        this.pointY = smartBuf.readInt16LE();
        this.pointU = smartBuf.readInt16LE();
        this.pointV = smartBuf.readInt16LE();
        this.textField_14 = smartBuf.readBoolean();
        this.textField_15 = smartBuf.readAscii();
        if (this.tagSignature !== 7) {
            this.textField_16 = smartBuf.readBoolean();
            if ([21, 25].includes(this.tagSignature)) {
                this.textField_17 = smartBuf.readUInt32LE();
            }
            if ([33, 43, 44].includes(this.tagSignature)) {
                this.textField_17 = smartBuf.readUInt32LE();
                this.textField_18 = smartBuf.readInt16LE();
                this.textField_19 = smartBuf.readInt16LE();
            }
            if ([43, 44].includes(this.tagSignature)) {
                this.textField_20 = smartBuf.readInt16LE();
            }
            if (this.tagSignature === 44) {
                this.textField_21 = smartBuf.readUInt8();
            }
        }
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeInt16LE(this.exportId);
        smartBuf.writeAscii(this.fontName);
        smartBuf.writeInt32LE(this.color);
        smartBuf.writeBoolean(this.textField_4);
        smartBuf.writeBoolean(this.textField_5);
        smartBuf.writeBoolean(this.multiLineFlag);
        smartBuf.writeBoolean(this.textField_7);
        smartBuf.writeUInt8(this.fontAlign);
        smartBuf.writeUInt8(this.fontSize);
        smartBuf.writeInt16LE(this.pointX);
        smartBuf.writeInt16LE(this.pointY);
        smartBuf.writeInt16LE(this.pointU);
        smartBuf.writeInt16LE(this.pointV);
        smartBuf.writeBoolean(this.textField_14);
        smartBuf.writeAscii(this.textField_15);
        if (this.tagSignature !== 7) {
            smartBuf.writeBoolean(this.textField_16);
            if ([21, 25].includes(this.tagSignature)) {
                smartBuf.writeUInt32LE(this.textField_17);
            }
            if ([33, 43, 44].includes(this.tagSignature)) {
                smartBuf.writeUInt32LE(this.textField_17);
                smartBuf.writeInt16LE(this.textField_18);
                smartBuf.writeInt16LE(this.textField_19);
            }
            if ([43, 44].includes(this.tagSignature)) {
                smartBuf.writeInt16LE(this.textField_20);
            }
            if (this.tagSignature === 44) {
                smartBuf.writeUInt8(this.textField_21);
            }
        }
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = TextFieldOriginal;
