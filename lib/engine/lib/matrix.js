/*
* [a, b, c, d, e, f]
* becomes
* |a, c, e|
* |b, d, f|
* |0, 0, 1|
* */

class Matrix extends Array {
    constructor(rawMatrix) {
        super();
        if (rawMatrix !== undefined) {
            this.push(
                rawMatrix.normalizedScalars[0] / 1024,
                rawMatrix.normalizedScalars[1] / 1024,
                rawMatrix.normalizedScalars[2] / 1024,
                rawMatrix.normalizedScalars[3] / 1024,
                rawMatrix.normalizedScalars[4] * 0.05,
                rawMatrix.normalizedScalars[5] * 0.05,
            );
        }
    }

    static identity2x3() {
        const identity = new this();
        identity.push(1, 0, 0, 1, 0, 0);
        return identity;
    }

    multiply(matrix) {
        const result = new this.constructor();
        result.push(
            this[0] * matrix[0] + this[2] * matrix[1],
            this[1] * matrix[0] + this[3] * matrix[1],
            this[0] * matrix[2] + this[2] * matrix[3],
            this[1] * matrix[2] + this[3] * matrix[3],
            this[0] * matrix[4] + this[2] * matrix[5] + this[4],
            this[1] * matrix[4] + this[3] * matrix[5] + this[5],
        );
        return result;
    }

    scaleMultiply(scalingGrid) {
        const result = new this.constructor();
        result.push(
            this[0] * scalingGrid[0],
            this[1] * scalingGrid[1],
            this[2] * scalingGrid[2],
            this[3] * scalingGrid[3],
            this[4],
            this[5],
        );
        return result;
    }
}

module.exports = Matrix;
