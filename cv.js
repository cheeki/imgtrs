const cv = require('opencv4nodejs');
const path = require('path');
const fs = require('fs-extra');

const outDir = `cv2out`;

fs.mkdirp(outDir);
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R


const contour = (imgPath) => {

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

  console.log(contours[0].area);
  for (let i = 0; i < contours.length; i++) {

    if (contours[i].area > largestArea) {
      largestArea = contours[i].area;
      largestAreaIndex = i;
      largestContour = contours[i];
    }
  }

  const contour = grayImg2.drawContours(contours, new cv.Vec3(200, 200, 200) ,largestAreaIndex,);


  let arcLength = largestContour.arcLength(true);


  const poly = largestContour.approxPolyDP(arcLength * 0.05, true);

  // const contour2 = poly.drawContours(contours, new cv.Vec3(200, 200, 200) ,largestAreaIndex,);

  cv.imwrite('test.jpg', contour);
  cv.imwrite(outDir + '/' +  path.basename(imgPath), contour);
  // all.save(outDir + '/all_' +  path.basename(imgPath));
  // poly.save(outDir + '/poly_' +  path.basename(imgPath));


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
            console.log(file)
            const absFilePath = path.resolve(filePath)
            contour(absFilePath)
            filePaths.push(absFilePath)
          }
      }
  }
}
searchDirRecurse('./src/');

// (async () => {
//     for (let i = 0; i < filePaths.length; i++) {
//         try {
//             const res = await contour(filePaths[i]);

//         } catch(e) {
//             console.err(e)
//         }
//     }
// })()
