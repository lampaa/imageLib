## Decoding JPEG image to the palette.

```js
jpegToData(function callback)
```


- **callback** call function after decoding.

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/sample.jpg').jpegToData(function() {
	this.toPng('./images/simple.png');
});
```