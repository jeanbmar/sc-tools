import { SmartBuffer } from '../../smart-buffer.mjs';
import Tag from '../tag.mjs';

class Tag42 extends Tag {
  constructor() {
    super();
    this.tag42_1 = 0;
    this.tag42_2 = 0;
  }

  decode(smartBuf) {
    super.decode(smartBuf);
    this.tag42_1 = smartBuf.readUInt16LE();
    this.tag42_2 = smartBuf.readUInt16LE();
  }

  encode(mainBuf) {
    const smartBuf = new SmartBuffer();
    smartBuf.writeUInt16LE(this.tag42_1);
    smartBuf.writeUInt16LE(this.tag42_2);
    this.tagSize = smartBuf.length;
    super.encode(mainBuf);
    mainBuf.writeBuffer(smartBuf.toBuffer());
  }
}
export default Tag42;
