import { createRequire } from 'node:module';
import fsp from 'node:fs/promises';

const require = createRequire(import.meta.url);
const upngPath = require.resolve('upng', { paths: [process.cwd()] });
const upngFile = await fsp.readFile(upngPath, 'utf8');

// eslint-disable-next-line no-new-func
const upng = await Function(`
return (async () => {
  const { default: pako } = await import('pako');
  let UZIP = undefined;
  ${upngFile}
  return UPNG;
})();
`)();

export default upng;
