module.exports = {
    descramble: (pixels, width, height) => {
        const result = new Array(height * width);
        let pixelIndex = 0;
        for (let currentHeight = 0; currentHeight < height; currentHeight += 32) {
            const subBlockHeight = Math.min(currentHeight + 32, height) - currentHeight;
            for (let i = 0; i < width; i += 64) {
                const subBlockWidth = Math.min(width - i, 64);
                let remaining = subBlockWidth;
                let blockIndex = 0;
                for (let j = i; j < i + subBlockWidth; j += 32) {
                    const step = Math.min(remaining, 32);
                    remaining -= step;
                    let arrayIndex = j + currentHeight * width;
                    for (let k = 0; k < subBlockHeight; k += 1) {
                        for (let l = 0; l < step; l += 1) {
                            result[arrayIndex + l] = pixels[pixelIndex + blockIndex + l];
                        }
                        arrayIndex += width;
                        blockIndex += step;
                    }
                }
                pixelIndex += subBlockWidth * subBlockHeight;
            }
        }
        return result;
    },
    scramble: (pixels, width, height) => {
        const result = new Array(height * width);
        let pixelIndex = 0;
        for (let currentHeight = 0; currentHeight < height; currentHeight += 32) {
            const subBlockHeight = Math.min(currentHeight + 32, height) - currentHeight;
            for (let i = 0; i < width; i += 64) {
                const subBlockWidth = Math.min(width - i, 64);
                let remaining = subBlockWidth;
                let blockIndex = 0;
                for (let j = i; j < i + subBlockWidth; j += 32) {
                    const step = Math.min(remaining, 32);
                    remaining -= step;
                    let arrayIndex = j + currentHeight * width;
                    for (let k = 0; k < subBlockHeight; k += 1) {
                        for (let l = 0; l < step; l += 1) {
                            result[pixelIndex + blockIndex + l] = pixels[arrayIndex + l];
                        }
                        arrayIndex += width;
                        blockIndex += step;
                    }
                }
                pixelIndex += subBlockWidth * subBlockHeight;
            }
        }
        return result;
    },
};
