import { SmartBuffer } from '../../smart-buffer.mjs';
import Tag from '../tag.mjs';

class Timeline extends Tag {
  constructor() {
    super();
    this.indices = [];
  }

  decode(smartBuf) {
    super.decode(smartBuf);
    for (let i = smartBuf.readInt32LE(); i; i -= 1) {
      this.indices.push(smartBuf.readInt16LE());
    }
  }

  encode(mainBuf) {
    const smartBuf = new SmartBuffer();
    smartBuf.writeInt32LE(this.indices.length);
    this.indices.forEach((index) => smartBuf.writeInt16LE(index));
    this.tagSize = smartBuf.length;
    super.encode(mainBuf);
    mainBuf.writeBuffer(smartBuf.toBuffer());
  }
}

export default Timeline;
