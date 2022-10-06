const delaunator = require('delaunator');

class Command {
    constructor(rawCommand, scFile) {
        this.texture = scFile.getTexture(rawCommand.textureIndex);
        this.triangles = Array.from(delaunator.from(rawCommand.normalizedXY).triangles);
        this.positions = rawCommand.normalizedXY
            .flat()
            .map((scalar) => scalar * 0.05);
        this.texcoords = rawCommand.normalizedUV
            .flat()
            .map((scalar) => (rawCommand.tagSignature === 22 ? scalar / 0xFFFF : scalar));
    }

    transform(matrix) {
        const positions = [...this.positions];
        for (let j = 0; j < positions.length; j += 2) {
            const x = positions[j];
            const y = positions[j + 1];
            // apply rotations and translations
            positions[j] = matrix[0] * x + matrix[1] * y + matrix[4];
            positions[j + 1] = matrix[2] * x + matrix[3] * y + matrix[5];
        }
        return positions;
    }

    render(stage, matrix) {
        const positions = this.transform(matrix);
        stage.draw(this.texture, positions, this.texcoords, this.triangles);
    }

    ensureBounds(stage, matrix) {
        const positions = this.transform(matrix);
        for (let j = 0; j < positions.length; j += 2) {
            stage.ensureBounds(positions[j], positions[j + 1]);
        }
    }
}

module.exports = Command;
