function pickerImage(callback) {
  var input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/bmp');

  // Note: In modern browsers input[type="file"] is functional without
  // even adding it to the DOM, but that might not be the case in some older
  // or quirky browsers like IE, so you might want to add it to the DOM
  // just in case, and visually hide it. And do not forget do remove it
  // once you do not need it anymore.

  input.onchange = function () {
    var file = this.files[0];
    var dataUrlReader = new FileReader();
    dataUrlReader.onloadend = function (e) {
      var img = new Image;
      img.onload = function () {
        // image is loaded; sizes are available
        var reader = new FileReader();
        reader.onload = function (e) {
          var data = new Uint8Array(e.target.result);
          //打印纸的打印区宽度，80的为576,58的384，76的为508
          //printer 80nm:578px; printer 58nm:384px;printer 76nm:508px
          callback(img.width, img.height, data)
          /* DO SOMETHING WITH workbook HERE */
        };
        reader.readAsArrayBuffer(file);
      };
      img.src = dataUrlReader.result;
    }
    dataUrlReader.readAsDataURL(file);
  };
  input.click();
}
angular.module('starter.controllers', ['starter.services'])

  .controller('WiFiCtrl', function ($scope) {
    var socketId = null;
    $scope.ip = "";
    $scope.port = null;
    function print(socketId, content) {
      if (socketId == null) {
        return;
      }
      var uint8array = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
      chrome.sockets.tcp.send(socketId,
        uint8array.buffer,
        function (result) {
          console.log(angular.toJson(result));
        }
      )
    }
    function rawPrint(socketId, uint8array) {
      chrome.sockets.tcp.send(socketId,
        uint8array.buffer,
        function (result) {
          console.log(angular.toJson(result));
        }
      )
    }
    $scope.connect = function (ip, port) {
      console.log(ip + " " + port);
      chrome.sockets.tcp.create(function (createInfo) {
        chrome.sockets.tcp.connect(createInfo.socketId, ip,
          port ? port : 9100,
          function (result) {
            if (!result) {
              console.log("connect success!");
              socketId = createInfo.socketId;
            } else {
              socketId = null;
            }
          });
      })
    }
    $scope.disconnect = function () {
      if (socketId) {
        chrome.sockets.tcp.disconnect(socketId);
        socketId = null;
      }
    }
    $scope.print = function () {
      print(socketId, "cordova-posprinter-sample");
    }
    $scope.useEscCommandPrintImage = function () {
      pickerImage(function (width, height, data) {
        rawPrint(socketId, Esc.printImage(0, img.width, img.height, data))
      })
    }
    $scope.printEscCommand = function () {
      var escCommand = Esc.InitializePrinter +
        Esc.TextAlignRight + "HelloWorld!\n" +
        Esc.TextAlignCenter + "HelloWorld!\n" +
        Esc.TextAlignLeft + "HelloWorld!\n" +
        Esc.BoldOn + "HelloWorld!\n" + Esc.BoldOff +
        Esc.DoubleHeight + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.DoubleWidth + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.DoubleOn + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.PrintAndFeedMaxLine;
      print(socketId, escCommand);
    }
    $scope.useTscCommandPrintImage = function () {
      pickerImage(function (width, height, data) {
        rawPrint(socketId, Tsc.printImage(0, 0, img.width, img.height, 0, data))
      })
    }
    $scope.printTscCommand = function () {
      var tscCommand = Tsc.text(100, 100, "4", 0, 1, 1, "DEMO FOR TEXT") + Tsc.print(1);
      console.log(tscCommand);
      print(socketId, tscCommand);
    }
  })
  .controller('BluetoothCtrl', function ($scope, bluetooth) {
    $scope.bluetoothDevices = [];
    bluetooth.isEnabled()
      .then(function (isEnabled) {
        if (!isEnabled) {
          bluetooth.enable();
        }
      });
    $scope.refresh = function (params) {
      $scope.bluetoothDevices.splice(0, $scope.bluetoothDevices.length);
      bluetooth.startScan()
        .then(function (success) {
          console.log("success:" + angular.toJson(success));
        }, function (err) {
          console.log(err);
        }, function (device) {
          $scope.bluetoothDevices.push(device);
          console.log(angular.toJson(device));
        })
        .finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
    }
  })
  .controller('BluetoothDetailCtrl', function ($scope, $stateParams, bluetooth) {
    $scope.deviceId = $stateParams.deviceId;
    $scope.connect = function (params) {
      bluetooth.connect($scope.deviceId)
        .then(null, null, function (res) {
          alert(angular.toJson(res));
        });
    }
    $scope.disconnect = function () {
      if ($scope.deviceId) {
        bluetooth.disconnect($scope.deviceId);
      }
    }
    function print(content) {
      var uint8array = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
      bluetooth.write(uint8array.buffer, $scope.deviceId);
    }
    function rawPrint(uint8array) {
      bluetooth.write(uint8array.buffer, $scope.deviceId);
    }
    $scope.print = function () {
      var content = "HelloWorld!\n";
      print(content);
    }
    $scope.useEscCommandPrintImage = function () {
      pickerImage(function (width, height, data) {
        rawPrint(socketId, Esc.printImage(0, img.width, img.height, data))
      })
    }
    $scope.useTscCommandPrintImage = function () {
      pickerImage(function (width, height, data) {
        rawPrint(socketId, Tsc.printImage(0, 0, img.width, img.height, 0, data))
      })
    }
    $scope.printEscCommand = function () {
      var escCommand = Esc.InitializePrinter +
        Esc.TextAlignRight + "HelloWorld!\n" +
        Esc.TextAlignCenter + "HelloWorld!\n" +
        Esc.TextAlignLeft + "HelloWorld!\n" +
        Esc.BoldOn + "HelloWorld!\n" + Esc.BoldOff +
        Esc.DoubleHeight + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.DoubleWidth + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.DoubleOn + "HelloWorld!\n" + Esc.DoubleOff +
        Esc.PrintAndFeedMaxLine + Esc.cutAndFeedLine();
      print(escCommand);
    }
    $scope.printTscCommand = function () {
      var tscCommand = Tsc.text(100, 100, "4", 0, 1, 1, "DEMO FOR TEXT") + Tsc.print(1);
      print(tscCommand);
    }
  })
  .controller('USBCtrl', function ($scope, $window) {
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
      $window.chrome.usb.getDevices({ filters: deviceFilter }, function (devices) {
        $scope.devices.splice(0, $scope.devices.length);
        for (var index = 0; index < devices.length; index++) {
          $scope.devices.push(devices[index]);
        }
        console.log(angular.toJson(devices));
      })
    }
    $scope.$on("$ionicView.enter", function (event, data) {
      // handle event
      getDevices();
    });
    $scope.refresh = function () {
      getDevices();
    }
    $scope.print = function (device) {
      console.log(angular.toJson(device));
      var uint8array = new TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode("print to usb");
      $window.chrome.usb.openDevice(device, function (handle) {
        $window.chrome.usb.listInterfaces(handle, function (descriptors) {
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
                $window.chrome.usb.claimInterface(handle, interface.interfaceNumber, function () {
                  $window.chrome.usb.bulkTransfer(handle, {
                    direction: "out",
                    endpoint: outEndpoint.address,
                    data: uint8array.buffer
                  }, function (info) {
                    console.log(angular.toJson(info));
                    $window.chrome.usb.releaseInterface(handle, interface.interfaceNumber, function () {
                    });
                  });
                });
              }
            }
          }
        });
      })
    }
  })
