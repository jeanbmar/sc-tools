import { SmartBuffer } from '../../smart-buffer.mjs';
import { interlace, deinterlace } from '../../interlacing.mjs';
import Tag from '../tag.mjs';

class SwfTexture extends Tag {
  constructor() {
    super();
    this.pixels = [];
    this.pixelCode = 0;
    this.width = 0;
    this.height = 0;
  }

  decode(smartBuf) {
    super.decode(smartBuf);
    this.pixelCode = smartBuf.readUInt8();
    this.width = smartBuf.readInt16LE();
    this.height = smartBuf.readInt16LE();
    if (this.tagSize > 5) {
      switch (this.pixelCode) {
        case 2:
        case 9:
        case 3:
        case 4:
        case 6:
          for (let i = this.width * this.height; i; i -= 1) {
            this.pixels.push(smartBuf.readUInt16LE());
          }
          break;
        case 10:
          for (let i = this.width * this.height; i; i -= 1) {
            this.pixels.push(smartBuf.readUInt8());
          }
          break;
        default:
          for (let i = this.width * this.height; i; i -= 1) {
            this.pixels.push(smartBuf.readUInt32LE());
          }
      }
    }
    if ([27, 28, 29].includes(this.tagSignature)) {
      this.pixels = deinterlace(this.pixels, this.width, this.height);
    }
  }

  encode(mainBuf) {
    const smartBuf = new SmartBuffer();
    smartBuf.writeUInt8(this.pixelCode);
    smartBuf.writeInt16LE(this.width);
    smartBuf.writeInt16LE(this.height);
    if (this.pixels.length) {
      this.pixels.splice(this.width * this.height);
      if ([27, 28, 29].includes(this.tagSignature)) {
        this.pixels = interlace(this.pixels, this.width, this.height);
      }
      switch (this.pixelCode) {
        case 2:
        case 9:
        case 3:
        case 4:
        case 6:
          this.pixels.forEach((pixel) => smartBuf.writeUInt16LE(pixel));
          break;
        case 10:
          this.pixels.forEach((pixel) => smartBuf.writeUInt8(pixel));
          break;
        default:
          this.pixels.forEach((pixel) => smartBuf.writeUInt32LE(pixel));
      }
    }
    this.tagSize = smartBuf.length;
    super.encode(mainBuf);
    mainBuf.writeBuffer(smartBuf.toBuffer());
  }
}

export default SwfTexture;
