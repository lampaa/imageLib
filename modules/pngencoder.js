var zlib = require('zlib');

function PNGChunk(png, length, type) {
    this.length = length;
    this.type = type;
    this.offset = 0;

    this.data = new Buffer(4 + 4 + length + 4);
    this.writeUInt(length);
    this.writeUInt(type);

    png.push(this.data);
}

PNGChunk.prototype.writeUInt = function (i) {
    this.data.writeUInt32BE(i, this.offset);
    this.offset += 4;
}

PNGChunk.prototype.readByte = function () {
    var r = this.data.readUInt8(this.offset);
    this.offset += 1;
    return r;
}

PNGChunk.prototype.writeByte = function (b) {
    this.data.writeUInt8(b, this.offset);
    this.offset += 1;
}

function uint(x) {
    return (x > 0) ? x : x >>> 0;
}

PNGChunk.prototype.getCRC = function () {
    var c = 0xffffffff;
    this.offset = 4;
    for (var i = 0; i < this.length + 4; i++) {
        var b = uint(c ^ this.readByte()) & (0xff);      
        c = uint(crcTable[b] ^ (c >>> 8));
    }

    c = uint(c^(0xffffffff));
    this.data.writeUInt32BE(c, this.data.length - 4);
}

var crcTable = [];
function crcTableCompute () {
    var c;
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            if (c & 1) {
                c = uint((0xedb88320 ^ (c >>> 1)));
            } else {
                c = c >>> 1;
            }
        }
        crcTable[n] = c;
    }
}
			
function encode (image, cc) {
    var png = [];

    // Create output byte array
    var IHEAD = new Buffer(8);
    // Write PNG signature
    IHEAD.writeUInt32BE(0x89504e47, 0);
    IHEAD.writeUInt32BE(0x0D0A1A0A, 4);
    png.push(IHEAD);

    // Build IHDR chunk
    var IHDR = new PNGChunk(png, 13, 0x49484452);
    IHDR.writeUInt(image.width);
    IHDR.writeUInt(image.height);
    if (image.bpp == 4) {
        IHDR.writeUInt(0x08060000); // 32bit RGBA
    } else {
        IHDR.writeUInt(0x08020000); // 24bit RGB
    }
    IHDR.writeByte(0);
    IHDR.getCRC();

    // Build IDAT chunk
    var data = new Buffer(image.width * image.height * image.bpp + image.height);
    var offset = 0;
    for(var i = 0; i < image.height; i++) {
        // no filter
        data.writeUInt8(0, offset);
        offset += 1;
        var p;
        var j;
        for(j = 0; j < image.width;j++) {
            p = image.getPixel(j, i)
            data.writeUInt8(p[0], offset + 0);
            data.writeUInt8(p[1], offset + 1);
            data.writeUInt8(p[2], offset + 2);
            if (image.bpp == 4) {
                data.writeUInt8(p[3], offset + 3);
            }
            offset += image.bpp;
        }
    }

    zlib.deflate(data, function (e, buffer) {
        var IDAT = new PNGChunk(png, buffer.length, 0x49444154);
        buffer.copy(IDAT.data, 4 + 4);
        IDAT.getCRC();

        var IEND = new PNGChunk(png, 0, 0x49454E44);
        IEND.getCRC();
        // return PNG
        cc(png);
    });
}

crcTableCompute()
exports.encode = encode;
