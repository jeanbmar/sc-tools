class Tag {
  constructor() {
    this.tagSignature = 0;
    this.tagSize = 0;
  }

  static decode(smartbuf) {
    const tag = new this();
    tag.decode(smartbuf);
    return tag;
  }

  static encode(smartBuf) {
    const tag = new this();
    tag.encode(smartBuf);
  }

  decode(smartBuf) {
    this.tagSignature = smartBuf.readUInt8();
    this.tagSize = smartBuf.readInt32LE();
  }

  encode(smartBuf) {
    smartBuf.writeUInt8(this.tagSignature);
    smartBuf.writeInt32LE(this.tagSize);
  }
}

export default Tag;
