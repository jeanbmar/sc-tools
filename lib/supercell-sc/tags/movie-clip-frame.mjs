import { SmartBuffer } from '../../smart-buffer.mjs';
import Tag from '../tag.mjs';

class MovieClipFrame extends Tag {
  constructor() {
    super();
    this.displayObjectCount = 0;
    this.label = null;
  }

  decode(smartBuf) {
    super.decode(smartBuf);
    this.displayObjectCount = smartBuf.readInt16LE();
    this.label = smartBuf.readAscii();
  }

  encode(mainBuf) {
    const smartBuf = new SmartBuffer();
    smartBuf.writeInt16LE(this.displayObjectCount);
    smartBuf.writeAscii(this.label);
    this.tagSize = smartBuf.length;
    super.encode(mainBuf);
    mainBuf.writeBuffer(smartBuf.toBuffer());
  }
}

export default MovieClipFrame;
