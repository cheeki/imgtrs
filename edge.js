import cannyEdgeDetector from 'canny-edge-detector';
import Image from 'image-js';

Image.load('my-image.png').then((img) => {
  const grey = img.grey();
  const edge = cannyEdgeDetector(grey);
  return edge.save('edge.png');
})