import { SmartBuffer } from '../smart-buffer.mjs';

class Header {
  constructor() {
    this.shapeCount = 0;
    this.movieClipCount = 0;
    this.textureCount = 0;
    this.textFieldCount = 0;
    this.matrixCount = 0;
    this.colorTransformationCount = 0;
    this.header_7 = 0;
    this.header_8 = 0;
    this.header_9 = 0;
  }

  decode(smartBuf) {
    this.shapeCount = smartBuf.readUInt16LE();
    this.movieClipCount = smartBuf.readUInt16LE();
    this.textureCount = smartBuf.readUInt16LE();
    this.textFieldCount = smartBuf.readUInt16LE();
    this.matrixCount = smartBuf.readUInt16LE();
    this.colorTransformationCount = smartBuf.readUInt16LE();
    this.header_7 = smartBuf.readUInt8();
    this.header_8 = smartBuf.readInt16LE();
    this.header_9 = smartBuf.readInt16LE();
  }

  encode(mainBuf) {
    const smartBuf = new SmartBuffer();
    smartBuf.writeUInt16LE(this.shapeCount);
    smartBuf.writeUInt16LE(this.movieClipCount);
    smartBuf.writeUInt16LE(this.textureCount);
    smartBuf.writeUInt16LE(this.textFieldCount);
    smartBuf.writeUInt16LE(this.matrixCount);
    smartBuf.writeUInt16LE(this.colorTransformationCount);
    smartBuf.writeUInt8(this.header_7);
    smartBuf.writeInt16LE(this.header_8);
    smartBuf.writeInt16LE(this.header_9);
    mainBuf.writeBuffer(smartBuf.toBuffer());
  }
}

export default Header;
