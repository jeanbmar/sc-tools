const Importer = require('./sc-project/importer');
const Builder = require('./sc-project/builder');
const PngShapeBuilder = require('./sc-project/png-shape-builder');
const MovieClipExporter = require('./movie-clip-exporter');

module.exports = {
    import: (inputFilePath, outputDirectory, options) => Importer.import(inputFilePath, outputDirectory, options),
    build: (inputProjectDirectory, outputDirectory) => Builder.build(inputProjectDirectory, outputDirectory),
    buildPngShapes: (inputProjectDirectory, outputDirectory) => PngShapeBuilder.build(inputProjectDirectory, outputDirectory),
    MovieClipExporter,
};
