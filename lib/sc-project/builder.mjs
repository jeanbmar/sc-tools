/* eslint-disable no-console, no-param-reassign */
import { basename, join, dirname } from 'path';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import glob from 'glob';
import * as scCompression from 'sc-compression';
import upng from '../upng.mjs';
import { SmartBuffer } from '../smart-buffer.mjs';
import colors from '../gl-color.mjs';
import { getPixelInfo } from '../pixel-info.mjs';
import SupercellSC from '../supercell-sc/supercell-sc.mjs';
import SupercellTexSC from '../supercell-sc/supercell-tex-sc.mjs';
import SwfTexture from '../supercell-sc/tags/swf-texture.mjs';
import ShapeOriginal from '../supercell-sc/tags/shape-original.mjs';
import ShapeDrawBitmapCommand from '../supercell-sc/tags/shape-draw-bitmap-command.mjs';
import TextFieldOriginal from '../supercell-sc/tags/text-field-original.mjs';
import Matrix2x3 from '../supercell-sc/tags/matrix-2x3.mjs';
import ColorTransformation from '../supercell-sc/tags/color-transformation.mjs';
import MovieClipOriginal from '../supercell-sc/tags/movie-clip-original.mjs';
import MovieClipFrame from '../supercell-sc/tags/movie-clip-frame.mjs';
import ScalingGrid from '../supercell-sc/tags/scaling-grid.mjs';
import Tag41 from '../supercell-sc/tags/tag-41.mjs';
import Timeline from '../supercell-sc/tags/timeline.mjs';
import MovieClipModifierOriginal from '../supercell-sc/tags/movie-clip-modifier-original.mjs';
import Tag38 from '../supercell-sc/tags/tag-38.mjs';
import Tag42 from '../supercell-sc/tags/tag-42.mjs';

class Builder {
  static async build(inputProjectDirectory, outputDirectory) {
    const projectName = basename(inputProjectDirectory, '.conf');
    console.info(`building ${projectName}...`);
    if (!outputDirectory) {
      outputDirectory = inputProjectDirectory;
    }
    await this.scp2sc(inputProjectDirectory, outputDirectory);
    console.info('done\n');
  }

