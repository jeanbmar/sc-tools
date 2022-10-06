const { getPixelInfo } = require('../../pixel-info');
const colors = require('../../colors');

class Texture {
    constructor(rawTexture) {
        this.pixelInfo = getPixelInfo(rawTexture.pixelCode);
        this.width = rawTexture.width;
        this.height = rawTexture.height;
        this.data = new Uint8Array(rawTexture.pixels.length * this.pixelInfo.bytesPerPixel);
        for (let i = 0; i < rawTexture.pixels.length; i += 1) {
            const color = colors.decode(rawTexture.pixels[i], this.pixelInfo.pixelType, this.pixelInfo.pixelFormat);
            for (let j = 0; j < this.pixelInfo.bytesPerPixel; j += 1) {
                this.data[this.pixelInfo.bytesPerPixel * i + j] = color[j];
            }
        }
    }
}

module.exports = Texture;
