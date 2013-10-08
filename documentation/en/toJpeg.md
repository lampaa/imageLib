## Save palette as a new JPEG image.

```js
toJpeg(string file[, function callback[, int quality]])
```


- **file** new image file.
- **callback** call function after creating a palette.
- **quality** quality a new image, between 0 and 100 (inclusive). 

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/sample.bmp').bmpToData(function() {
	this.toJpeg('./images/simple.jpg');
});
