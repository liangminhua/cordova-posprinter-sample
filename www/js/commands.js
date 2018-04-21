var EscCommand = /** @class */ (function () {
  function EscCommand() {
    this.ESC = "\u001B";
    this.GS = "\u001D";
    this.InitializePrinter = this.ESC + "@";
    this.BoldOn = this.ESC + "E" + "\u0001";
    this.BoldOff = this.ESC + "E" + "\0";
    this.DoubleHeight = this.GS + "!" + "\u0001";
    this.DoubleWidth = this.GS + "!" + "\u0010";
    this.DoubleOn = this.GS + "!" + "\u0011"; // 2x sized text (double-high + double-wide)
    this.DoubleOff = this.GS + "!" + "\0";
    this.PrintAndFeedMaxLine = this.ESC + "J" + "\u00FF"; // 打印并走纸 最大255
    this.TextAlignLeft = this.ESC + "a" + "0";
    this.TextAlignCenter = this.ESC + "a" + "1";
    this.TextAlignRight = this.ESC + "a" + "2";
  }
  EscCommand.prototype.printAndFeedLine = function (verticalUnit) {
    if (verticalUnit > 255)
      verticalUnit = 255;
    if (verticalUnit < 0)
      verticalUnit = 0;
    return this.ESC + "J" + String.fromCharCode(verticalUnit);
  };
  EscCommand.prototype.cutAndFeedLine = function (verticalUnit) {
    if (verticalUnit === void 0) {
      return this.ESC + "V" + 1;
    }
    if (verticalUnit > 255)
      verticalUnit = 255;
    if (verticalUnit < 0)
      verticalUnit = 0;
    return this.ESC + "V" + 66 + String.fromCharCode(verticalUnit);
  };
  EscCommand.prototype.printImage = function (mode, width, height, bitmapArray) {
    var xL = Math.floor((width + 7) / 8 % 256);
    var xH = Math.floor((width + 7) / 8 / 256);
    var yL = Math.floor(height % 256);
    var yH = Math.floor(height / 256);
    var command = new Uint8Array(bitmapArray.length + 8);
    //GS V 0
    command.set([0x1D, 0x76, 0x30, mode & 0x1, xL, xH, yL, yH], 0);
    command.set(bitmapArray, 8);
    return command;
  };
  return EscCommand;
}());
var TscCommand = /** @class */ (function () {
  function TscCommand(parameters) {
    this.HOME = "HOME\n";
    this.CUT = "CUT\n";
    this.INITIALPRINTER = "INITIALPRINTER\n";
  }
  TscCommand.prototype.sound = function (level, interval) {
    return "SOUND " + level + "," + interval + "\n";
  };
  // X      The x-coordinate of the text
  // Y      The y-coordinate of the text
  // font      Font name
  // 1 English 8 x 12
  // 2 English 12 x 20
  // 3 English 16 x 24
  // 4 English 24 x 32
  // 5 English 32 x 48
  // 6 English 14 x 19
  // 7 English 21 x 27
  // 8 English 14 x 25
  // TST24.BF2     Traditional Chinese  24 x 24     font
  // TSS24.BF2     Simplified Chinese  24 x 24 font (GB)
  // K Korean 24 x 24 font
  // Rotation 0 90 180 270
  // x_multiplication    Horizontal multiplication, up to 10x.Available factors: 1~10 width (point) of true type font. 1 point=1/72 inch.
  // y_multiplication    Vertical multiplication, up to 10x. Available factors: 1~10 For true type font, this parameter is used to specify the height (point) of true type font. 1 point=1/72 inch.
  TscCommand.prototype.text = function (x, y, font, rotation, x_multiplication, y_multiplication, content) {
    var str = "TEXT " + x + "," + y + ",\"" + font + "\"," + rotation + "," + x_multiplication + "," + y_multiplication + ",\"" + content + "\"\n";
    return str;
  };
  //200DPI 1mm=8dots
  TscCommand.prototype.feed = function (dots) {
    return "FEED " + dots + "\n";
  };
  TscCommand.prototype.print = function (count) {
    if (count === void 0) {
      count = 1;
    }
    return "PRINT " + count + "\n";
  };
  // @param mode  Graphic modes listed below:
  // 0: OVERWRITE
  // 1: OR
  // 2: XOR
  TscCommand.prototype.printImage = function (x, y, width, heigth, mode, bitmapBuffer) {
    var start = "BITMAP " + x + "," + y + "," + Math.floor(width + 7 / 8) + "," + heigth + "," + mode + ",";
    start = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(start);
    var end = "\n";
    end = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(end);
    var image = new Uint8Array(bitmapBuffer);
    var ret = new Uint8Array(start.length + image.length + end.length);
    ret.set(start, 0);
    ret.set(image, start.length);
    ret.set(end, start.length + image.length);
    return ret;
  };
  return TscCommand;
}());
var Esc = new EscCommand();
var Tsc = new TscCommand();
