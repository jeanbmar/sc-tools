class MovieClipFrame {
    constructor(rawFrame, frameData) {
        this.label = rawFrame.label;
        this.frameData = frameData;
    }

    render(stage, parentMatrix) {
        this.frameData.forEach(({ visible, displayObject, matrix }) => {
            if (!visible) {
                return;
            }
            if (parentMatrix !== undefined) {
                matrix = matrix.multiply(parentMatrix);
            }
            displayObject.render(stage, matrix);
        });
    }

    ensureBounds(stage, parentMatrix) {
        this.frameData.forEach(({ visible, displayObject, matrix }) => {
            if (!visible) {
                return;
            }
            if (parentMatrix !== undefined) {
                matrix = matrix.multiply(parentMatrix);
            }
            displayObject.ensureBounds(stage, matrix);
        });
    }
}

module.exports = MovieClipFrame;
