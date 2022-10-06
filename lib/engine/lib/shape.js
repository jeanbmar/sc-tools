const Command = require('./command');

class Shape {
    constructor(rawShape, scFile) {
        this.exportId = rawShape.exportId;
        this.commands = rawShape.shapeDrawBitmapCommands.map((rawCommand) => (new Command(rawCommand, scFile)));
    }

    render(stage, matrix) {
        this.commands.forEach((command) => command.render(stage, matrix));
    }

    ensureBounds(stage, matrix) {
        this.commands.forEach((command) => command.ensureBounds(stage, matrix));
    }
}

module.exports = Shape;
