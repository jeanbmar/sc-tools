import Tag from '../tag.mjs';

class Flag extends Tag {
  static encode(smartBuf, tagSignature) {
    const flag = new this();
    flag.tagSignature = tagSignature;
    flag.encode(smartBuf);
  }
}

export default Flag;
