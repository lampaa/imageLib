# imageLib.js
Module for processing and manipulation images on pure JavaScript

## Example
```js
var imageLib = require('./imageLib.js');

imageLib(200, 200).create(function() {
    var x, y;

	for(x=20; x < 180; x++) {
		for(y=20; y < 40; y++) {
			this.setPixel(x, y, 255, 0, 0, 255); // black
		}
	}
	
	for(y=0; y < this.height; y++) {
		this.setPixel(0, y, 255, 0, 0, 255);
		this.setPixel(this.width-1, y, 255, 0, 0, 255);
	}

	for(x=0; x < this.width; x++) {
		this.setPixel(x, 0, 255, 0, 0, 255);
		this.setPixel(x, this.height-1, 255, 0, 0, 255);
	}
	
	this.toPng('./images/simple.png');
	this.toJpeg('./images/simple.jpg');
});
```

## API

#### [constructor(mixed first_argument[, int second_argument])](documentation/en/constructor.md)
#### [create(function callback)](documentation/en/create.md)
#### [jpegToData(function callback)](documentation/en/jpegToData.md)
#### [bmpToData(function callback)](documentation/en/bmpToData.md)
#### [pngToData(function callback)](documentation/en/pngToData.md)
#### [array getPixel(int x, int y)](documentation/en/getPixel.md)
#### [setPixel(int x, int y, int r, int g, int b, int a)](documentation/en/setPixel.md)
#### [resize(int width, int height[, boolean interpolation])](documentation/en/resize.md)
#### [pasteTo(resourse toImage, int x, int y[, boolean blending])](documentation/en/pasteTo.md)
#### [toPng(string file[, function callback])](documentation/en/toPng.md)
#### [toJpeg(string file[, function callback, [int quality]])](documentation/en/toJpeg.md)
