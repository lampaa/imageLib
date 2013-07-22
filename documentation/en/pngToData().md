## Decoding PNG image to the palette.

```js
pngToData(function callback)
```


- **callback** call function after decoding.

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/sample.png').pngToData(function() {
	this.toJpeg('./images/simple.jpg');
});
```