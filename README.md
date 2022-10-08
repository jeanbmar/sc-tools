# SC Tools

This module is intended to unpack, edit and repack `.sc` files from Supercell games.  

SC files are unpacked to disk as projects. Projects contain textures and readable configuration files. These files can be edited, and a new SC file can be repacked from a project at anytime.

For a better understanding of SC file structures, look at the files in the `lib/supercell-sc` directory.

This tool has been successfully tested on Brawl Stars assets from Q1 2022.

Todo:
- Add engine web example
- Publish to NPM
- Check sc compression perf
- Update readme

## Recipes

### Unpack SC File(s) to Project(s)

```js
const { basename, resolve, join } = require('path');
const glob = require('glob');
const { unpack } = require('@ultrapowa/sc-tools');


const sourcePattern = resolve('path/to/apk/assets/e30a1e4a93c76bea755877299ebebf535e1b3d73/sc/*.sc');
const projectDir = resolve('path/to/local/workspace/brawl-stars-33.127');

const files = glob.sync(sourcePattern)
  .filter((filePath) => !filePath.includes('_tex.sc')); // those will be processed within the regular .sc files

for (const filePath of files) {
  const projectName = basename(filePath, '.sc');
  await SCProject.import(filePath, join(projectDir, projectName), {
    shapeOuterColor: { // remove this options for total transparency
      red: 0, green: 255, blue: 0, alpha: 255,
    },
  });
}
```

### Pack Project to SC File

```js
const { pack } = require('@ultrapowa/sc-tools');

pack('path/to/local/workspace/clash-royale/spell_goblin_barrel');
```

### Extract SC File Shapes as PNG Images

```js
const { basename, resolve, join } = require('path');
const glob = require('glob');
const { buildPngShapes } = require('@ultrapowa/sc-tools');

const sourcePattern = resolve('path/to/apk/**/*.sc');
const projectDir = resolve('path/to/local/workspace/brawl-stars-38.111');

const files = glob.sync(sourcePattern)
  .filter((filePath) => !filePath.includes('_tex.sc')); // those will be processed within the regular .sc files

for (const filePath of files) {
  const projectName = basename(filePath, '.sc');
  const projectDirectory = join(projectDir, projectName);
  await SCProject.import(filePath, projectDirectory, { flattenShapes: true });
  SCProject.buildPngShapes(projectDirectory); // still sync
}
```

### Export a Movie Clip to Render in a Browser

```js
const path = require('path');
const { MovieClipExporter } = require('..');

const filePath = 'path/to/apk/assets/e30a1e4a93c76bea755877299ebebf535e1b3d73/sc/level.sc'; 
const outputDir = 'path/to/workspace/rendering';

await MovieClipExporter.exportAll(filePath, outputDir);
```
