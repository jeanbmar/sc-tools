const { basename, join, dirname } = require('path');
const crypto = require('crypto');
const { outputFileSync, readFileSync, existsSync } = require('fs-extra');
const delaunator = require('delaunator');
const UPNG = require('@rushb/node-upng-js');
const scCompression = require('@rushb/sc-compression');
const { SmartBuffer } = require('../smart-buffer-extra');
const colors = require('../colors');
const { getPixelInfo } = require('../pixel-info');
const SupercellSC = require('../schemas/supercell-sc');
const SupercellTexSC = require('../schemas/supercell-tex-sc');

class Importer {
    static async import(inputFilePath, outputDirectory, options) {
        console.info(`importing ${inputFilePath}...`);
        let filename = basename(inputFilePath);
        if (filename.endsWith('_tex.sc')) {
            const originalName = filename;
            filename = `${basename(filename, '_tex.sc')}.sc`;
            console.warn(`${originalName} submitted, ${filename} will be used`);
            inputFilePath = join(dirname(inputFilePath), `${filename}`);
        }
        const projectName = basename(filename, '.sc');
        if (!outputDirectory) {
            outputDirectory = projectName;
        }
        console.info('reading file...');
        const buffer = await this.readScFile(inputFilePath, join(outputDirectory, 'cache'));
        console.info('decoding file data...');
        const sc = SupercellSC.decode(SmartBuffer.fromBuffer(buffer));
        let texFilePath = join(dirname(inputFilePath), `${projectName}_highres_tex.sc`);
        if (!existsSync(texFilePath)) {
            texFilePath = join(dirname(inputFilePath), `${projectName}_lowres_tex.sc`);
        }
        if (!existsSync(texFilePath)) {
            texFilePath = join(dirname(inputFilePath), `${projectName}_tex.sc`);
        }
        if (existsSync(texFilePath)) {
            console.info('reading external texture file...');
            const texBuffer = await this.readScFile(texFilePath, join(outputDirectory, 'cache'));
            console.info('decoding external texture file data...');
            const tex = SupercellTexSC.decode(SmartBuffer.fromBuffer(texBuffer));
            console.info('merging external texture file data with original data...');
            this.mergeTex(sc, tex);
        }
        console.info(`generate project to ${outputDirectory}...`);
        this.sc2scp(outputDirectory, sc, options);
        console.info('done\n');
    }

    // private
    static mergeTex(sc, tex) {
        tex.textures.forEach((texture) => {
            const index = sc.textures.findIndex((scTexture) => !scTexture.pixels.length);
            if (index === -1) {
                throw new Error('could not insert external texture into texture');
            }
            texture.originalSignature = sc.textures[index].tagSignature;
            sc.textures[index] = texture;
        });
    }

    // private
    static async readScFile(filePath, cacheDirectory) {
        let buffer = readFileSync(filePath);
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const cacheFilePath = join(cacheDirectory, `${hash}.cache`);
        if (!existsSync(cacheFilePath)) {
            console.info('  creating cache...');
            buffer = await scCompression.decompress(buffer);
            outputFileSync(cacheFilePath, buffer);
        } else {
            console.info('  existing cache is being used...');
            buffer = readFileSync(cacheFilePath);
        }
        return buffer;
    }

