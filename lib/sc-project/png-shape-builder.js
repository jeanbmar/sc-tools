/* eslint-disable no-console, no-param-reassign */
import { basename, join } from 'path';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import glob from 'glob';
import belongsToPolygon from 'point-in-polygon';
import gl from 'gl-constants';
import upng from '../upng.mjs';
import colors from '../gl-color.mjs';
import { getPixelInfo } from '../pixel-info.mjs';
import SupercellSC from '../supercell-sc/supercell-sc.mjs';
import SwfTexture from '../supercell-sc/tags/swf-texture.mjs';
import ShapeOriginal from '../supercell-sc/tags/shape-original.mjs';
import ShapeDrawBitmapCommand from '../supercell-sc/tags/shape-draw-bitmap-command.mjs';

class PngShapeBuilder {
  static build(inputProjectDirectory, outputDirectory) {
    const projectName = basename(inputProjectDirectory, '.conf');
    console.info(`building ${projectName} png shapes...`);
    if (!outputDirectory) {
      outputDirectory = inputProjectDirectory;
    }
    this.scp2sc(inputProjectDirectory, outputDirectory);
    console.info('done\n');
  }

  static scp2sc(inputProjectDirectory, outputDirectory) {
    const name = basename(outputDirectory, '.conf');
    const sc = new SupercellSC();

    // load textures
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
      texture.pixelCode = pixelInfo.pixelCode;
      texture.image = image;
      texture.pixelInfo = pixelInfo;
      for (let i = 0; i < image.length; i += pixelInfo.bytesPerPixel) {
        texture.pixels.push(
          colors.encode(
            image.slice(i, i + pixelInfo.bytesPerPixel),
            pixelInfo.pixelType,
            pixelInfo.pixelFormat
          )
        );
      }
      sc.textures[texConfig.index] = texture;
    });

    // load shapes
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

    // export commands
    const pngShapesDirectory = join(outputDirectory, 'png-shapes');
    mkdirSync(pngShapesDirectory, { recursive: true });
    sc.shapes.forEach((shape) => {
      shape.shapeDrawBitmapCommands.forEach((command, commandIndex) => {
        const texture = sc.textures[command.textureIndex];
        const { pixelInfo, image: sourceImage } = texture;
        const vertices = [];
        // round 1, denormalize
        for (let i = 0; i < command.vertexCount; i += 1) {
          vertices.push({
            x: command.normalizedXY[i][0] * 0.05,
            y: command.normalizedXY[i][1] * 0.05,
            u:
              command.tagSignature === 22
                ? Math.round(
                    (command.normalizedUV[i][0] * texture.width) / 0xffff
                  )
                : command.normalizedUV[i][0],
            v:
              command.tagSignature === 22
                ? Math.round(
                    (command.normalizedUV[i][1] * texture.height) / 0xffff
                  )
                : command.normalizedUV[i][1],
          });
        }
        // round 2, get width and height in both texture and final command
        const uMax = vertices.reduce(
          (max, vertex) => (vertex.u > max ? vertex.u : max),
          vertices[0].u
        );
        const uMin = vertices.reduce(
          (min, vertex) => (vertex.u < min ? vertex.u : min),
          vertices[0].u
        );
        const width = uMax - uMin < 1 ? 1 : uMax - uMin;
        const vMax = vertices.reduce(
          (max, vertex) => (vertex.v > max ? vertex.v : max),
          vertices[0].v
        );
        const vMin = vertices.reduce(
          (min, vertex) => (vertex.v < min ? vertex.v : min),
          vertices[0].v
        );
        const height = vMax - vMin < 1 ? 1 : vMax - vMin;
        for (let i = 0; i < command.vertexCount; i += 1) {
          vertices[i].x /= width < 1 ? 1 : width;
          vertices[i].y /= height < 1 ? 1 : height;
        }
        // round 3, copy pixels to final image
        const polygon = vertices.map((vertex) => [vertex.u, vertex.v]);
        const image = new Uint8Array(width * height * pixelInfo.bytesPerPixel);
        for (let x = uMin; x < uMin + width; x += 1) {
          for (let y = vMin; y < vMax + height; y += 1) {
            const targetIndex =
              (width * (y - vMin) + (x - uMin)) * pixelInfo.bytesPerPixel;
            if (belongsToPolygon([x, y], polygon)) {
              const sourceIndex =
                (texture.width * y + x) * pixelInfo.bytesPerPixel;
              for (let i = 0; i < pixelInfo.bytesPerPixel; i += 1) {
                image[targetIndex + i] = sourceImage[sourceIndex + i];
              }
            } else if (
              pixelInfo.pixelFormat === gl.RGB ||
              pixelInfo.pixelFormat === gl.RGBA
            ) {
              image[targetIndex] = 0;
              image[targetIndex + 1] = 0;
              image[targetIndex + 2] = 0;
              if (pixelInfo.pixelFormat === gl.RGBA) {
                image[targetIndex + 3] = 0;
              }
            }
          }
        }
        const png = upng.encodeLL(
          [image],
          width,
          height,
          pixelInfo.cc,
          pixelInfo.ac,
          8
        );
        writeFileSync(
          join(
            pngShapesDirectory,
            `${name}_shape_${shape.exportId}_${commandIndex}.png`
          ),
          Buffer.from(png)
        );
      });
    });
  }
}

export default PngShapeBuilder;
