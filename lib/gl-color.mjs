/* eslint-disable no-bitwise */
import gl from 'gl-constants';

export const decode = (pixel, pixelType, pixelFormat) => {
  switch (pixelType) {
    case gl.UNSIGNED_SHORT_4_4_4_4:
      return [
        (((pixel >>> 12) & 0x0f) << 4) >>> 0,
        (((pixel >>> 8) & 0x0f) << 4) >>> 0,
        (((pixel >>> 4) & 0x0f) << 4) >>> 0,
        ((pixel & 0xf) << 4) >>> 0,
      ];
    case gl.UNSIGNED_SHORT_5_5_5_1:
      return [
        (((pixel >>> 11) & 0x1f) << 3) >>> 0,
        (((pixel >>> 6) & 0x1f) << 3) >>> 0,
        (((pixel >>> 1) & 0x1f) << 3) >>> 0,
        pixel & 0x1 ? 0xff : 0x00,
      ];
    case gl.UNSIGNED_SHORT_5_6_5:
      return [
        (((pixel >>> 11) & 0x1f) << 3) >>> 0,
        (((pixel >>> 5) & 0x3f) << 2) >>> 0,
        ((pixel & 0x1f) << 3) >>> 0,
      ];
    case gl.UNSIGNED_BYTE:
      switch (pixelFormat) {
        case gl.LUMINANCE_ALPHA:
          return [pixel & 0xff, (pixel >>> 8) & 0xff];
        case gl.LUMINANCE:
          return [pixel];
        case gl.RGBA:
          return [
            pixel & 0xff,
            (pixel >>> 8) & 0xff,
            (pixel >>> 16) & 0xff,
            (pixel >>> 24) & 0xff,
          ];
        default:
          throw new Error(`color decode failed, unknown format ${pixelFormat}`);
      }
    default:
      throw new Error(`color decode failed, unknown type ${pixelType}`);
  }
};

export const encode = (bytes, pixelType, pixelFormat) => {
  switch (pixelType) {
    case gl.UNSIGNED_SHORT_4_4_4_4:
      return (
        (bytes[3] >>> 4) +
        (((bytes[2] >>> 4) << 4) >>> 0) +
        (((bytes[1] >>> 4) << 8) >>> 0) +
        (((bytes[0] >>> 4) << 12) >>> 0)
      );
    case gl.UNSIGNED_SHORT_5_5_5_1:
      return (
        (bytes[3] ? 1 : 0) +
        (((bytes[2] >>> 3) << 1) >>> 0) +
        (((bytes[1] >>> 3) << 6) >>> 0) +
        (((bytes[0] >>> 3) << 11) >>> 0)
      );
    case gl.UNSIGNED_SHORT_5_6_5:
      return (
        (bytes[2] >>> 3) +
        (((bytes[1] >>> 2) << 5) >>> 0) +
        (((bytes[0] >>> 3) << 11) >>> 0)
      );
    case gl.UNSIGNED_BYTE:
      switch (pixelFormat) {
        case gl.LUMINANCE_ALPHA:
          return bytes[0] + ((bytes[1] << 8) >>> 0);
        case gl.LUMINANCE:
          return bytes[0];
        case gl.RGBA:
          return (
            bytes[0] +
            ((bytes[1] << 8) >>> 0) +
            ((bytes[2] << 16) >>> 0) +
            ((bytes[3] << 24) >>> 0)
          );
        default:
          throw new Error(`color encode failed, unknown format ${pixelFormat}`);
      }
    default:
      throw new Error(`color encode failed, unknown type ${pixelType}`);
  }
};

export default { encode, decode };
