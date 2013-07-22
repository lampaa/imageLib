## Save palette as a new PNG image.

```js
toPng(string file[, function callback])
```


- **file** new image file.
- **callback** call function after creating a palette.

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/sample.bmp').bmpToData(function() {
	this.toPng('./images/simple.png');
});
```