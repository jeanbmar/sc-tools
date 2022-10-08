import { SmartBuffer as Base } from 'smart-buffer';

export class SmartBuffer extends Base {
  readAscii() {
    const length = this.readUInt8();
    if (length === 255) return null;
    return this.readString(length);
  }

  writeAscii(value, fixed = false) {
    if (!value && !fixed) {
      this.writeUInt8(255);
    } else {
      if (!fixed) this.writeUInt8(value.length);
      this.writeString(value);
    }
  }

  readBoolean() {
    return this.readUInt8() === 1;
  }

  writeBoolean(value) {
    this.writeUInt8(value === true ? 1 : 0);
  }
}

export default { SmartBuffer };
