const fs = require('fs-extra');
const path = require('path');

const sourceFile = 'assets/sRGB2014.icc';
const destinationFile = 'dist/assets/sRGB2014.icc';

fs.copySync(sourceFile, destinationFile);