import { SmartBuffer } from '../../smart-buffer.mjs';
import Tag from '../tag.mjs';

class Tag38 extends Tag {
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

export default Tag38;
