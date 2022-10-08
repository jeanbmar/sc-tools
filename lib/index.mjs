import Importer from './sc-project/importer.mjs';
import Builder from './sc-project/builder.mjs';
import PngShapeBuilder from './sc-project/png-shape-builder.mjs';
// const MovieClipExporter = require('./movie-clip-exporter');

module.exports = {
  import: (inputFilePath, outputDirectory, options) =>
    Importer.import(inputFilePath, outputDirectory, options),
  build: (inputProjectDirectory, outputDirectory) =>
    Builder.build(inputProjectDirectory, outputDirectory),
  buildPngShapes: (inputProjectDirectory, outputDirectory) =>
    PngShapeBuilder.build(inputProjectDirectory, outputDirectory),
  // MovieClipExporter,
};
