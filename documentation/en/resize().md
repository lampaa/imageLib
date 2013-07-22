## Rezize an image using the given new width and height.

```js
resize(int width, int height[, boolean interpolation])
```

- **width** new width.
- **height** new height.
- **interpolation** set the interpolation method.

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/simple.jpg').jpegToData(function() {
	
	this.resize(400, 400, true);
	this.toJpeg('./images/simpleResize.jpg');
});

```