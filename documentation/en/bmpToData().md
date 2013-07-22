## Decoding BMP image to the palette.

```js
bmpToData(function callback)
```


- **callback** call function after decoding.

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/sample.bmp').bmpToData(function() {
	this.toPng('./images/simple.png');
});
```