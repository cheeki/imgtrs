
var jpeg = require('jpeg-js');
const fs = require('fs-extra')
const path = require('path')
const outDir = `out_${Date.now()}`;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

make2dArray = (width, height, arr) => {
  const newArray = [];
  let start = 0;
  let end = width * 8;
  while (end <= arr.length) {
    newArray.push(arr.slice(start, end))
    start = end;
    end = start + width * 8;
  }
  return newArray;
}

makeCubedArray = (width, height, arr) => {

};

const transformJPG = (filepath) => {
  var jpegData = fs.readFileSync(filepath);
  var rawImageData = jpeg.decode(jpegData);

  console.log(filepath);
  const contents = rawImageData.data.toString('hex');
  var rgb = contents.match(/.{1,8}/g);
  var result = shuffle(rgb).join('');

  var frameData = new Buffer(result, 'hex');
  var resultImageData = {
    data: frameData,
    width: rawImageData.width,
    height: rawImageData.height
  };

  var jpegImageData = jpeg.encode(resultImageData, 50);
  fs.mkdirp(outDir);

  fs.writeFileSync(outDir + '/' + path.basename(filepath), jpegImageData.data);
}


const filterJPG = (filename) => /\.jpe?g$/i.test(filename);
const searchDirRecurse = (dirName) => {
  const files = fs.readdirSync(dirName)
  for (let file of files) {
      const filePath = `${dirName}/${file}`
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
          searchDirRecurse(filePath)
      } else {
          if (filterJPG(file)) {
            console.log(file)
            const absFilePath = path.resolve(filePath)
            transformJPG(absFilePath)

          }
      }
  }
}

searchDirRecurse('./src/');

