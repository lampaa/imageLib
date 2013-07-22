## Paste palette to pallette of the image "toImage".

```js
pasteTo(resourse toImage, int x, int y[, boolean blending])
```

- **toImage** pallette to insert.
- **x** x-coordinate of destination point.
- **y** y-coordinate of destination point.
- **blending** saving transparency, between 0 and 255 (inclusive).

##### Example: 
```js
var imageLib = require('./imageLib.js');

imageLib('./images/trees.png').pngToData(function() {
	var that = this;
	
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
		
		this.pasteTo(that, 10, 10, true);
		
		that.toPng('./images/trees_samp.png');
	});
});
```