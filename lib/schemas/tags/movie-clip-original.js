const { SmartBuffer } = require('../../smart-buffer-extra');
const MovieClipFrame = require('./movie-clip-frame');
const ScalingGrid = require('./scaling-grid');
const Tag41 = require('./tag-41');
const Tag = require('../tag');

const EndOfFile = new Tag();

class MovieClipOriginal extends Tag {
    constructor() {
        super();
        this.exportId = -1;
        this.fps = 60;
        this.frameCount = 0;
        this.frames = [];
        this.frameDataLength = 0;
        this.frameData = [];
        this.displayObjectIds = [];
        this.opacities = [];
        this.asciis = [];
        this.scalingGrids = [];
        this.tag41s = [];
    }

    decode(smartBuf) {
        super.decode(smartBuf);
        this.exportId = smartBuf.readInt16LE();
        this.fps = smartBuf.readUInt8();
        this.frameCount = smartBuf.readInt16LE();
        if (this.tagSignature === 14) {
            this.frameDataLength = 14;
            // todo this.frameData = SupercellSwf.getTimelineOffset(smartBuf);
        } else if (this.tagSignature === 3) {
            throw new Error(`tag TAG_MOVIE_CLIP no longer supported (tag signature ${this.tagSignature})`);
        } else {
            this.frameDataLength = smartBuf.readInt32LE();
            for (let i = this.frameDataLength; i; i -= 1) {
                this.frameData.push([
                    smartBuf.readUInt16LE(),
                    smartBuf.readUInt16LE(), // unsigned short are needed or matrix indices overflow!
                    smartBuf.readUInt16LE(),
                ]);
            }
        }
        const shapeCount = smartBuf.readInt16LE();
        for (let i = shapeCount; i; i -= 1) {
            this.displayObjectIds.push(smartBuf.readInt16LE());
        }
        if ([12, 35].includes(this.tagSignature)) {
            for (let i = shapeCount; i; i -= 1) {
                this.opacities.push(smartBuf.readUInt8());
            }
        }
        for (let i = shapeCount; i; i -= 1) {
            this.asciis.push(smartBuf.readAscii());
        }

        let tagSignature;
        do {
            tagSignature = smartBuf.readUInt8();
            const tagSize = smartBuf.readInt32LE();
            smartBuf.readOffset -= 5;
            switch (tagSignature) {
            case 0:
                EndOfFile.decode(smartBuf);
                break;
            case 5:
                throw new Error(`tag TAG_MOVIE_CLIP_FRAME no longer supported (tag signature ${tagSignature})`);
            case 11:
                this.frames.push(MovieClipFrame.decode(smartBuf));
                break;
            case 31:
                this.scalingGrids.push(ScalingGrid.decode(smartBuf));
                break;
            case 41:
                this.tag41s.push(Tag41.decode(smartBuf));
                break;
            default:
                throw new Error(`unknown tag signature ${tagSignature} of size ${tagSize} found when decoding ${this.constructor.name}`);
            }
        } while (tagSignature);
    }

    encode(mainBuf) {
        const smartBuf = new SmartBuffer();
        smartBuf.writeInt16LE(this.exportId);
        smartBuf.writeUInt8(this.fps);
        smartBuf.writeInt16LE(this.frameCount);
        if (![14, 3].includes(this.tagSignature)) {
            smartBuf.writeInt32LE(this.frameData.length);
            this.frameData.flat().forEach((spriteFrame) => smartBuf.writeUInt16LE(spriteFrame));
        }
        smartBuf.writeInt16LE(this.displayObjectIds.length);
        this.displayObjectIds.forEach((displayObjectId) => smartBuf.writeInt16LE(displayObjectId));
        if ([12, 35].includes(this.tagSignature)) {
            this.opacities.forEach((opacity) => smartBuf.writeUInt8(opacity));
        }
        this.asciis.forEach((ascii) => smartBuf.writeAscii(ascii));
        this.frames.forEach((frame) => frame.encode(smartBuf));
        this.scalingGrids.forEach((scalingGrid) => scalingGrid.encode(smartBuf));
        this.tag41s.forEach((tag41) => tag41.encode(smartBuf));
        EndOfFile.encode(smartBuf);
        this.tagSize = smartBuf.length;
        super.encode(mainBuf);
        mainBuf.writeBuffer(smartBuf.toBuffer());
    }
}

module.exports = MovieClipOriginal;
