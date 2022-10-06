const Tag = require('../tag');

class Flag extends Tag {
    static encode(smartBuf, tagSignature) {
        const flag = new this();
        flag.tagSignature = tagSignature;
        flag.encode(smartBuf);
    }
}

module.exports = Flag;
