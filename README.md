# SC Tools

This module is intended to unpack, edit and repack `.sc` files from Supercell games.  

SC files are unpacked to disk as projects. Projects contain textures and readable configuration files. These files can be edited, and a new SC file can be repacked from a project at anytime.

For a better understanding of SC file structures, look at the files in the `lib/supercell-sc` directory.

This tool has been successfully tested on Brawl Stars assets from Q1 2022.

Todo:
- Add engine web example
- Check sc compression perf

## Recipes

### Unpack SC File(s) to Project(s)

```js
import { basename, join } from 'path';
import glob from 'glob';
import { unpack } from '@ultrapowa/sc-tools';

const sourcePattern = 'path/to/apk/assets/e30a1e4a93c76bea755877299ebebf535e1b3d73/sc/*.sc';
const projectDir = 'path/to/local/workspace/brawl-stars-33.127';

const files = glob.sync(sourcePattern)
  .filter((filePath) => !filePath.includes('_tex.sc')); // those will be processed within the regular .sc files

for (const filePath of files) {
  const projectName = basename(filePath, '.sc');
  await unpack(filePath, join(projectDir, projectName), {
    shapeOuterColor: { // remove this options for total transparency
      red: 0, green: 255, blue: 0, alpha: 255,
    },
  });
}
```

### Pack Project to SC File

```js
import { pack } from '@ultrapowa/sc-tools';

await pack('path/to/local/workspace/clash-royale/spell_goblin_barrel');
```

### Extract SC File Shapes as PNG Images

```js
import { basename, join } from 'path';
import glob from 'glob';
import { unpack, buildPngShapes } from '@ultrapowa/sc-tools';

const sourcePattern = 'path/to/apk/**/*.sc';
const projectDir = 'path/to/local/workspace/brawl-stars-38.111';

const files = glob.sync(sourcePattern)
  .filter((filePath) => !filePath.includes('_tex.sc')); // those will be processed within the regular .sc files

for (const filePath of files) {
  const projectName = basename(filePath, '.sc');
  const projectDirectory = join(projectDir, projectName);
  await unpack(filePath, projectDirectory, { flattenShapes: true });
  await buildPngShapes(projectDirectory); // still sync
}
```

### Export Movie Clips to Render in a Browser

This part of the code is not migrated yet.

```js
import path from 'path';
import { exportMovieClips } from '@ultrapowa/sc-tools';

const filePath = 'path/to/apk/assets/e30a1e4a93c76bea755877299ebebf535e1b3d73/sc/level.sc'; 
const outputDir = 'path/to/workspace/rendering';

await exportMovieClips(filePath, outputDir);
```
