import SwfTexture from './tags/swf-texture.mjs';
import Tag from './tag.mjs';

const EndOfFile = new Tag();

class SupercellTexSC {
  constructor() {
    this.textures = [];
  }

  static decode(smartBuf) {
    const file = new this();
    file.decode(smartBuf);
    return file;
  }

  decode(smartBuf) {
    while (smartBuf.remaining()) {
      const tagSignature = smartBuf.readUInt8();
      const tagSize = smartBuf.readInt32LE();
      smartBuf.readOffset -= 5;
      switch (tagSignature) {
        case 0:
          EndOfFile.decode(smartBuf);
          if (smartBuf.remaining()) {
            throw new Error(
              `found EndOfFile tag but ${smartBuf.remaining()} bytes are remaining`
            );
          }
          break;
        case 1:
        case 16:
        case 28:
        case 29:
        case 19:
        case 24:
        case 27:
          this.textures.push(SwfTexture.decode(smartBuf));
          break;
        default:
          throw new Error(
            `unknown tag signature ${tagSignature} of size ${tagSize} found when decoding ${this.constructor.name}`
          );
      }
    }
  }

  encode(smartBuf) {
    this.textures.forEach((texture) => {
      texture.encode(smartBuf);
    });
    EndOfFile.encode(smartBuf);
  }
}

export default SupercellTexSC;