  static async scp2sc(inputProjectDirectory, outputDirectory) {
    const name = basename(outputDirectory, '.conf');
    const projectConfig = JSON.parse(
      readFileSync(join(inputProjectDirectory, `${name}.conf`))
    );
    const sc = new SupercellSC();
    sc.header.header_7 = projectConfig.header.header_7;
    sc.header.header_8 = projectConfig.header.header_8;
    sc.header.header_9 = projectConfig.header.header_9;
    sc.exports = projectConfig.exports;
    sc.textureFileFlag = projectConfig.useTexFiles;
    sc.lowresFlag = true;

    // export textures
    const externalTextures = [];
    const textureDirectory = join(inputProjectDirectory, 'textures');
    const texturePaths = glob.sync(join(textureDirectory, '*.png'));
    texturePaths.forEach((texturePath) => {
      const texture = new SwfTexture();
      const texName = basename(texturePath, '.png');
      const texConfig = JSON.parse(
        readFileSync(join(textureDirectory, `${texName}.conf`))
      );
      texture.tagSignature = texConfig.signature;
      const png = upng.decode(readFileSync(texturePath));
      texture.width = png.width;
      texture.height = png.height;
      const image = Uint8Array.from(png.data);
      const pixelInfo = getPixelInfo(texConfig.pixelCode);
      if (png.ctype !== pixelInfo.colorType) {
        console.warn(
          `the given colorType (${png.ctype}) doesn't match with the desired colorType (${pixelInfo.colorType})`
        );
        console.warn('the .sc file may not work as intended');
        console.warn(
          'either convert the image format to desired colorType or change the pixelCode in .conf file in order to match the desired colorType'
        );
      }
      texture.pixelCode = pixelInfo.pixelCode;
      for (let i = 0; i < image.length; i += pixelInfo.bytesPerPixel) {
        texture.pixels.push(
          colors.encode(
            image.slice(i, i + pixelInfo.bytesPerPixel),
            pixelInfo.pixelType,
            pixelInfo.pixelFormat
          )
        );
      }
      if (projectConfig.useTexFiles) {
        sc.textureFileFlag = !!projectConfig.useTexFiles;
        externalTextures[texConfig.index] = texture;
        const placeholder = new SwfTexture();
        placeholder.width = texture.width;
        placeholder.height = texture.height;
        placeholder.pixelCode = texture.pixelCode;
        placeholder.tagSignature = texConfig.originalSignature;
        sc.textures[texConfig.index] = placeholder;
      } else {
        sc.textures[texConfig.index] = texture;
      }
    });

    // export tex textures
    if (projectConfig.useTexFiles) {
      const texSc = new SupercellTexSC();
      externalTextures.forEach((texture) => texSc.textures.push(texture));
      const buffer = new SmartBuffer();
      console.info('encoding external texture file data...');
      texSc.encode(buffer);
      console.info('writing external texture file...');
      await this.writeScFile(
        join(outputDirectory, 'build', `${name}_tex.sc`),
        buffer.toBuffer(),
        projectConfig.compression
      );
    }

    // export shapes
    const shapesDirectory = join(inputProjectDirectory, 'shapes');
    const shapePaths = glob.sync(join(shapesDirectory, '*.conf'));
    sc.shapes = shapePaths
      .map((shapePath) => {
        const shape = new ShapeOriginal();
        const shapeName = basename(shapePath, '.conf');
        const shapeConfig = JSON.parse(
          readFileSync(join(shapesDirectory, `${shapeName}.conf`))
        );
        shape.tagSignature = shapeConfig.signature;
        shape.exportId = shapeConfig.exportId;
        shape.totalVertexCount = shapeConfig.totalVertexCount;
        shape.shapeDrawBitmapCommands = shapeConfig.shapeDrawBitmapCommands.map(
          (commandConfig) => {
            const shapeDrawBitmapCommand = new ShapeDrawBitmapCommand();
            shapeDrawBitmapCommand.tagSignature = commandConfig.signature;
            shapeDrawBitmapCommand.textureIndex = commandConfig.textureIndex;
            const { positions: normalizedXYs, texcoords: normalizedUVs } =
              commandConfig;
            while (normalizedXYs.length) {
              shapeDrawBitmapCommand.normalizedXY.push(
                normalizedXYs.splice(0, 2)
              );
            }
            while (normalizedUVs.length) {
              shapeDrawBitmapCommand.normalizedUV.push(
                normalizedUVs.splice(0, 2)
              );
            }
            shapeDrawBitmapCommand.vertexCount =
              shapeDrawBitmapCommand.normalizedXY.length;
            return shapeDrawBitmapCommand;
          }
        );
        return shape;
      })
      .sort((a, b) => a.exportId - b.exportId); // arrange shapes in increasing order of exportIds

    // export textFields
    const textFieldsDirectory = join(inputProjectDirectory, 'text_fields');
    const textFieldPaths = glob.sync(join(textFieldsDirectory, '*.conf'));
    sc.textFields = textFieldPaths
      .map((textFieldPath) => {
        const textField = new TextFieldOriginal();
        const textFieldName = basename(textFieldPath, '.conf');
        const textFieldConfig = JSON.parse(
          readFileSync(join(textFieldsDirectory, `${textFieldName}.conf`))
        );
        textField.tagSignature = textFieldConfig.signature;
        textField.exportId = textFieldConfig.exportId;
        textField.fontName = textFieldConfig.fontName;
        textField.color = textFieldConfig.color;
        textField.textField_4 = textFieldConfig.textField_4;
        textField.textField_5 = textFieldConfig.textField_5;
        textField.multiLineFlag = textFieldConfig.multiLineFlag;
        textField.textField_7 = textFieldConfig.textField_7;
        textField.fontAlign = textFieldConfig.fontAlign;
        textField.fontSize = textFieldConfig.fontSize;
        textField.pointX = textFieldConfig.pointX;
        textField.pointY = textFieldConfig.pointY;
        textField.pointU = textFieldConfig.pointU;
        textField.pointV = textFieldConfig.pointV;
        textField.textField_14 = textFieldConfig.textField_14;
        textField.textField_15 = textFieldConfig.textField_15;
        textField.textField_16 = textFieldConfig.textField_16;
        textField.textField_17 = textFieldConfig.textField_17;
        textField.textField_18 = textFieldConfig.textField_18;
        textField.textField_19 = textFieldConfig.textField_19;
        textField.textField_20 = textFieldConfig.textField_20;
        textField.textField_21 = textFieldConfig.textField_21;
        return textField;
      })
      .sort((a, b) => a.exportId - b.exportId); // arrange textFields in increasing order of exportIds

    // export matrices
    const matricesFile = join(
      inputProjectDirectory,
      `${basename(inputProjectDirectory)}_matrices.conf`
    );
    const matricesConfig = JSON.parse(readFileSync(matricesFile));
    sc.matrices = matricesConfig.map((matrixConfig) => {
      const matrix2x3 = new Matrix2x3();
      matrix2x3.index = matrixConfig.index;
      matrix2x3.tagSignature = matrixConfig.signature;
      matrix2x3.normalizedScalars = matrixConfig.normalizedScalars;
      return matrix2x3;
    });

    // export colorTransformations
    const colorTransformationsDirectory = join(
      inputProjectDirectory,
      'color_transformations'
    );
    const colorTransformationPaths = glob.sync(
      join(colorTransformationsDirectory, '*.conf')
    );
    sc.colorTransformations = colorTransformationPaths
      .map((colorTransformationPath) => {
        const colorTransformation = new ColorTransformation();
        const colorTransformationName = basename(
          colorTransformationPath,
          '.conf'
        );
        const colorTransformationConfig = JSON.parse(
          readFileSync(
            join(
              colorTransformationsDirectory,
              `${colorTransformationName}.conf`
            )
          )
        );
        colorTransformation.index = colorTransformationConfig.index;
        colorTransformation.tagSignature = colorTransformationConfig.signature;
        colorTransformation.ra = colorTransformationConfig.ra;
        colorTransformation.ga = colorTransformationConfig.ga;
        colorTransformation.ba = colorTransformationConfig.ba;
        colorTransformation.am = colorTransformationConfig.am;
        colorTransformation.rm = colorTransformationConfig.rm;
        colorTransformation.gm = colorTransformationConfig.gm;
        colorTransformation.bm = colorTransformationConfig.bm;
        return colorTransformation;
      })
      .sort((a, b) => a.index - b.index); // arrange in increasing order

    // export movieClips
    const movieClipsDirectory = join(inputProjectDirectory, 'movie_clips');
    const movieClipPaths = glob.sync(join(movieClipsDirectory, '*.conf'));
    sc.movieClips = movieClipPaths
      .map((movieClipPath) => {
        const movieClip = new MovieClipOriginal();
        const movieClipName = basename(movieClipPath, '.conf');
        const movieClipConfig = JSON.parse(
          readFileSync(join(movieClipsDirectory, `${movieClipName}.conf`))
        );
        movieClip.tagSignature = movieClipConfig.signature;
        movieClip.exportId = movieClipConfig.exportId;
        movieClip.fps = movieClipConfig.fps;
        movieClip.frameCount = movieClipConfig.frames.length;
        movieClip.frameData = movieClipConfig.frameData;
        movieClip.frameDataLength =
          movieClip.tagSignature === 14 ? 14 : movieClip.frameData.length;
        movieClip.displayObjectIds = movieClipConfig.displayObjectIds;
        movieClip.opacities = movieClipConfig.opacities;
        movieClip.asciis = movieClipConfig.asciis;
        movieClip.frames = movieClipConfig.frames.map((frameConfig) => {
          const movieClipFrame = new MovieClipFrame();
          movieClipFrame.tagSignature = frameConfig.signature;
          movieClipFrame.displayObjectCount = frameConfig.displayObjectCount;
          movieClipFrame.label = frameConfig.label;
          return movieClipFrame;
        });
        movieClip.scalingGrids = movieClipConfig.scalingGrids.map(
          (scalingGridConfig) => {
            const scalingGrid = new ScalingGrid();
            scalingGrid.tagSignature = scalingGridConfig.signature;
            scalingGrid.normalizedScalar0 = scalingGridConfig.normalizedScalar0;
            scalingGrid.normalizedScalar1 = scalingGridConfig.normalizedScalar1;
            scalingGrid.normalizedScalar2 = scalingGridConfig.normalizedScalar2;
            scalingGrid.normalizedScalar3 = scalingGridConfig.normalizedScalar3;
            return scalingGrid;
          }
        );
        movieClip.tag41s = movieClipConfig.tag41s.map((tag41Config) => {
          const tag41 = new Tag41();
          tag41.tagSignature = tag41Config.signature;
          tag41.tag41_1 = tag41Config.tag41_1;
          return tag41;
        });
        return movieClip;
      })
      .sort((a, b) => a.exportId - b.exportId); // arrange movieClips in increasing order of exportIds;

    // updating header
    sc.header.shapeCount = sc.shapes.length;
    sc.header.movieClipCount = sc.movieClips.length;
    sc.header.textureCount = sc.textures.length;
    sc.header.textFieldCount = sc.textFields.length;
    sc.header.matrixCount = sc.matrices.length;
    sc.header.colorTransformationCount = sc.colorTransformations.length;

    // export timelines
    const timelinesDirectory = join(inputProjectDirectory, 'timelines');
    const timelinePaths = glob.sync(join(timelinesDirectory, '*.conf'));
    sc.timelines = timelinePaths
      .map((timelinePath) => {
        const timeline = new Timeline();
        const timelineName = basename(timelinePath, '.conf');
        const timelineConfig = JSON.parse(
          readFileSync(join(timelinesDirectory, `${timelineName}.conf`))
        );
        timeline.index = timelineConfig.index;
        timeline.tagSignature = timelineConfig.signature;
        timeline.indices = timelineConfig.indices;
        return timeline;
      })
      .sort((a, b) => a.index - b.index); // arrange in increasing order

    // export movie clip modifiers
    const modifiersDirectory = join(
      inputProjectDirectory,
      'movie_clip_modifiers'
    );
    const modifierPaths = glob.sync(join(modifiersDirectory, '*.conf'));
    sc.movieClipModifiers = modifierPaths
      .map((modifierPath) => {
        const modifier = new MovieClipModifierOriginal();
        const modifierName = basename(modifierPath, '.conf');
        const modifierConfig = JSON.parse(
          readFileSync(join(modifiersDirectory, `${modifierName}.conf`))
        );
        modifier.index = modifierConfig.index;
        modifier.tagSignature = modifierConfig.signature;
        return modifier;
      })
      .sort((a, b) => a.index - b.index); // arrange in increasing order

    // export tag38s
    const tag38sDirectory = join(inputProjectDirectory, 'tag38s');
    const tag38Paths = glob.sync(join(tag38sDirectory, '*.conf'));
    sc.tag38s = tag38Paths
      .map((timelinePath) => {
        const tag38 = new Tag38();
        const tag38Name = basename(timelinePath, '.conf');
        const tag38Config = JSON.parse(
          readFileSync(join(tag38sDirectory, `${tag38Name}.conf`))
        );
        tag38.index = tag38Config.index;
        tag38.tagSignature = tag38Config.signature;
        return tag38;
      })
      .sort((a, b) => a.index - b.index); // arrange in increasing order

    // export tag42s
    const tag42sDirectory = join(inputProjectDirectory, 'tag42s');
    const tag42Paths = glob.sync(join(timelinesDirectory, '*.conf'));
    sc.tag42s = tag42Paths
      .map((timelinePath) => {
        const tag42 = new Tag42();
        const tag42Name = basename(timelinePath, '.conf');
        const tag42Config = JSON.parse(
          readFileSync(join(tag42sDirectory, `${tag42Name}.conf`))
        );
        tag42.index = tag42Config.index;
        tag42.tagSignature = tag42Config.signature;
        return tag42;
      })
      .sort((a, b) => a.index - b.index); // arrange in increasing order

    // export sc file
    const buffer = new SmartBuffer();
    console.info('encoding file data...');
    sc.encode(buffer);
    console.info('writing file...');
    await this.writeScFile(
      join(outputDirectory, 'build', `${name}.sc`),
      buffer.toBuffer(),
      projectConfig.compression
    );
  }

  static async writeScFile(filePath, buffer, compression) {
    console.info('  compressing file');
    buffer = await scCompression.compress(buffer, compression);
    console.info('  writing to disk');
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, buffer);
  }
}

export default Builder;
