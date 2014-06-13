/**
	Circuit board class, retrieves an circuit board and provides mechanisms to animate LEDs

**/
var $builtinmodule = function (name) {
  var mod = {};

  var crboard = {};
  crboard.matrix = [];

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

  var digital_write_f = function (row, column, high_or_low, color) {
    Sk.builtin.pyCheckArgs("digital_write", arguments, 3, 4, true);

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

    // check if row or column is out of bounds
    if (_row <= 0 || _row >= crboard.rows) {
      throw new Sk.builtin.IndexError(
        'Tried to access undefined output pin row: ' + _row);
    }

    // check if row or column is out of bounds
    if (_column <= 0 || _column >= crboard.cols) {
      throw new Sk.builtin.IndexError(
        'Tried to access undefined output pin row: ' + _column);
    }

    var g = crboard.matrix[row][col];

    var fill = "grey";
    var visibility = "hidden";

    // high output, set visibility and color
    if (_high_or_low) {
      fill = _color;
      visibility = "visible";
    }

    var i;
    for (i = 0; i < g.children.length; i++) {
      if (g.children[i].nodeName === "circle") {
        g.children[i].setAttribute("fill", color);
        if (!g.children[i].classList.contains("crledbase")) {
          g.children[i].setAttribute("visibility", visibility);
          g.children[i].setAttribute("fill", "whitesmoke");
          g.children[i].setAttribute("fill-opacity", "0.6");
        }
      }
    }
  };

  digital_write_f.co_varnames = ['row', 'column', 'high_or_low', 'color'];
  digital_write_f.$defaults = [Sk.builtin.none.none$, Sk.builtin.none.none$,
    Sk.builtin.none.none$, new Sk.builtin.str("white")
  ];
  mod.digital_write = new Sk.builtin.func(digital_write_f);

  return mod;
};
