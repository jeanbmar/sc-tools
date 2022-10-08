import gl from 'gl-constants';

export const database = [
  {
    pixelCode: 0, // default
    pixelFormat: gl.RGBA,
    pixelType: gl.UNSIGNED_BYTE,
    bytesPerPixel: 4,
    colorType: 6,
    cc: 3,
    ac: 1,
  },
  {
    pixelCode: 2,
    pixelFormat: gl.RGBA,
    pixelType: gl.UNSIGNED_SHORT_4_4_4_4,
    bytesPerPixel: 4,
    colorType: 6,
    cc: 3,
    ac: 1,
  },
  {
    pixelCode: 3,
    pixelFormat: gl.RGBA,
    pixelType: gl.UNSIGNED_SHORT_5_5_5_1,
    bytesPerPixel: 4,
    colorType: 6,
    cc: 3,
    ac: 1,
  },
  {
    pixelCode: 4,
    pixelFormat: gl.RGB,
    pixelType: gl.UNSIGNED_SHORT_5_6_5,
    bytesPerPixel: 3,
    colorType: 2,
    cc: 3,
    ac: 0,
  },
  {
    pixelCode: 6,
    pixelFormat: gl.LUMINANCE_ALPHA,
    pixelType: gl.UNSIGNED_BYTE,
    bytesPerPixel: 2,
    colorType: 4,
    cc: 1,
    ac: 1,
  },
  {
    pixelCode: 9,
    pixelFormat: gl.RGBA,
    pixelType: gl.UNSIGNED_SHORT_4_4_4_4,
    bytesPerPixel: 4,
    colorType: 6,
    cc: 3,
    ac: 1,
  },
  {
    pixelCode: 10,
    pixelFormat: gl.LUMINANCE,
    pixelType: gl.UNSIGNED_BYTE,
    bytesPerPixel: 1,
    colorType: 0,
    cc: 1,
    ac: 0,
  },
];

const defaultPixelInfo = database.find(
  (pixelInfo) => pixelInfo.pixelCode === 0
);

export const getPixelInfo = (pixelCode) =>
  database.find((pixelInfo) => pixelInfo.pixelCode === pixelCode) ??
  defaultPixelInfo;

export default { database, getPixelInfo };
