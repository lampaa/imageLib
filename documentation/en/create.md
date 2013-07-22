
## Create a new palette from sizes of canvas.

```js
create(function callback)
```


- **callback** call function after creating a palette.

##### Example: 
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