    static sc2scp(outputDirectory, sc, options) {
        options = {
            shapeOuterColor: {
                red: 0, green: 0, blue: 0, alpha: 0,
            },
            flattenShapes: true,
            ...options,
        };
        const name = basename(outputDirectory);

        // init config
        const projectConfig = {
            useTexFiles: !!sc.textureFileFlag,
            compression: scCompression.SC,
            header: {
                header_7: sc.header.header_7,
                header_8: sc.header.header_8,
                header_9: sc.header.header_9,
            },
            exports: sc.exports,
        };
        outputFileSync(join(outputDirectory, `${name}.conf`), JSON.stringify(projectConfig, null, 2));

        // import textures
        sc.textures.forEach((texture, textureIndex) => {
            const { pixels } = texture;
            if (!pixels.length) {
                throw new Error('missing texture data');
            }
            const pixelInfo = getPixelInfo(texture.pixelCode);
            texture.pixelInfo = pixelInfo;
            const texConfig = {
                index: textureIndex,
                signature: texture.tagSignature,
                pixelCode: texture.pixelCode,
            };
            if (texture.originalSignature) {
                texConfig.originalSignature = texture.originalSignature;
            }
            const image = new Uint8Array(pixels.length * pixelInfo.bytesPerPixel);
            texture.image = image;
            for (let i = 0; i < pixels.length; i += 1) {
                const color = colors.decode(pixels[i], pixelInfo.pixelType, pixelInfo.pixelFormat);
                for (let j = 0; j < pixelInfo.bytesPerPixel; j += 1) {
                    image[pixelInfo.bytesPerPixel * i + j] = color[j];
                }
            }
            const png = UPNG.encodeLL([image], texture.width, texture.height, pixelInfo.cc, pixelInfo.ac, 8);
            outputFileSync(join(outputDirectory, 'textures', `${name}_texture_${textureIndex}.png`), Buffer.from(png));
            outputFileSync(join(outputDirectory, 'textures', `${name}_texture_${textureIndex}.conf`), JSON.stringify(texConfig, null, 2));
        });

        // import shapes
        sc.shapes.forEach((shape) => {
            let shapeDirectory = join(outputDirectory, 'shapes');
            if (!options.flattenShapes) {
                shapeDirectory = join(shapeDirectory, `${name}_shape_${shape.exportId}`);
            }
            const exportedCommands = shape.shapeDrawBitmapCommands.map((command) => {
                const exported = {
                    signature: command.tagSignature,
                    textureIndex: command.textureIndex,
                };
                exported.triangles = Array.from(delaunator.from(command.normalizedXY).triangles);
                exported.positions = command.normalizedXY.flat();
                exported.texcoords = command.normalizedUV.flat();
                return exported;
            });
            const exported = {
                signature: shape.tagSignature,
                exportId: shape.exportId,
                totalVertexCount: shape.totalVertexCount,
                shapeDrawBitmapCommands: exportedCommands,
            };
            outputFileSync(join(shapeDirectory, `${name}_shape_${shape.exportId}.conf`), JSON.stringify(exported, null, 2));
        });

        // import textFields
        sc.textFields.forEach((textField) => {
            const textFieldDirectory = join(outputDirectory, 'text_fields');
            const exported = {
                signature: textField.tagSignature,
                exportId: textField.exportId,
                fontName: textField.fontName,
                color: textField.color,
                textField_4: textField.textField_4,
                textField_5: textField.textField_5,
                multiLineFlag: textField.multiLineFlag,
                textField_7: textField.textField_7,
                fontAlign: textField.fontAlign,
                fontSize: textField.fontSize,
                pointX: textField.pointX,
                pointY: textField.pointY,
                pointU: textField.pointU,
                pointV: textField.pointV,
                textField_14: textField.textField_14,
                textField_15: textField.textField_15,
            };
            if (textField.tagSignature !== 7) {
                exported.textField_16 = textField.textField_16;
                if ([21, 25].includes(textField.tagSignature)) {
                    exported.textField_17 = textField.textField_17;
                }
                if ([33, 43, 44].includes(textField.tagSignature)) {
                    exported.textField_17 = textField.textField_17;
                    exported.textField_18 = textField.textField_18;
                    exported.textField_19 = textField.textField_19;
                }
                if ([43, 44].includes(textField.tagSignature)) {
                    exported.textField_20 = textField.textField_20;
                }
                if (textField.tagSignature === 44) {
                    exported.textField_21 = textField.textField_21;
                }
            }
            outputFileSync(join(textFieldDirectory, `${name}_text_field_${textField.exportId}.conf`), JSON.stringify(exported, null, 2));
        });

        // import matrices
        const matricesExport = sc.matrices.map((matrix, matrixIndex) => ({
            index: matrixIndex,
            signature: matrix.tagSignature,
            normalizedScalars: matrix.normalizedScalars,
        }));
        outputFileSync(join(outputDirectory, `${name}_matrices.conf`), JSON.stringify(matricesExport, null, 2));

        // import colorTransformation
        sc.colorTransformations.forEach((colorTransformation, colorTransformationIndex) => {
            const colorTransformationDirectory = join(outputDirectory, 'color_transformations');
            const exported = {
                index: colorTransformationIndex,
                signature: colorTransformation.tagSignature,
                ra: colorTransformation.ra,
                ga: colorTransformation.ga,
                ba: colorTransformation.ba,
                am: colorTransformation.am,
                rm: colorTransformation.rm,
                gm: colorTransformation.gm,
                bm: colorTransformation.bm,
            };
            outputFileSync(join(colorTransformationDirectory, `${name}_color_transformation_${colorTransformationIndex}.conf`), JSON.stringify(exported, null, 2));
        });

        // import movieClips
        sc.movieClips.forEach((movieClip) => {
            const movieClipDirectory = join(outputDirectory, 'movie_clips');
            const exported = {
                signature: movieClip.tagSignature,
                exportId: movieClip.exportId,
                fps: movieClip.fps,
                frameData: movieClip.frameData,
                displayObjectIds: movieClip.displayObjectIds,
                opacities: movieClip.opacities,
                asciis: movieClip.asciis,
            };
            exported.frames = movieClip.frames.map((frame) => ({
                signature: frame.tagSignature,
                displayObjectCount: frame.displayObjectCount,
                label: frame.label,
            }));
            exported.scalingGrids = movieClip.scalingGrids.map((scalingGrid) => ({
                signature: scalingGrid.tagSignature,
                normalizedScalar0: scalingGrid.normalizedScalar0,
                normalizedScalar1: scalingGrid.normalizedScalar1,
                normalizedScalar2: scalingGrid.normalizedScalar2,
                normalizedScalar3: scalingGrid.normalizedScalar3,
            }));
            exported.tag41s = movieClip.tag41s.map((tag41) => ({
                signature: tag41.tagSignature,
                tag41_1: tag41.tag41_1,
            }));
            outputFileSync(join(movieClipDirectory, `${name}_movie_clip_${movieClip.exportId}.conf`), JSON.stringify(exported, null, 2));
        });

        // import timelines
        sc.timelines.forEach((timeline, timelineIndex) => {
            const timelineDirectory = join(outputDirectory, 'timelines');
            const exported = { index: timelineIndex, signature: timeline.tagSignature, indices: timeline.indices };
            outputFileSync(join(timelineDirectory, `${name}_timeline_${timelineIndex}.conf`), JSON.stringify(exported, null, 2));
        });

        // import movie clip modifiers
        sc.movieClipModifiers.forEach((modifier, modifierIndex) => {
            const modifierDirectory = join(outputDirectory, 'movie_clip_modifiers');
            const exported = { index: modifierIndex, signature: modifier.tagSignature };
            outputFileSync(join(modifierDirectory, `${name}_movie_clip_modifier_${modifierIndex}.conf`), JSON.stringify(exported, null, 2));
        });

        // import tag38s
        sc.tag38s.forEach((tag38, tag38Index) => {
            const tag38Directory = join(outputDirectory, 'tag38s');
            const exported = { index: tag38Index, signature: tag38.tagSignature };
            outputFileSync(join(tag38Directory, `${name}_tag38_${tag38Index}.conf`), JSON.stringify(exported, null, 2));
        });

        // import tag45s
        sc.tag42s.forEach((tag42, tag42Index) => {
            const tag42Directory = join(outputDirectory, 'tag42s');
            const exported = { index: tag42Index, signature: tag42.tagSignature };
            outputFileSync(join(tag42Directory, `${name}_tag42_${tag42Index}.conf`), JSON.stringify(exported, null, 2));
        });
    }
}

module.exports = Importer;
