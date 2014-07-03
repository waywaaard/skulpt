/**
  Python arduino module for interacting with html5 arduino model. This is not intended
  for real world arduino interaction.

**/
var arduino = arduino || {}; // do not override

arduino.HIGH = 1;
arduino.LOW = 0;
arduino.CHANGE = 2;
arduino.RISING = 3;
arduino.FALLING = 4;
arduino.OUTPUT = 'OUTPUT';
arduino.INPUT = 'INPUT';
arduino.INPUT_PULLUP = 'INPUT_PULLUP';
arduino.OFF = 0;
arduino.ON = 1;

arduino.Timer1 = {
  self: undefined, // reference to actual arduino board
};

arduino.Timer1.initialize = function (period) {
  arduino.Timer1.period = period;
  if (!Sk.arduino.timer) {
    Sk.arduino.timer = [];
  }
};

arduino.Timer1.attachInterrupt = function (func) {
  arduino.Timer1.func = func;
  arduino.Timer1.detachInterrupt();

  Sk.arduino.timer.push(window.setInterval(func, arduino.Timer1.period));
};

arduino.Timer1.detachInterrupt = function () {
  var i;
  if (!Sk.arduino || !Sk.arduino.timer) {
    return; // nothing to do here
  }

  for (i = 0; i < Sk.arduino.timer.length; i++) {
    window.clearInterval(Sk.arduino.timer[i]);
  }
  Sk.arduino.timer = [];
};

