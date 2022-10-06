const database = require('./database');

const defaultRecord = database.find((pixelInfo) => pixelInfo.pixelCode === 0);

module.exports = {
    getPixelInfo: (pixelCode) => (
        database.find((pixelInfo) => pixelInfo.pixelCode === pixelCode) || defaultRecord
    ),
    database,
};
