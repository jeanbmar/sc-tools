const Matrix = require('./matrix');
const MovieClipFrame = require('./movie-clip-frame');

class MovieClip {
    constructor(rawMovieClip, scFile) {
        // this.rawMovieClip = rawMovieClip;
        this.exportId = rawMovieClip.exportId;
        this.fps = rawMovieClip.fps;
        this.displayObjects = rawMovieClip.displayObjectIds.map((id) => scFile.getDisplayObject(id));
        this.asciis = rawMovieClip.asciis;
        // eslint-disable-next-line no-unused-vars
        this.frameData = rawMovieClip.frameData.map(([displayObjectIndex, matrixIndex, colorTransformIndex]) => ({
            visible: this.asciis[displayObjectIndex] === null,
            displayObject: displayObjectIndex !== 0xFFFF ? this.displayObjects[displayObjectIndex] : null,
            matrix: matrixIndex !== 0xFFFF ? scFile.getMatrix(matrixIndex) : Matrix.identity2x3(),
        }));
        let frameDataStartIndex = 0;
        this.frames = rawMovieClip.frames.map((rawFrame) => {
            const frameData = this.frameData.slice(frameDataStartIndex, frameDataStartIndex + rawFrame.displayObjectCount);
            frameDataStartIndex += rawFrame.displayObjectCount;
            return new MovieClipFrame(rawFrame, frameData);
        });
        this.tag41s = rawMovieClip.tag41s;
        const grid = (rawMovieClip.scalingGrids.length > 0) ? rawMovieClip.scalingGrids[0] : null;
        if (grid !== null) {
            this.scalingGrid = [
                grid.normalizedScalar0 / 20, // x1
                grid.normalizedScalar1 / 20, // y1
                (grid.normalizedScalar0 + grid.normalizedScalar2) / 20, // x2
                (grid.normalizedScalar1 + grid.normalizedScalar3) / 20, // y2
            ];
        } else {
            this.scalingGrid = null;
        }
    }

    render(stage, matrix) {
        if (this.tag41s.length > 0) {
            return;
        }
        const frame = this.getFrame(0);
        frame.render(stage, matrix);
    }

    getFrame(index) {
        return this.frames[index];
    }

    ensureBounds(stage, matrix) {
        if (this.tag41s.length > 0) {
            return;
        }
        const frame = this.getFrame(0);
        frame.ensureBounds(stage, matrix);
    }
}

module.exports = MovieClip;
