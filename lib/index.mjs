import Importer from './sc-project/importer.mjs';
import Builder from './sc-project/builder.mjs';
import PngShapeBuilder from './sc-project/png-shape-builder.mjs';
// const MovieClipExporter = require('./movie-clip-exporter');

export const unpack = (inputFilePath, outputDirectory, options) =>
  Importer.import(inputFilePath, outputDirectory, options);

export const pack = (inputProjectDirectory, outputDirectory) =>
  Builder.build(inputProjectDirectory, outputDirectory);

export const buildPngShapes = (inputProjectDirectory, outputDirectory) =>
  PngShapeBuilder.build(inputProjectDirectory, outputDirectory);

export default {
  unpack,
  pack,
  buildPngShapes,
};
