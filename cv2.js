const cv = require('opencv');
const fs = require('fs-extra');
const path = require('path');


const outDir = `out_${Date.now()}`;

const contour = (imgPath) => {
    cv.readImage(imgPath, function (err, img) {
        if (err) {
            throw err;
        }

        const width = img.width();
        const height = img.height();

        if (width < 1 || height < 1) {
            throw new Error('Image has no size');
        }

        // do some cool stuff with img

        img.convertGrayscale();
        img.gaussianBlur([3, 3]);
        const lowThresh = 0;
        const highThresh = 150;
        const iterations = 2;

        img.canny(lowThresh, highThresh);
        img.dilate(iterations);

        img.save(outDir + '/dilated_' +  path.basename(imgPath));

        var GREEN = [0, 255, 0]; // B, G, R
        var WHITE = [255, 255, 255]; // B, G, R
        var RED   = [0, 0, 255]; // B, G, R

        let contours = img.findContours();
        let largestContourImg;
        let largestArea = 0;
        let largestAreaIndex;
        const lineType = 8;
        const maxLevel = 0;
        const thickness = 1;

        for (let i = 0; i < contours.size(); i++) {
            if (contours.area(i) > largestArea) {
            largestArea = contours.area(i);
            largestAreaIndex = i;
            }
        }

        var big = new cv.Matrix(height, width);
        var all = new cv.Matrix(height, width);

        big.drawContour(contours, largestAreaIndex, GREEN, thickness, lineType);
        all.drawAllContours(contours, WHITE);

        fs.mkdirp(outDir);
        // save img
        big.save(outDir + '/' +  path.basename(imgPath));
        all.save(outDir + '/all_' +  path.basename(imgPath));
    });
};



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
            contour(absFilePath)

          }
      }
  }
}

searchDirRecurse('./src/');