const cv = require('opencv');
const fs = require('fs-extra');
const path = require('path');


const outDir = `cv2out`;

fs.mkdirp(outDir);

var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R


const contour = (imgPath) => {
    const p = new Promise((resolve, reject) => {
        cv.readImage(imgPath, function (err, img) {
            if (err) {
                reject();
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

            let contours = img.findContours();

            let largestArea = 0;
            let largestAreaIndex;

            const lineType = 8;
            const thickness = 3;

            const poly = new cv.Matrix(height, width);
            const big = new cv.Matrix(height, width);
            const all = new cv.Matrix(height, width);


            for (let i = 0; i < contours.size(); i++) {
                if (contours.area(i) > largestArea) {
                    largestArea = contours.area(i);
                    largestAreaIndex = i;
                }
            }

            big.drawContour(contours, largestAreaIndex, GREEN, thickness, lineType);
            all.drawAllContours(contours, WHITE);

            for (let i = 0; i < contours.size(); i++) {
                let arcLength = contours.arcLength(i, true);
                contours.approxPolyDP(i, arcLength * 0.05, true);
                poly.drawContour(contours, i, RED, thickness);
            }

            // save img
            big.save(outDir + '/' +  path.basename(imgPath));
            all.save(outDir + '/all_' +  path.basename(imgPath));
            poly.save(outDir + '/poly_' +  path.basename(imgPath));

            resolve();
        });
    });

    return p;
};



const filterJPG = (filename) => /\.jpe?g$/i.test(filename);
const filePaths = [];
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
            // contour(absFilePath)
            filePaths.push(absFilePath)
          }
      }
  }
}
searchDirRecurse('./src/');

(async () => {
    for (let i = 0; i < filePaths.length; i++) {
        try {
            const res = await contour(filePaths[i]);

        } catch(e) {
            console.err(e)
        }
    }
})()
