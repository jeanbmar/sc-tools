const smartBuffer = require('smart-buffer');

Object.defineProperty(smartBuffer.SmartBuffer.prototype, 'readAscii', {
    value() {
        const length = this.readUInt8();
        if (length === 255) {
            return null;
        }
        return this.readString(length);
    },
});

Object.defineProperty(smartBuffer.SmartBuffer.prototype, 'writeAscii', {
    value(str, fixed = false) {
        if (!str && !fixed) {
            this.writeUInt8(255);
        } else {
            if (!fixed) this.writeUInt8(str.length);
            this.writeString(str);
        }
    },
});

Object.defineProperty(smartBuffer.SmartBuffer.prototype, 'readBoolean', {
    value() {
        return this.readUInt8() === 1;
    },
});

Object.defineProperty(smartBuffer.SmartBuffer.prototype, 'writeBoolean', {
    value(b) {
        this.writeUInt8(b === true ? 1 : 0);
    },
});

module.exports = smartBuffer;