// constructor
arduino.uno = function (resetID, onID, lID, txID) {
  this.timeoutID = undefined;
  this.interrupt = undefined;
  this.status = arduino.OFF;
  this.actions = {};
  this.actions.reset = document.getElementById(resetID);
  this.actions.on = document.getElementById(onID);
  this.actions.onChange = []; // list of external event handlers for value changes
  this.int0 = undefined; // digital pin 2
  this.int1 = undefined; // digital pin 3
  this.interrupts = true;
  this.port = undefined;

  // setup io map
  this.io = {};
  this.io.ledON = {
    'pin': undefined,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LEDON'
  };
  this.io.ledTX = {
    'pin': undefined,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LEDTX'
  };
  this.io.ledRX = {
    'pin': undefined,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LEDRX'
  };
  this.io.pin0 = {
    'pin': 0,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'RX'
  };
  this.io.pin1 = {
    'pin': 1,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'TX'
  };
  this.io.pin2 = {
    'pin': 2,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'INT0'
  };
  this.io.pin3 = {
    'pin': 3,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'INT1'
  };
  this.io.pin4 = {
    'pin': 4,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin5 = {
    'pin': 5,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin6 = {
    'pin': 6,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin7 = {
    'pin': 7,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin8 = {
    'pin': 8,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin9 = {
    'pin': 9,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'PWM'
  };
  this.io.pin10 = {
    'pin': 10,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'PWM'
  };
  this.io.pin11 = {
    'pin': 11,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'PWM'
  };
  this.io.pin12 = {
    'pin': 12,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': undefined
  };
  this.io.pin13 = {
    'pin': 13,
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'LED'
  };
  this.io.gnd = {
    'pin': 'gnd',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'GND'
  };
  this.io.vcc = {
    'pin': 'vcc',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'VCC'
  };
  this.io.analog0 = {
    'pin': '14',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog0'
  };
  this.io.analog1 = {
    'pin': '15',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog1'
  };
  this.io.analog2 = {
    'pin': '16',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog2'
  };
  this.io.analog3 = {
    'pin': '17',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog3'
  };
  this.io.analog4 = {
    'pin': '18',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog4'
  };
  this.io.analog5 = {
    'pin': '19',
    'value': 0,
    'pinmode': arduino.OUTPUT,
    'name': 'analog5'
  };

  // mapping of all digital pins
  this.io.digital = [this.io.pin0, this.io.pin1, this.io.pin2, this.io.pin3,
    this.io.pin4, this.io.pin5, this.io.pin6, this.io.pin7, this.io.pin8, this.io
    .pin9, this.io.pin10, this.io.pin11, this.io.pin12, this.io.pin13, this.io.analog0,
    this.io.analog1, this.io.analog2, this.io.analog3,
    this.io.analog4, this.io.analog5
  ];

  // mapping of all analog pins
  this.io.analog = [this.io.analog0, this.io.analog1, this.io.analog2, this.io
    .analog3,
    this.io.analog4, this.io.analog5
  ];
};

/**
  Actives the interrupts for the arduino
**/
arduino.uno.prototype.interrupts = function () {
  this.interrupts = true;
};

/**
  Deactives the interrupts for the arduino
**/
arduino.uno.prototype.noInterrupts = function () {
  this.interrupts = false;
};

arduino.uno.prototype.setStatus = function (status) {
  // only set valid status
  if (status !== undefined && (status === arduino.OFF || status === arduino.ON)) {
    this.status = status;
    this.digitalWrite(this.io.ledON, status); // LED control
  }
};

/**
    Returns value for given pin, should be used in callbacks and not as public
    arduino API
**/
arduino.uno.prototype._getPinValue = function (pin) {
  // is there a leading pin?
  if (typeof pin === 'string' && pin.indexOf('pin') === 0) {
    pin = pin.replace(/pin/g, '');
  }

  var io_index = this._pin(pin);

  if (!io_index) {
    return null;
  }

  return this.io.digital[io_index].value; // current value for specified pin
};

arduino.uno.prototype.digitalRead = function (pin) {
  return this._getPinValue(pin);
};

/**
  Adds an eventlistener that will be triggered on pin writing changes
**/
arduino.uno.prototype.addonChange = function (callback) {
  if (callback)
    return this.actions.onChange.push(callback) - 1; // return index
};

arduino.uno.prototype.onReset = function (callback) {
  this.actions.reset.addEventListener('click', callback, false);
};

arduino.uno.prototype.onOn = function (callback) {
  this.actions.on.addEventListener('click', callback, false);
};

/**
    interrupt:  die Nummer des Interrupts (int)
    function :  die Funktion, die aufgerufen wird, wenn ein Interrupt
                eintrifft; diese Funktion darf keine Parameter und auch keine
                Rückgaben enthalten.
    mode     :  definiert wann genau der Interrupt eingeleitet werden soll. Vier
                Konstanten sind bereits als zulässige Werte vordefiniert worden.

**/
arduino.uno.prototype.attachInterrupt = function (interrupt, func, mode) {
  var interrupt_object = {
    'func': func,
    'mode': mode
  };
  // handle case for int0 and int1
  if ('INT0' === interrupt.toUpperCase()) {
    this.int0 = interrupt_object;
  } else if ('INT1' === interrupt.toUpperCase()) {
    this.int1 = interrupt_object;
  }
};

arduino.uno.prototype.detachInterrupt = function (interrupt) {
  // handle case for int0 and int1
  if ('INT0' === interrupt.toUpperCase() || interrupt === 0) {
    this.int0 = undefined;
  } else if ('INT1' === interrupt.toUpperCase() || interrupt === 1) {
    this.int1 = undefined;
  }
};

arduino.uno.prototype.pinMode = function (pin, mode) {
  if (!mode || !(mode === arduino.INPUT || mode === arduino.OUTPUT ||
    arduino.INPUT_PULLUP)) {
    throw new Error('Unallowed mode: ' + mode); // return if no value specified
  }

  if (pin < 0 || pin > this.io.digital.length) {
    throw new Error('Cannot write to specified pin -> not existing.');
  }

  this.io.digital[pin].mode = mode;
};

arduino.uno.prototype._pin = function (pin) {
  // analog pins are mapped to 14-19 inside the io.digital array
  var _int = parseInt(pin);
  if (!isNaN(_int)) {
    pin = _int;
  }

  switch (pin) {
  case 0:
  case 1:
  case 2:
  case 3:
  case 4:
  case 5:
  case 6:
  case 7:
  case 8:
  case 9:
  case 10:
  case 11:
  case 12:
  case 13:
    return pin;
  case 14:
  case 'a0':
    return 14;
  case 15:
  case 'a1':
    return 15;
  case 'a2':
  case 16:
    return 16;
  case 'a3':
  case 17:
    return 17;
  case 'a4':
  case 18:
    return 18;
  case 'a5':
  case 19:
    return 19;
  default:
    return null;
  }
};

arduino.uno.prototype.digitalWrite = function (pin, value) {
  if (!(value === arduino.HIGH || value === arduino.LOW)) {
    throw new Sk.builtin.ValueError('Value is neither HIGH nor LOW.'); // return if no value specified
  }

  // get pin object
  var io;
  if (typeof pin === 'string' || typeof pin === 'number') {
    if (!isNaN(pin) && (pin < 0 || pin > this.io.digital.length)) {
      throw new Sk.builtin.ValueError(
        'Cannot write to specified pin -> not existing.');
    }
    pin = this._pin(pin);
    io = this.io.digital[pin];
  } else if (pin.value !== undefined && pin.pinmode !== undefined) {
    io = pin; // got pin object, value, mode, name
  } else {
    throw new Sk.builtin.ValueError(
      'Cannot write to specified pin -> not existing.');
  }

  var old_value = io.value;

  // are we allowed to write?
  if (io.pinmode === arduino.OUTPUT) {
    io.value = value;

    // trigger callbacks
    if (old_value !== io.value) {
      var i;
      for (i = 0; i < this.actions.onChange.length; i++) {
        this.actions.onChange[i].call(undefined, io, pin, this.port);
      }
    }
  }
};

/**
    Not part of the original arduino function set, however needed to simulate
    external write operations on the pins and trigger interrupt routines
**/
arduino.uno.prototype.externalDigitalWrite = function (pin, value) {
  if (!(value === arduino.HIGH || value === arduino.LOW)) {
    throw new Error('Value is neither HIGH nor LOW.'); // return if no value specified
  }

  if (pin < 0 || pin > this.io.digital.length) {
    throw new Error('Cannot write to specified pin -> not existing.');
  }

  var io = this.io.digital[0];

  if (io.pinmode === arduino.OUTPUT) {
    throw new Error('Pinmode for pin: ' + pin + ' is set to OUTPUT.');
  }

  var that = this;
  var old_value = io.value;
  io.value = value; // set value

  // check mode
  var isChange = old_value != value;
  var isLow = value === arduino.LOW;
  var isHigh = value === arduino.HIGH;
  var isFalling = old_value === arduino.HIGH && value === arduino.LOW;
  var isRising = old_value === arduino.LOW && value === arduino.HIGH;

  // check if we need to trigger interrupt
  function triggerInterrupt(interrupt, change, low, high, falling, rising) {
    if (!interrupt) return;
    // check mode
    if ((interrupt.mode = arduino.CHANGE && change) || (interrupt.mode =
      arduino.LOW && low) || (interrupt.mode = arduino.HIGH && high) || (
      interrupt.mode = arduino.FALLING && falling) || (interrupt.mode =
      arduino.RISING && rising)) {

      // trigger it
      interrupt.func.call(that);
    }
  }

  if (this.interrupts) {
    triggerInterrupt(this.int0, change, low, high, falling, rising);
    triggerInterrupt(this.int1, change, low, high, falling, rising);
  }
};

// helper functions that fixes IE svg classList issues
arduino.getClassList = function (element) {
  if (typeof element.classList === 'undefined') {
    var arr = (element.className instanceof SVGAnimatedString ? element.className
      .baseVal : element.className)
      .split(/\s+/);
    if ('' === arr[0]) {
      arr.pop();
    }
    return arr;
  } else {
    return element.classList;
  }
};

/* end of arduino api */

var $builtinmodule = function (name) {
  var mod = {};

  // html ids of the buttons
  mod.arduino_reset = new Sk.builtin.str('arduino_reset'); // should be overridable
  mod.arduino_on = new Sk.builtin.str('arduino_on'); // dito
  mod.HIGH = new Sk.builtin.int_(arduino.HIGH);
  mod.LOW = new Sk.builtin.int_(arduino.LOW);
  mod.INPUT = new Sk.builtin.str(arduino.INPUT);
  mod.INPUT_PULLUP = new Sk.builtin.str(arduino.INPUT_PULLUP);
  mod.OUTPUT = new Sk.builtin.str(arduino.OUTPUT);
  mod.CHANGE = new Sk.builtin.str(arduino.CHANGE);
  mod.CHANGE = new Sk.builtin.str(arduino.CHANGE);
  mod.FALLING = new Sk.builtin.str(arduino.FALLING);

  var timeoutID = []; // collection of timeoutIDs

  function write_callback(io, pin, port) {
    var nodes;
    var selctorQuery = '#' + port + ' .' + (pin.name ? pin.name : ("pin" + pin));

    nodes = document.querySelectorAll(selctorQuery);

    if (!nodes || nodes.length <= 0) {
      console.log("Specified pin is not connected: " + pin.name);
      return;
    }

    var visibility = "hidden";

    if (io.value) {
      visibility = "visible";
    }

    var i;
    var classlist;
    for (i = 0; i < nodes.length; i++) {
      // fix for IE that does not have and classList attribute on svg elements
      classlist = arduino.getClassList(nodes[i]);
      if (classlist.length === 1) {
        nodes[i].setAttribute("visibility", visibility);
      }
    }
  }

  function resetAll() {
    var i;
    for (i = 0; i < timeoutID.length; i++) {
      window.clearTimeout(timeoutID[i]);
    }
    timeoutID = [];

    arduino.Timer1.detachInterrupt();

    for (i = 0; i <= 13; i++) {
      Sk.arduino.board.digitalWrite(i, arduino.LOW);
    }

    Sk.arduino.board.setStatus(arduino.OFF);
  }

  var CLASS_ARDUINO = 'Arduino';
  var CLASS_TIMER = "Timer1";

  var timer_f = function ($gbl, $loc) {
    var init_f = function (self, timeout) {
      Sk.builtin.pyCheckArgs('__init__', arguments, 2, 2);
      if (!Sk.builtin.checkNumber(timeout)) {
        throw new Sk.builtin.TypeError(
          'argument timeout must be a numeric type');
      }

      var _timeout = Sk.ffi.remapToJs(timeout);

      // detach previous interrupt
      arduino.Timer1.detachInterrupt();

      // now set new period
      arduino.Timer1.initialize(_timeout);
    };
    $loc.__init__ = new Sk.builtin.func(init_f);

    var attach_f = function (self, func) {
      Sk.builtin.pyCheckArgs('attachInterrupt', arguments, 2, 2);
      debugger;
      if (!Sk.builtin.checkFunction(func)) {
        throw new Sk.builtin.TypeError('func must be a function type');
      }

      // go, attaches interrupt and sets interval
      var callback = function () {
        Sk.misceval.callsim(func);
      }
      arduino.Timer1.attachInterrupt(callback);
    };
    $loc.attachInterrupt = new Sk.builtin.func(attach_f);
  };

  mod[CLASS_TIMER] = Sk.misceval.buildClass(mod, timer_f,
    CLASS_TIMER, []);


  var arduino_f = function ($gbl, $loc) {
    var init_f = function (self, baud, port, timeout, sr) {
      Sk.builtin.pyCheckArgs('__init__', arguments, 3, 5);
      // ignore the actual arguments, due to the fact that we do not establish
      // a real connection to an hardware device
      var _port = Sk.ffi.remapToJs(port);
      var _reset = Sk.ffi.remapToJs(mod.arduino_reset) + "_" + _port;
      var _on = Sk.ffi.remapToJs(mod.arduino_on) + "_" + _port;
      var arduinoJS = {};

      arduinoJS.board = new arduino.uno(_reset, _on);
      arduinoJS.board.port = _port;

      self.v = arduinoJS;

      // we store the arduino instance in the Sk-space for external access
      if (Sk.arduino) {
        // reset previous arduino instance and proceed
        resetAll();
      }
      Sk.arduino = self.v;

      self.tp$name = CLASS_ARDUINO; // set class name

      // add 'write' callback that toggles the visibility for items with exactly
      // one html class value (pin specifier)
      self.v.board.addonChange(write_callback);

      self.v.board.actions.reset.addEventListener('click', function () {
        resetAll();
      }, false);
    };

    init_f.co_varnames = ['baud', 'port', 'timeout', 'sr'];
    init_f.$defaults = [new Sk.builtin.int_(9600), Sk.builtin.none.none$,
      new Sk.builtin.int_(2), Sk.builtin.none.none$];
    $loc.__init__ = new Sk.builtin.func(init_f);

    $loc.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

    $loc.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;

    $loc.interrupts = new Sk.builtin.func(function (self) {
      // first unwrap arduino board object
      var arduinoJS = self.v;

      arduinoJS.board.interrupts();
    });

    $loc.noInterrupts = new Sk.builtin.func(function (self) {
      // first unwrap arduino board object
      var arduinoJS = self.v;

      arduinoJS.board.noInterrupts();
    });

    $loc.setStatus = new Sk.builtin.func(function (self, status) {
      // first unwrap arduino board object
      var arduinoJS = self.v;
      var _status = Sk.remapToJs(status);

      if (!_status || (_status !== arduino.OFF && _status !== arduino.ON)) {
        throw new Sk.builtin.ValueError('status must be either ON or OFF');
      }

      arduinoJS.board.setStatus(Sk.remapToJs(status));
    });

    $loc.attachInterrupt = new Sk.builtin.func(function (self, interrupt,
      func, mode) {
      // first unwrap arduino board object
      var arduinoJS = self.v;
      debugger;
      var _interrupt = Sk.ffi.remapToJs(interrupt);
      var _mode = Sk.ffi.remapToJs(mode);

      arduinoJS.board.attachInterrupt(_interrupt, func, _mode);
    });

    $loc.detachInterrupt = new Sk.builtin.func(function (self, interrupt) {
      // first unwrap arduino board object
      var arduinoJS = self.v;
      var _interrupt = Sk.ffi.remapToJs(interrupt);

      arduinoJS.board.detachInterrupt(_interrupt);
    });

    $loc.pinMode = new Sk.builtin.func(function (self, pin, mode) {
      // first unwrap arduino board object
      var arduinoJS = self.v;
      var _pin = Sk.ffi.remapToJs(pin);
      var _mode = Sk.ffi.remapToJs(mode);

      arduinoJS.board.pinMode(_pin, _mode);
    });

    $loc.digitalWrite = new Sk.builtin.func(function (self, pin, value) {
      // first unwrap arduino board object
      var arduinoJS = self.v;
      var _pin = Sk.ffi.remapToJs(pin);
      var _value = Sk.ffi.remapToJs(value);

      arduinoJS.board.digitalWrite(_pin, _value);
    });

    $loc.digitalRead = new Sk.builtin.func(function (self, pin) {
      // first unwrap arduino board object
      var arduinoJS = self.v;
      var _pin = Sk.ffi.remapToJs(pin);

      return Sk.ffi.remapToPy(arduinoJS.board.digitalRead(_pin));
    });

    $loc.loop = new Sk.builtin.func(function (self, func, delay) {
      var _delay = 1000;

      if (delay) {
        _delay = Sk.ffi.remapToJs(delay);
      }

      timeoutID.push(window.setInterval(function () {
        Sk.misceval.callsim(func);
      }, _delay));
    });

    $loc.delay = new Sk.builtin.func(function (self, delay) {
      // dummy function
      var _delay = Sk.ffi.remapToJs(delay);

    });

    function write_ledmatrix(io, pin) {
      // we have to determine the when we are allowed to 'light' and when to
      // turn the leds off
      /* col1, ..., col6
        -------------
        | | | | | | |
        -------------
        | | | | | | |
        -------------
        | | | | | | |
        -------------
    */
      debugger;
      if (isNaN(pin) || pin < 0 || pin > 19) { //|| cols.indexOf(pin) === -1) {
        return;
      }

      var nodes;
      var pin_classname = pin.name ? pin.name : ("pin" + pin);

      nodes = document.getElementsByClassName(pin_classname);

      // iterate over all nodes and check if we can turn on or off
      var sibling_index;
      var fill;
      var sibling_value;
      var i;

      function classname_map(x) {
        return x.indexOf(pin_classname, x.length - pin_classname.length) === -
          1;
      }

      for (i = 0; i < nodes.length; i++) {
        // 1. get other pin index for specified
        fill = '#fafafa';
        var siblings = Array.prototype.filter.call(arduino.getClassList(nodes[i]),
          classname_map);
        if (siblings.length > 0) {
          sibling_value = Sk.arduino.board._getPinValue(siblings[0]);
          // HIGH value on col and HIGH on row
          if (io.value === arduino.HIGH && sibling_value === arduino.HIGH) {
            fill = 'lime';
          }
          nodes[i].setAttribute("fill", fill);
        }
      }
    }
    mod.ledMatrix = new Sk.builtin.func(function (arduino) {
      if (Sk.abstr.typeName(arduino) !== CLASS_ARDUINO) {
        throw new Sk.builtin.ValueError('ledMatrix needs arduino object');
      }

      arduino.v.board.addonChange(write_ledmatrix);
    });
  };

  mod[CLASS_ARDUINO] = Sk.misceval.buildClass(mod, arduino_f,
    CLASS_ARDUINO, []);

  return mod;
};
