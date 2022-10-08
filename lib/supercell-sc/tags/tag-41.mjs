import { SmartBuffer } from '../../smart-buffer.mjs';
import Tag from '../tag.mjs';

class Tag41 extends Tag {
  constructor() {
    super();
    this.tag41_1 = 0;
  }

  decode(smartBuf) {
    super.decode(smartBuf);
    this.tag41_1 = smartBuf.readUInt8();
  }

  encode(mainBuf) {
    const smartBuf = new SmartBuffer();
    smartBuf.writeUInt8(this.tag41_1);
    this.tagSize = smartBuf.length;
    super.encode(mainBuf);
    mainBuf.writeBuffer(smartBuf.toBuffer());
  }
}

export default Tag41;
