## Get pixel.

```js
array getPixel(int x, int y)
```


- **x** x-coordinate of the point. 
- **y** y-coordinate of the point. 

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/sample.bmp').bmpToData(function() {
	this.getPixel(10, 10); // [ 0, 0, 0, 255 ]
});
```