const cv = require('opencv4nodejs');
const path = require('path');

// single axis for 1D hist
const getHistAxis = (channel) => ([
    {
      channel,
      bins: 256,
      ranges: [0, 256]
    }
  ]);

const img = cv.imread('./src/1-1.JPG');

const grayImg = img.bgrToGray();

const kSize = new cv.Size(3, 3);
const blur = grayImg.gaussianBlur(kSize, 100, 0, cv.BORDER_DEFAULT);

const lowThresh = 0;
const highThresh = 150;
const iterations = 2;

const canny = blur.canny(lowThresh, highThresh);
const dilated = canny.dilate(new cv.Mat(5, 5, cv.CV_8U, 1), new cv.Point2(-1, -1) , iterations);

const grayImg2 = dilated.convertTo(cv.CV_8UC1);



const WHITE = [255, 255, 255];
let contours = grayImg2.findContours(2, 1);
let largestContourImg;
let largestArea = 0;
let largestAreaIndex;

console.log(contours[0].area);
for (let i = 0; i < contours.length; i++) {

  if (contours[i].area > largestArea) {
    largestArea = contours[i].area;
    largestAreaIndex = i;
  }
}

console.log(largestContourImg);
const contour = img.drawContours(contours, new cv.Vec3(200, 200, 200) ,largestAreaIndex,);


cv.imshow('blur', contour);
cv.waitKey();