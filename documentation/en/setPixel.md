## Set pixel.

```js
setPixel(int x, int y, int r, int g, int b, int a)
```


- **x** x-coordinate of the point. 
- **y** y-coordinate of the point. 
- **r, g, b, a**  - Values of red, green, blue components and alpha channel, between 0 and 255 (inclusive). 	

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/simple.jpg').jpegToData(function() {
	this.setPixel(10, 10, 255, 0, 0, 255); // [255, 0, 0, 255] red
	this.toJpeg('./images/simple.jpg');
});
```