const cv = require('opencv4nodejs');
const path = require('path');
const fs = require('fs-extra');

const outDir = `cv2out`;

fs.mkdirp(outDir);
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R


const contour = (imgPath) => {

  const p = new Promise((resolve, reject) => {
    if (!imgPath) {
      return reject();
    }

    const img = cv.imread(imgPath);

    const grayImg = img.bgrToGray();

    const kSize = new cv.Size(3, 3);
    const blur = grayImg.gaussianBlur(kSize, 100, 0, cv.BORDER_DEFAULT);

    const lowThresh = 0;
    const highThresh = 150;
    const iterations = 2;

    const canny = blur.canny(lowThresh, highThresh);
    const dilated = canny.dilate(new cv.Mat(1, 1, cv.CV_8U, 1), new cv.Point2(-1, -1) , iterations);

    const grayImg2 = dilated.convertTo(cv.CV_8UC1);



    const WHITE = [255, 255, 255];
    let contours = grayImg2.findContours(2, 1);
    let largestContour;
    let largestArea = 0;
    let largestAreaIndex;

    for (let i = 0; i < contours.length; i++) {

      if (contours[i].area > largestArea) {
        largestArea = contours[i].area;
        largestAreaIndex = i;
        largestContour = contours[i];
      }
    }



    const contoured = grayImg2.copy();
    const lined = new cv.Mat(img.rows, img.cols, img.type);

    const contour = contoured.drawContours(contours, new cv.Vec3(200, 200, 200) ,largestAreaIndex,);
    const lines = grayImg2.houghLinesP(1, Math.PI / 180, 50, 50, 10);

    for (let i = 0; i < lines.length; i++)
    {
        let l = lines[i];
        lined.drawLine(new cv.Point(l.w, l.x), new cv.Point(l.y, l.z), new cv.Vec3(0, 0, 255), 3, 2);
    }




    cv.imwrite(outDir + '/' +  path.basename(imgPath), contour);
    cv.imwrite(outDir + '/line_' +  path.basename(imgPath), lined);


    setTimeout(() => {
      console.log(1);
      resolve();
    }, 5000)
    // cv.imshow(outDir + '/' +  path.basename(imgPath), contoured);
    // cv.imshow(outDir + '/line_' +  path.basename(imgPath), lined);

    // cv.waitKey();
  });

  return p;
}




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
            const absFilePath = path.resolve(filePath)
            // contour(absFilePath)
            filePaths.push(absFilePath)
          }
      }
  }
}
searchDirRecurse('./src/');

const loop = async (i) => {
    try {

        console.log(filePaths[i]);
        const res = await contour(filePaths[i]);

        if (i + 1 < filePaths.length) {
          setTimeout(() => {
            loop(i + 1);

          }, 1000)
        }

    } catch(e) {
        console.log('error')
    }
}

loop(0);


// contour('./src/4-1.JPG');