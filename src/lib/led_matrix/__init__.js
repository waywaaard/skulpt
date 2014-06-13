/**
	Circuit board class, retrieves an circuit board and provides mechanisms to animate LEDs

**/
var $builtinmodule = function (name) {
  var mod = {};

  var crboard = {};
  crboard.matrix = [];
	crboard.queue = [];
	crboard.position = 0;
	crboard.mode = "NONE";
	
	function render() {
		var item = crboard.queue[crboard.position];
	
		var i;
    for (i = 0; i < item.g.children.length; i++) {
      if (item.g.children[i].nodeName === "circle") {
        item.g.children[i].setAttribute("fill", item.fill);
        if (!item.g.children[i].classList.contains("crledbase")) {
          item.g.children[i].setAttribute("visibility", item.visibility);
          item.g.children[i].setAttribute("fill", "whitesmoke");
          item.g.children[i].setAttribute("fill-opacity", "0.6");
        }
      }
    }
		
		crboard.position++;
		if(crboard.position < crboard.queue.length) {
			setTimeout(render, item.delay);
		} else {
			// clear queue and exit
			crboard.queue = [];
			crboard.position = 0
		}
	}
	
  var setup_f = function (name) {
    // retrievs all leds and puts them into an array for controlling
    if (!name || !Sk.builtin.checkString(name)) {
      throw new TypeError('Invalid type for argument "name" provided: ' +
        Sk.abstr.typeName(name));
    }

    var name_s = Sk.ffi.remapToJs(name);

    // get the leds
    crboard.LEDs = document.getElementsByClassName(name_s);
    if (crboard.LEDs.length <= 0) {
      throw new Sk.builtin.ValueError(
        "No LEDs found for specified matrix identifier: " + name_s);
    }
    crboard.parent = crboard.LEDs[0].parentNode;
    crboard.rows = crboard.parent.getAttribute("rows");
    crboard.columns = crboard.parent.getAttribute("cols");
    var i, j;

    // create undefined matrix
    for (i = 0; i < crboard.rows; i++) {
      crboard.matrix[i] = [];
      for (j = 0; j < crboard.columns; j++) {
        crboard.matrix[i][j] = undefined;
      }
    }

    // read the rows and columns for individual LEDs and stores the svg:group in it
    for (i = 0; i < crboard.LEDs.length; i++) {
      crboard.matrix[crboard.LEDs[i].getAttribute("x") - 1][crboard.LEDs[i].getAttribute(
        "y") - 1] = crboard.LEDs[i];
    }
  };

  setup_f.co_varnames = ['name'];
  setup_f.$defaults = [new Sk.builtin.str('io_com1')];
  mod.setup = new Sk.builtin.func(setup_f);

  var digital_write_f = function (row, column, high_or_low, color, delay) {
    Sk.builtin.pyCheckArgs("digital_write", arguments, 3, 5, false);
		
		if(crboard.mode !== "READ") {
			throw new Sk.builtin.IOError("Can not write in currently set IO Port mode: " + crboard.mode);
		}
		
    if (!Sk.builtin.checkNumber(row)) {
      throw new TypeError('Invalid type provided for argument "row"');
    }

    if (!Sk.builtin.checkNumber(column)) {
      throw new TypeError('Invalid type provided for argument "column"');
    }

    if (!Sk.builtin.checkNumber(high_or_low) && !Sk.builtin.checkBool(
      high_or_low)) {
      throw new TypeError('Invalid type provided for argument "high_or_low"');
    }

    if (color && !Sk.builtin.checkString(color)) {
      throw new TypeError('Invalid type provided for argument "color"');
    }
		
    var _row = Sk.ffi.remapToJs(row);
    var _column = Sk.ffi.remapToJs(column);
    var _high_or_low = Sk.ffi.remapToJs(high_or_low);
    var _color = color ? Sk.ffi.remapToJs(color) : "lime";
		var _delay = delay ? Sk.ffi.remapToJs(delay) : 10;

    // check if row or column is out of bounds
    if (_row < 0 || _row >= crboard.rows) {
      throw new Sk.builtin.IndexError(
        'Tried to access undefined output pin row: ' + _row);
    }

    // check if row or column is out of bounds
    if (_column < 0 || _column >= crboard.columns) {
      throw new Sk.builtin.IndexError(
        'Tried to access undefined output pin row: ' + _column);
    }

    var g = crboard.matrix[_row][_column];

    var fill = "grey";
    var visibility = "hidden";

    // high output, set visibility and color
    if (_high_or_low) {
      fill = _color;
      visibility = "visible";
    }
		
		var queueItem = {};
		queueItem.g = g;
		queueItem.fill = fill;
		queueItem.visibility = visibility;
		queueItem.delay = _delay //ms
		
		crboard.queue.push(queueItem);
  };

  digital_write_f.co_varnames = ['row', 'column', 'high_or_low', 'color', 'delay'];
  digital_write_f.$defaults = [Sk.builtin.none.none$, Sk.builtin.none.none$,
    Sk.builtin.none.none$, new Sk.builtin.str("white"), new Sk.builtin.int_(10)
  ];
  mod.digital_write = new Sk.builtin.func(digital_write_f);
	
	var flush_f = function() {
		if(crboard.queue.length > 0) {
			render();
		} else {
			throw new Sk.builtin.ValueError("No writing operations available for flushing to matrix.");
		}
	};
	mod.flush = new Sk.builtin.func(flush_f);
	
	var set_pinmode_f = function(mode) {
		Sk.builtin.pyCheckArgs("set_pinmode", arguments, 1, 1, false);
		
		if (mode && !Sk.builtin.checkString(mode)) {
      throw new TypeError('Expected type string for argument "mode"');
    }
		
		var _mode = Sk.ffi.remapToJs(mode);
		
		if(_mode.toUpperCase() === "READ" || _mode.toUpperCase() === "R") {
			crboard.mode = "READ";
		} else if(_mode.toUpperCase() === "WRITE" || _mode.toUpperCase() === "W") {
			crboard.mode = "Write";
		} else {
			throw new Sk.builtin.ValueError('Unexpected value for argument "mode": ' + _mode);
		}
		
	};
	mod.set_pinmode = new Sk.builtin.func(set_pinmode_f);
	
	var get_pinmode_f = function() {
		return new Sk.builtin.str(crboard.mode);
	};
	mod.get_pinmode = new Sk.builtin.func(get_pinmode_f);
	
  return mod;
};
