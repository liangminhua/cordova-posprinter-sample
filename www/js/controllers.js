function getImageData(image, opts) {
  opts = opts || {};
  opts.x = opts.x || 0;
  opts.y = opts.y || 0;
  opts.width = typeof opts.width === "number" ? opts.width : image.width;
  opts.height = typeof opts.height === "number" ? opts.height : image.height;
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = opts.width;
  canvas.height = opts.height;
  context.drawImage(
    image,
    opts.x,
    opts.y,
    opts.width,
    opts.height,
    0,
    0,
    opts.width,
    opts.height
  );
  var imgData;
  try {
    imgData = context.getImageData(0, 0, opts.width, opts.height);
  } catch (e) {
    throw e;
  }

  return imgData;
}
function rgbToPixel(rgbs) {
  var piexlsData = [];
  for (var index = 0; index < rgbs.length; index += 4) {
    var R = rgbs[index];
    var G = rgbs[index + 1];
    var B = rgbs[index + 2];
    var A = rgbs[index + 3];
    var dot = (A << 24) + (R << 16) + (G << 8) + B;
    piexlsData.push(dot);
  }
  return piexlsData;
}
function threshold(image,threshold) {
  for (var index = 0; index < image.data.length; index++) {
    var luminance = (image.data[i] * 0.299) + (image.data[i + 1] * 0.587) + (image.data[i + 2] * 0.114);

    var value = luminance < threshold ? 0 : 255;
    image.data.fill(value, i, i + 3);
  }
}
function toEscPrintData(b, width, height) {
  var n = Math.floor((width + 7) / 8);
  var data = new Array(n * height);
  var mask = 0x01;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < n * 8; x++) {
      if (x < width) {
        if ((b[y * width + x] & 0x00ff0000) >> 16 != 0) {
          data[Math.floor(y * n + x / 8)] |= mask << (7 - x % 8);
        } else {
          data[Math.floor(y * n + x / 8)] &= ~mask << (7 - x % 8);
        }
      } else if (x >= width) {
        data[Math.floor(y * n + x / 8)] |= mask << (7 - x % 8);
      }
    }
  }
  for (var i = 0; i < data.length; i++) {
    data[i] = ~data[i];
  }
  return data;
}
function toTscPrintData(b, width, height) {
  var n = Math.floor((width + 7) / 8);
  var data = new Array(n * height);
  var mask = 0x01;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < n * 8; x++) {
      if (x < width) {
        if ((b[y * width + x] & 0x00ff0000) >> 16 != 0) {
          data[Math.floor(y * n + x / 8)] |= mask << (7 - x % 8);
        } else {
          data[Math.floor(y * n + x / 8)] &= ~mask << (7 - x % 8);
        }
      } else if (x >= width) {
        data[Math.floor(y * n + x / 8)] |= mask << (7 - x % 8);
      }
    }
  }
  return data;
}
function pickerImage(callback) {
  var input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");

  // Note: In modern browsers input[type="file"] is functional without
  // even adding it to the DOM, but that might not be the case in some older
  // or quirky browsers like IE, so you might want to add it to the DOM
  // just in case, and visually hide it. And do not forget do remove it
  // once you do not need it anymore.

  input.onchange = function() {
    var file = this.files[0];
    var dataUrlReader = new FileReader();
    dataUrlReader.onloadend = function(e) {
      var img = new Image();
      img.onload = function() {
        callback(img);
      };
      img.src = dataUrlReader.result;
    };
    dataUrlReader.readAsDataURL(file);
  };
  input.click();
}
function useEscPrintImage(img) {
  var imageData = getImageData(img);
  // may be no need
  threshold(imageData);
  var piexlsData = rgbToPixel(imageData.data);
  var width = img.width;
  var height = img.height;
  var printData = toEscPrintData(piexlsData, width, height);
  return Esc.printImage(0, width, height, printData);
}
function useTscPrintImage(img) {
  var imageData = getImageData(img);
  // may be no need
  threshold(imageData);
  var piexlsData = rgbToPixel(imageData.data);
  var width = img.width;
  var height = img.height;
  var printData = toTscPrintData(piexlsData, width, height);
  return Tsc.printImage(0, 0, width, height, 0, printData);
}
angular
  .module("starter.controllers", ["starter.services"])

  .controller("WiFiCtrl", function($scope) {
    var socketId = null;
    $scope.ip = "";
    $scope.port = null;
    function print(socketId, content) {
      if (socketId == null) {
        return;
      }
      var uint8array = new TextEncoder("gb18030", {
        NONSTANDARD_allowLegacyEncoding: true
      }).encode(content);
      chrome.sockets.tcp.send(socketId, uint8array.buffer, function(result) {
        console.log(angular.toJson(result));
      });
    }
    function rawPrint(socketId, uint8array) {
      chrome.sockets.tcp.send(socketId, uint8array.buffer, function(result) {
        console.log(angular.toJson(result));
      });
    }
    $scope.connect = function(ip, port) {
      console.log(ip + " " + port);
      chrome.sockets.tcp.create(function(createInfo) {
        chrome.sockets.tcp.connect(
          createInfo.socketId,
          ip,
          port ? port : 9100,
          function(result) {
            if (!result) {
              console.log("connect success!");
              socketId = createInfo.socketId;
            } else {
              socketId = null;
            }
          }
        );
      });
    };
    $scope.disconnect = function() {
      if (socketId) {
        chrome.sockets.tcp.disconnect(socketId);
        socketId = null;
      }
    };
    $scope.print = function() {
      print(socketId, "cordova-posprinter-sample");
    };
    $scope.useEscCommandPrintImage = function() {
      pickerImage(function(img) {
        var escCommand = useEscPrintImage(img);
        rawPrint(socketId, escCommand);
      });
    };
    $scope.printEscCommand = function() {
      var escCommand =
        Esc.InitializePrinter +
        Esc.TextAlignRight +
        "HelloWorld!\n" +
        Esc.TextAlignCenter +
        "HelloWorld!\n" +
        Esc.TextAlignLeft +
        "HelloWorld!\n" +
        Esc.BoldOn +
        "HelloWorld!\n" +
        Esc.BoldOff +
        Esc.DoubleHeight +
        "HelloWorld!\n" +
        Esc.DoubleOff +
        Esc.DoubleWidth +
        "HelloWorld!\n" +
        Esc.DoubleOff +
        Esc.DoubleOn +
        "HelloWorld!\n" +
        Esc.DoubleOff +
        Esc.PrintAndFeedMaxLine;
      print(socketId, escCommand);
    };
    $scope.useTscCommandPrintImage = function() {
      pickerImage(function(img) {
        var tscCommand = useTscPrintImage(img);
        rawPrint(socketId, tscCommand);
      });
    };
    $scope.printTscCommand = function() {
      var tscCommand =
        Tsc.text(100, 100, "4", 0, 1, 1, "DEMO FOR TEXT") + Tsc.print(1);
      console.log(tscCommand);
      print(socketId, tscCommand);
    };
  })
  .controller("BluetoothCtrl", function($scope, bluetooth) {
    $scope.bluetoothDevices = [];
    bluetooth.isEnabled().then(function(isEnabled) {
      if (!isEnabled) {
        bluetooth.enable();
      }
    });
    $scope.refresh = function(params) {
      $scope.bluetoothDevices.splice(0, $scope.bluetoothDevices.length);
      bluetooth
        .startScan()
        .then(
          function(success) {
            console.log("success:" + angular.toJson(success));
          },
          function(err) {
            console.log(err);
          },
          function(device) {
            $scope.bluetoothDevices.push(device);
            console.log(angular.toJson(device));
          }
        )
        .finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast("scroll.refreshComplete");
        });
    };
  })
  .controller("BluetoothDetailCtrl", function($scope, $stateParams, bluetooth) {
    $scope.deviceId = $stateParams.deviceId;
    $scope.connect = function(params) {
      bluetooth.connect($scope.deviceId).then(null, null, function(res) {
        alert(angular.toJson(res));
      });
    };
    $scope.disconnect = function() {
      if ($scope.deviceId) {
        bluetooth.disconnect($scope.deviceId);
      }
    };
    function print(content) {
      var uint8array = new TextEncoder("gb18030", {
        NONSTANDARD_allowLegacyEncoding: true
      }).encode(content);
      bluetooth.write(uint8array.buffer, $scope.deviceId);
    }
    function rawPrint(uint8array) {
      bluetooth.write(uint8array.buffer, $scope.deviceId);
    }
    $scope.print = function() {
      var content = "HelloWorld!\n";
      print(content);
    };
    $scope.useEscCommandPrintImage = function() {
      pickerImage(function(img) {
        var escCommand = useEscPrintImage(img);
        rawPrint(escCommand);
      });
    };
    $scope.useTscCommandPrintImage = function() {
      pickerImage(function(width, height, data) {
        var tscCommand = useTscPrintImage(img);
        rawPrint(tscCommand);
      });
    };
    $scope.printEscCommand = function() {
      var escCommand =
        Esc.InitializePrinter +
        Esc.TextAlignRight +
        "HelloWorld!\n" +
        Esc.TextAlignCenter +
        "HelloWorld!\n" +
        Esc.TextAlignLeft +
        "HelloWorld!\n" +
        Esc.BoldOn +
        "HelloWorld!\n" +
        Esc.BoldOff +
        Esc.DoubleHeight +
        "HelloWorld!\n" +
        Esc.DoubleOff +
        Esc.DoubleWidth +
        "HelloWorld!\n" +
        Esc.DoubleOff +
        Esc.DoubleOn +
        "HelloWorld!\n" +
        Esc.DoubleOff +
        Esc.PrintAndFeedMaxLine +
        Esc.cutAndFeedLine();
      print(escCommand);
    };
    $scope.printTscCommand = function() {
      var tscCommand =
        Tsc.text(100, 100, "4", 0, 1, 1, "DEMO FOR TEXT") + Tsc.print(1);
      print(tscCommand);
    };
  })
  .controller("USBCtrl", function($scope, $window) {
    $scope.devices = [];
    function getDevices() {
      var deviceFilter = [
        //gprint
        { vendorId: 34918, productId: 256, interfaceClass: 7 },
        { vendorId: 1137, productId: 85, interfaceClass: 7 },
        { vendorId: 6790, productId: 30084, interfaceClass: 7 },
        { vendorId: 26728, productId: 256, interfaceClass: 7 },
        { vendorId: 26728, productId: 512, interfaceClass: 7 },
        { vendorId: 26728, productId: 768, interfaceClass: 7 },
        { vendorId: 26728, productId: 1024, interfaceClass: 7 },
        { vendorId: 26728, productId: 1280, interfaceClass: 7 },
        { vendorId: 26728, productId: 1536, interfaceClass: 7 },
        //xprinter
        { vendorId: 1659, interfaceClass: 7, interfaceSubclass: 1 },
        { vendorId: 1046, interfaceClass: 7, interfaceSubclass: 1 },
        { vendorId: 7358, interfaceClass: 7, interfaceSubclass: 1 },
        { vendorId: 1155, interfaceClass: 7, interfaceSubclass: 1 },
        { vendorId: 8137, interfaceClass: 7, interfaceSubclass: 1 }
      ];
      // maybe you need to remove or modify the deviceFilter.
      $window.chrome.usb.getDevices({ filters: deviceFilter }, function(
        devices
      ) {
        $scope.devices.splice(0, $scope.devices.length);
        for (var index = 0; index < devices.length; index++) {
          $scope.devices.push(devices[index]);
        }
        console.log(angular.toJson(devices));
      });
    }
    $scope.$on("$ionicView.enter", function(event, data) {
      // handle event
      getDevices();
    });
    $scope.refresh = function() {
      getDevices();
    };
    $scope.print = function(device) {
      console.log(angular.toJson(device));
      var uint8array = new TextEncoder("gb18030", {
        NONSTANDARD_allowLegacyEncoding: true
      }).encode("print to usb");
      $window.chrome.usb.openDevice(device, function(handle) {
        $window.chrome.usb.listInterfaces(handle, function(descriptors) {
          var inEndpoint = null;
          var outEndpoint = null;
          for (var index = 0; index < interfaceDescriptors.length; index++) {
            var interface = interfaceDescriptors[index];
            for (var i = 0; i < interface.endpoints.length; i++) {
              var endpointDescriptor = interface.endpoints[i];
              if (endpointDescriptor.type == "bulk") {
                if (endpointDescriptor.direction == "out") {
                  outEndpoint = endpointDescriptor;
                } else if (endpointDescriptor.direction == "in") {
                  inEndpoint = endpointDescriptor;
                }
              }
              if (inEndpoint != null && outEndpoint != null) {
                $window.chrome.usb.claimInterface(
                  handle,
                  interface.interfaceNumber,
                  function() {
                    $window.chrome.usb.bulkTransfer(
                      handle,
                      {
                        direction: "out",
                        endpoint: outEndpoint.address,
                        data: uint8array.buffer
                      },
                      function(info) {
                        console.log(angular.toJson(info));
                        $window.chrome.usb.releaseInterface(
                          handle,
                          interface.interfaceNumber,
                          function() {}
                        );
                      }
                    );
                  }
                );
              }
            }
          }
        });
      });
    };
  });
