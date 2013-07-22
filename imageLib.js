/**
 * imageLib.js - module for processing and manipulation images on pure JavaScript
 * version: 	0.1 alpha
 * autor: 		lampa
 * license: 	MIT
 * https://github.com/lampaa/imageLib
 */

exports = module.exports = imageLib;

function imageLib(first_argument, second_argument) {
	imageLib.func.init.prototype = imageLib.func;
	return new imageLib.func.init(first_argument, second_argument);
};

imageLib.func = imageLib.prototype = {
	constructor: imageLib,
	fs: require('fs'),
	zlib: require('zlib'),
	png_node: require('./modules/png-node'),
	jpeg_node: require('./modules/jpeg-decoder'),
	png_encode: require('./modules/pngencoder.js'),
	jpeg_encode: require('./modules/jpegencoder.js'),
	
	/**
	 * init(mixed first_argument[, int second_argument])
	 * 
	 * Preparing an image or create a new sizes of canvas.
	 * @param first_argument - filename or width a new image.
	 * @param second_argument - height a new image.
	 */
	init: function(first_argument, second_argument) {
		this.data = null;
		this.Ndata = null;
		this.ifLoad = false;
		this._stack = [];
		this.history = [];
		
		var that = this;
		
		if(typeof first_argument === 'number' && first_argument % 1 == 0 && typeof second_argument === 'number' && second_argument % 1 == 0) {
			that.width = parseInt(first_argument);
			that.height = parseInt(second_argument);
			that.bpp = 4;
			
			that.ifLoad = true;
		}
		else {
			that.fs.stat(first_argument, function(err, stats) {
				if (err) throw err;
				
				/**
				 * read
				 */
				that.fs.readFile(first_argument, function(err, data) {
					if (err) throw err;
					
					/**
					 * 
					 */
					that.data = data;
					that.ifLoad = true;
					that.stack(first_argument);
				});
			});			
		}
	},
	
	/**
	 * 
	 */
	stack: function (task, callback) {
		if(callback) {
			this._stack.push([task, callback]);
		}
		else {
			for(var i=0; i < this._stack.length; i++) {
				this._stack[i][0].call(this, this._stack[i][1]);
			}
		}
	},
	
	/**
	 * create(function callback)
	 * 
	 * Create a new palette from sizes of canvas.
	 * @param callback - call function after creating a palette.
	 */
	create: function(callback) {
		this.history.push('create image');
		var buff = new Buffer(this.width * this.height * 4);
		buff.fill(0);
		this.data = buff;
		callback.call(this);
	},
	
	/**
	 * jpegToData(function callback)
	 * 
	 * Decoding JPEG image to the palette.
	 * @param callback - call function after decoding.
	 */	
	jpegToData: function(callback) {
		
		if(!this.ifLoad) {
			this.history.push('add to stack task: jpegToData');
			this.stack(this.jpegToData, callback);
			return;
		} 
		
		var that = this;
		
		this.history.push('jpeg decode');
		var jpeg = new this.jpeg_node();

		jpeg.parse(new Uint8Array(this.data));
		jpeg.decode(function(pixels) {
			that.width = jpeg.width;
			that.height = jpeg.height;
			that.bpp = 4;
			that.data = pixels;
			callback.call(that);
		});
	},
	
	/**
	 * bmpToData(function callback)
	 * 
	 * Decoding BMP image to the palette.
	 * @param callback - call function after decoding.
	 */	
	bmpToData: function(callback) {
		
		if(!this.ifLoad) {
			this.history.push('add to stack task: bmpToData');
			this.stack(this.bmpToData, callback);
			return;
		} 
		
		this.history.push('bmp decode');
		
		var fileSize, headerLength, i, magic, offset, b, data, g, r, w, x, y, _ref;
		this.pos = 0;
		this.bpp = 24;
		
		magic = ((function() {
			var _results;
			_results = [];
			for (i = 0; i < 2; i++) {
				_results.push(String.fromCharCode(this.data[this.pos++]));
			}
			return _results;
		}).call(this)).join('');
		
		if (magic !== 'BM') {
			throw 'Invalid BMP file.';
		}
		
		fileSize = this._readUInt32Bmp();
		this.pos += 4;
		offset = this._readUInt32Bmp();
		headerLength = this._readUInt32Bmp();
		this.width = this._readUInt32Bmp();
		this.height = this._readUInt32Bmp();
		this.colorPlaneCount = this._readUInt16Bmp();
		this.bitsPerPixel = this._readUInt16Bmp();
		this.compressionMethod = this._readUInt32Bmp();
		this.rawSize = this._readUInt32Bmp();
		this.hResolution = this._readUInt32Bmp();
		this.vResolution = this._readUInt32Bmp();
		this.paletteColors = this._readUInt32Bmp();
		this.importantColors = this._readUInt32Bmp();


		var Ndata = [];

		for(y = this.height; y > 0; y--) {
			i = 4 * y * this.width;
			
			for (var x = 0; x < this.width; x++) {
				
				b = this.data[this.pos++];
				g = this.data[this.pos++];
				r = this.data[this.pos++];
				
				Ndata[i++] = r;
				Ndata[i++] = g;
				Ndata[i++] = b;
				Ndata[i++] = 255;
			}
			
			if(this.width%2) {
				this.pos++;
			}
			
			if(this.width%4) {
				this.pos++;
				this.pos++;
			}
		}
	
		for(var i=0, null_elems=0; i < Ndata.length; i ++) {
			if(Ndata[i] != null) {
				break;
			}
			null_elems++;
		}
		
		Ndata.splice(0, this.width*4);
		
		this.data = Ndata;
		callback.call(this);
		
		return;
	},
	
	/**
	 * pngToData(function callback)
	 * 
	 * Decoding PNG image to the palette.
	 * @param callback - call function after decoding.
	 */	
	pngToData: function(callback) {
		
		if(!this.ifLoad) {
			this.stack(this.pngToData, callback);
			return;
		}
		
		this.history.push('png decode');
		
		var that = this;
		
		var png = new this.png_node(this.data);
		png.decode(function (pixels) {
			
			that.width = png.width;
			that.height = png.height;
			that.data = pixels;
			that.bpp = 4;
			callback.call(that);
		});
		
		return;		
	},
	
	/**
	 * getPixel(int x, int y) 
	 * 
	 * Get pixel.
	 * @param x - x-coordinate of the point. 
	 * @param y - y-coordinate of the point. 
	 */	
	getPixel: function(x, y) {
		var offset = (x + y * this.width) * 4;
	
		return [
			this.data[offset + 0],
			this.data[offset + 1],
			this.data[offset + 2],
			this.data[offset + 3]
		];
	},
	
	/**
	 * setPixel(int x, int y, int r, int g, int b, int a)
	 * 
	 * Set pixel.
	 * @param x - x-coordinate of the point. 
	 * @param y - y-coordinate of the point. 
	 * @param r, g, b, a - Values of red, green, blue components and alpha channel, between 0 and 255 (inclusive). 	
	 */	
	setPixel: function (x, y, r, g, b, a) {
		x = Math.ceil(x);
		y = Math.ceil(y);
		var offset = (x + y * this.width) * 4;
			
		this.data[offset + 0] = Math.floor(r);
		this.data[offset + 1] = Math.floor(g);
		this.data[offset + 2] = Math.floor(b);
		this.data[offset + 3] = (arguments.length == 5) ? Math.floor(a) : 255;
	},	
	
	/**
	 * resize(int width, int height[, boolean interpolation])
	 * 
	 * Rezize an image using the given new width and height.
	 * @param width - new width.
	 * @param height - new height.
	 * @param interpolation - set the interpolation method.
	 */	
	resize: function (width, height, interpolation) {
		this.widthOriginal = parseInt(this.width);
		this.heightOriginal = parseInt(this.height);
		this.targetWidth = Math.abs(parseInt(width) || 0);
		this.targetHeight = Math.abs(parseInt(height) || 0);
		this.colorChannels = 4;
		this.interpolationPass = !!interpolation;

		this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
		this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels;
		this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels;
		this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal;
		this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight;
		
		
		if (this.widthOriginal == this.targetWidth) { //Bypass the width resizer pass:
			this.resizeWidth = this._bypassResizer;
		}
		else { //Setup the width resizer pass:
			this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;
			if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
				this._initializeFirstPassBuffers(true);
				this.resizeWidth = this._resizeWidthInterpolatedRGBA;
			}
			else {
				this._initializeFirstPassBuffers(false);
				this.resizeWidth = this._resizeWidthRGBA;
			}
		}
		if (this.heightOriginal == this.targetHeight) { //Bypass the height resizer pass:
			this.resizeHeight = this._bypassResizer;
		}
		else {	
			//Setup the height resizer pass:
			this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;
			if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
				this._initializeSecondPassBuffers(true);
				this.resizeHeight = this._resizeHeightInterpolated;
			}
			else {
				this._initializeSecondPassBuffers(false);
				this.resizeHeight = this._resizeHeightRGBA;
			}
		}
		
		this.data = this.resizeHeight(this.resizeWidth(this.data));
		
		this.width = width;
		this.height = height;
	},
	
	/**
	 * pasteTo(resourse toImage, int x, int y[, boolean blending])
	 * 
	 * Paste palette to pallette of the image "toImage".
	 * @param x - x-coordinate of destination point. 
	 * @param y - y-coordinate of destination point. 
	 * @param blending - saving transparency, between 0 and 255 (inclusive). 
	 */	
	pasteTo: function (toImage, x, y, blending) {
		
		blending = (blending && blending == true)?true:false;
		
		var pluse = 0,
		iterator = 0,
		y_coord = y,
		x_coord = x;
		
		for(; y_coord < (this.height + y); y_coord++) {
			pluse = y_coord * toImage.width * 4;
			
			for(x_coord = x * 4; x_coord < (this.width + x) * 4; x_coord++, iterator++) {
				if(blending) {
					var pixel = this._alphaBlending([
					toImage.data[pluse+x_coord++],
					toImage.data[pluse+x_coord++],
					toImage.data[pluse+x_coord++],
					toImage.data[pluse+x_coord],
					],[
					this.data[iterator++],
					this.data[iterator++],
					this.data[iterator++],
					this.data[iterator],
					]);
					
					toImage.data[pluse+(x_coord-3)] = pixel[0];
					toImage.data[pluse+(x_coord-2)] = pixel[1];
					toImage.data[pluse+(x_coord-1)] = pixel[2];
					toImage.data[pluse+(x_coord)] = pixel[3];
				}
				else {
					toImage.data[pluse+x_coord] = this.data[iterator];
				}
			}
		}
		
		return toImage;
	},
	
	/**
	 * toPng(string file[, function callback])
	 * 
	 * Save palette as a new PNG image.
	 * @param file - new image file.
	 * @param callback - call function after creating a palette.
	 */	
	toPng: function(file, callback) {
		var that = this;
		
		this.png_encode.encode(this, function (data) {
			var fd = that.fs.openSync(file, 'w');
			for(var i = 0; i < data.length; i++) {
				that.fs.writeSync(fd, data[i], 0, data[i].length);
			}
			that.fs.closeSync(fd);
			
			if(callback) {
				callback.call(that);
			}
		});
	},
	
	/**
	 * toJpeg(string file[, function callback, int quality]])
	 * 
	 * Save palette as a new PNG image.
	 * @param file - new image file.
	 * @param callback - call function after creating a palette.
	 * @param quality - quality a new image, between 0 and 100 (inclusive). 
	 */		
	toJpeg: function(file, callback, quality) {
		quality = !quality?85:quality;
		
		var data = this.jpeg_encode.encode(this, quality);
		
		var fd =  this.fs.openSync(file, 'w');
		var bf = new Buffer(data);
		
		this.fs.writeSync(fd, bf, 0, bf.length);
		this.fs.closeSync(fd);
		
		if(callback) {
			callback.call(this);
		}
	},
	
	_resizeWidthRGBA: function (buffer) {
		var ratioWeight = this.ratioWeightWidthPass;
		var ratioWeightDivisor = 1 / ratioWeight;
		var weight = 0;
		var amountToNext = 0;
		var actualPosition = 0;
		var currentPosition = 0;
		var line = 0;
		var pixelOffset = 0;
		var outputOffset = 0;
		var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 3;
		var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 3;
		var output = this.outputWidthWorkBench;
		var outputBuffer = this.widthBuffer;
		do {
			for (line = 0; line < this.originalHeightMultipliedByChannels;) {
				output[line++] = 0;
				output[line++] = 0;
				output[line++] = 0;
				output[line++] = 0;
			}
			weight = ratioWeight;
			do {
				amountToNext = 1 + actualPosition - currentPosition;
				if (weight >= amountToNext) {
					for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
						output[line++] += buffer[pixelOffset++] * amountToNext;
						output[line++] += buffer[pixelOffset++] * amountToNext;
						output[line++] += buffer[pixelOffset++] * amountToNext;
						output[line++] += buffer[pixelOffset] * amountToNext;
					}
					currentPosition = actualPosition = actualPosition + 4;
					weight -= amountToNext;
				}
				else {
					for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
						output[line++] += buffer[pixelOffset++] * weight;
						output[line++] += buffer[pixelOffset++] * weight;
						output[line++] += buffer[pixelOffset++] * weight;
						output[line++] += buffer[pixelOffset] * weight;
					}
					currentPosition += weight;
					break;
				}
			} while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
			for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
				outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
				outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
				outputBuffer[pixelOffset++] = output[line++] * ratioWeightDivisor;
				outputBuffer[pixelOffset] = output[line++] * ratioWeightDivisor;
			}
			outputOffset += 4;
		} while (outputOffset < this.targetWidthMultipliedByChannels);
		return outputBuffer;
	},

	_resizeWidthInterpolatedRGBA: function (buffer) {
		var ratioWeight = this.ratioWeightWidthPass;
		var weight = 0;
		var finalOffset = 0;
		var pixelOffset = 0;
		var firstWeight = 0;
		var secondWeight = 0;
		var outputBuffer = this.widthBuffer;
		//Handle for only one interpolation input being valid for start calculation:
		for (var targetPosition = 0; weight < 1/3; targetPosition += 4, weight += ratioWeight) {
			for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
				outputBuffer[finalOffset] = buffer[pixelOffset];
				outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
				outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
				outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
			}
		}
		//Adjust for overshoot of the last pass's counter:
		weight -= 1/3;
		for (var interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += 4, weight += ratioWeight) {
			//Calculate weightings:
			secondWeight = weight % 1;
			firstWeight = 1 - secondWeight;
			//Interpolate:
			for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 4; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
				outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
				outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
				outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 6] * secondWeight);
				outputBuffer[finalOffset + 3] = (buffer[pixelOffset + 3] * firstWeight) + (buffer[pixelOffset + 7] * secondWeight);
			}
		}
		//Handle for only one interpolation input being valid for end calculation:
		for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - 4; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 4) {
			for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
				outputBuffer[finalOffset] = buffer[pixelOffset];
				outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
				outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
				outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
			}
		}
		return outputBuffer;
	},
	
	_resizeHeightInterpolated: function (buffer) {
		var ratioWeight = this.ratioWeightHeightPass;
		var weight = 0;
		var finalOffset = 0;
		var pixelOffset = 0;
		var pixelOffsetAccumulated = 0;
		var pixelOffsetAccumulated2 = 0;
		var firstWeight = 0;
		var secondWeight = 0;
		var outputBuffer = this.heightBuffer;
		//Handle for only one interpolation input being valid for start calculation:
		for (; weight < 1/3; weight += ratioWeight) {
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
				outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
			}
		}
		//Adjust for overshoot of the last pass's counter:
		weight -= 1/3;
		for (var interpolationHeightSourceReadStop = this.heightOriginal - 1; weight < interpolationHeightSourceReadStop; weight += ratioWeight) {
			//Calculate weightings:
			secondWeight = weight % 1;
			firstWeight = 1 - secondWeight;
			//Interpolate:
			pixelOffsetAccumulated = Math.floor(weight) * this.targetWidthMultipliedByChannels;
			pixelOffsetAccumulated2 = pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
				outputBuffer[finalOffset++] = Math.round((buffer[pixelOffsetAccumulated++] * firstWeight) + (buffer[pixelOffsetAccumulated2++] * secondWeight));
			}
		}
		//Handle for only one interpolation input being valid for end calculation:
		while (finalOffset < this.finalResultSize) {
			for (pixelOffset = 0, pixelOffsetAccumulated = interpolationHeightSourceReadStop * this.targetWidthMultipliedByChannels; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
				outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++]);
			}
		}
		return outputBuffer;
	},

	_resizeHeightRGBA: function (buffer) {

		var ratioWeight = this.ratioWeightHeightPass;
		var ratioWeightDivisor = 1 / ratioWeight;
		var weight = 0;
		var amountToNext = 0;
		var actualPosition = 0;
		var currentPosition = 0;
		var pixelOffset = 0;
		var outputOffset = 0;
		var output = this.outputHeightWorkBench;
		var outputBuffer = this.heightBuffer;
		do {
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
				output[pixelOffset++] = 0;
				output[pixelOffset++] = 0;
				output[pixelOffset++] = 0;
				output[pixelOffset++] = 0;
			}
			weight = ratioWeight;
			do {
				amountToNext = 1 + actualPosition - currentPosition;
				if (weight >= amountToNext) {
					for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
						output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
						output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
						output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
						output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
					}
					currentPosition = actualPosition;
					weight -= amountToNext;
				}
				else {
					for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
						output[pixelOffset++] += buffer[amountToNext++] * weight;
						output[pixelOffset++] += buffer[amountToNext++] * weight;
						output[pixelOffset++] += buffer[amountToNext++] * weight;
						output[pixelOffset++] += buffer[amountToNext++] * weight;
					}
					currentPosition += weight;
					break;
				}
			} while (weight > 0 && actualPosition < this.widthPassResultSize);
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
			}
		} while (outputOffset < this.finalResultSize);
		return outputBuffer;
	},
	
	_bypassResizer: function (buffer) { //Just return the buffer passsed:
		return buffer;
	},
	
	_initializeFirstPassBuffers: function (BILINEARAlgo) {
		//Initialize the internal width pass buffers:
		this.widthBuffer = this._generateFloatBuffer(this.widthPassResultSize);
		if (!BILINEARAlgo) {
			this.outputWidthWorkBench = this._generateFloatBuffer(this.originalHeightMultipliedByChannels);
		}
	},
	
	_initializeSecondPassBuffers: function (BILINEARAlgo) {
		//Initialize the internal height pass buffers:
		this.heightBuffer = this._generateUint8Buffer(this.finalResultSize);
		if (!BILINEARAlgo) {
			this.outputHeightWorkBench = this._generateFloatBuffer(this.targetWidthMultipliedByChannels);
		}
	},
	
	_generateFloatBuffer: function (bufferLength) {
		//Generate a float32 typed array buffer:
		try {
			return new Float32Array(bufferLength);
		}
		catch (error) {
			return [];
		}
	},
	
	_generateUint8Buffer: function (bufferLength) {
		//Generate a uint8 typed array buffer:
		try {
			return new Uint8Array(bufferLength);
		}
		catch (error) {
			return [];
		}
	},

	_alphaBlending: function(pixel_1, pixel_2) { //[rgba]
		var alpha_1ChannelFact = pixel_1[3]/255; // = 0.78125
		var alpha_2ChannelFact = pixel_2[3]/255; // = 0.78125
		

		var R = [
			(pixel_1[0] * alpha_1ChannelFact + pixel_2[0] * alpha_2ChannelFact) / 2,
			(pixel_1[1] * alpha_1ChannelFact + pixel_2[1] * alpha_2ChannelFact) / 2,
			(pixel_1[2] * alpha_1ChannelFact + pixel_2[2] * alpha_2ChannelFact) / 2,
			pixel_1[3], 
		];
		
		return R;
	},
	
	_readUInt16Bmp: function() {
		var b1, b2;
		b1 = this.data[this.pos++];
		b2 = this.data[this.pos++] << 8;
		return b1 | b2;
    },
	
    _readUInt32Bmp: function() {
		var b1, b2, b3, b4;
		b1 = this.data[this.pos++];
		b2 = this.data[this.pos++] << 8;
		b3 = this.data[this.pos++] << 16;
		b4 = this.data[this.pos++] << 24;
		return b1 | b2 | b3 | b4;
    }
}