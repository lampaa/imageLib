## Preparing an image or create a new sizes of canvas.

```js
constructor(mixed first_argument[, int second_argument])
```


- **first_argument** filename or width a new image.
- **second_argument** height a new image.

##### Example: 
```js
var imageLib = require('./imageLib.js');

var new_canvas = imageLib(200, 200);
var prepare_image = imageLib('./images/sample.png');
```