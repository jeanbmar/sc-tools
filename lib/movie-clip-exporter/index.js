// helper class to export movie clips
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const UPNG = require('@rushb/node-upng-js');
const { SmartBuffer } = require('../smart-buffer-extra');
const SupercellSCDecoder = require('../schemas/supercell-sc');
const SupercellTexSCDecoder = require('../schemas/supercell-tex-sc');
const { Stage, SupercellSC } = require('../engine');

class MovieClipExporter {
    static async exportAll(scFilePath, outputDir) {
        if (scFilePath.endsWith('_tex.sc')) {
            return;
        }
        const decodedFile = await this.decodeFile(scFilePath);
        const loadedScFile = new SupercellSC(decodedFile);
        const availableExportNames = loadedScFile.getAvailableExportNames();
        // eslint-disable-next-line no-restricted-syntax
        for (const exportName of availableExportNames) {
            console.log(`exporting ${exportName}`);
            const movieClip = loadedScFile.getExport(exportName);
            const stage = new Stage();
            movieClip.ensureBounds(stage);
            movieClip.render(stage);
            const width = stage.getWidth();
            const height = stage.getHeight();
            const pixels = new Uint8Array(width * height * 4);
            stage.glContext.readPixels(0, 0, width, height, stage.glContext.RGBA, stage.glContext.UNSIGNED_BYTE, pixels);
            // flip
            this.flip(pixels, width, height);
            const png = UPNG.encodeLL([pixels], stage.getWidth(), stage.getHeight(), 3, 1, 8);
            await fsp.writeFile(path.join(outputDir, `${exportName}.png`), Buffer.from(png));
            stage.destroy(); // release resources
        }
    }

    // convert pixels direction from gl to png
    static flip(pixels, width, height) {
        const rowBuffer = new Uint8Array(width * 4);
        const halfHeight = Math.trunc(height / 2);
        const rowSize = width * 4;
        for (let y = 0; y < halfHeight; y += 1) {
            const topOffset = y * rowSize;
            const bottomOffset = (height - y - 1) * rowSize;
            rowBuffer.set(pixels.subarray(topOffset, topOffset + rowSize));
            pixels.copyWithin(topOffset, bottomOffset, bottomOffset + rowSize);
            pixels.set(rowBuffer, bottomOffset);
        }
    }

    static async decodeFile(scFilePath) {
        const scBuffer = await fsp.readFile(scFilePath);
        const scFile = SupercellSCDecoder.decode(SmartBuffer.fromBuffer(scBuffer));
        const texFilePath = scFilePath.replace('.sc', '_tex.sc');
        if (fs.existsSync(texFilePath)) {
            const texBuffer = await fsp.readFile(texFilePath);
            const texFile = SupercellTexSCDecoder.decode(SmartBuffer.fromBuffer(texBuffer));
            texFile.textures.forEach((texture) => {
                const index = scFile.textures.findIndex((scTexture) => scTexture.pixels.length === 0);
                if (index === -1) {
                    throw new Error('could not insert external texture into texture');
                }
                texture.originalSignature = scFile.textures[index].tagSignature;
                scFile.textures[index] = texture;
            });
        }
        return scFile;
    }
}

module.exports = MovieClipExporter;
