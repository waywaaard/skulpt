/* Simple module for some numpy functions */

var numpy = function() {
  if (typeof mathjs == 'function') {
    // load mathjs instance
    this.math = mathjs();
  } else {
    Sk.debugout("mathjs not included and callable");
  }
};

numpy.prototype.wrapasfloats = function(values) {
  var i;
  for (i = 0; i < values.length; i++) {
    values[i] = new Sk.builtin.nmber(values[i], Sk.builtin.nmber.float$);
  }

  return values;
};

numpy.prototype.zeros = function(shape, dtype, order) {
  var res = shape; //this.array(shape);
  this.fill(res, dtype, 0);
  return res;
};

numpy.prototype.ones = function(shape, dtype, order) {
  var res = shape; //this.array(shape);
  this.fill(res, dtype, 1);
  return res;
};

// fills a multidimensional array with the given val
numpy.prototype.fill = function(array_like, dtype, val) {
  var i;

  if (Object.prototype.toString.call(array_like) === '[object Array]') {
    for (i = 0; i < array_like.length; ++i) {
      if (Object.prototype.toString.call(array_like[i]) === '[object Array]') {
        array_like[i] = this.fill(array_like[i], dtype, val);
      } else {
        if (dtype === Sk.builtin.nmber.int$)
          array_like[i] = int(val);
        else
          array_like[i] = val * 1.0;
      }
    }
  }

  return array_like;
};

numpy.prototype.array = function(length) {
  var arr = new Array(length || 0);
  var i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) arr[length - 1 - i] = this.array.apply(this, args);
  }

  return arr;
};

numpy.prototype.onarray = function(array, func) {
  var i;
  for (i = 0; i < array.length; i++) {
    array[i] = func(Sk.ffi.unwrapo(array[i]));
  }

  return array;
};

numpy.prototype.dot = function(a, b) {
  if (math === undefined) {
    if (console !== undefined)
      Sk.debugout("math object not defined");

    return null;
  }

  var res;

  var a_matrix = math.matrix(a);
  var b_matrix = math.matrix(b);

  res = math.multiply(a_matrix, b_matrix);

  return res;
};

numpy.prototype.arange = function(start, stop, step, type) {
  if (step === undefined)
    step = 1.0;

  if (type === undefined)
    type = Sk.builtin.nmber.float$;

  if (type == Sk.builtin.nmber.float$) {
    start *= 1.0;
    stop = Math.ceil((stop - start) / step);
    step *= 1.0;
  }

  var res = [];

  for (var i = start; i < stop; i += step) {
    if (type == Sk.builtin.nmber.float$) {
      res.push(new Sk.builtin.nmber(i, Sk.builtin.nmber.float$));
    } else {
      res.push(new Sk.builtin.nmber(i, Sk.builtin.nmber.int$));
    }
  }

  return res;
};

var $builtinmodule = function(name) {
  var np = new numpy();

  var mod = {};

  /**
		Class for ndarray
	**/
  var CLASS_NDARRAY = "ndarray";

  function remapToJs_shallow(obj) {
    if (obj instanceof Sk.builtin.list) {
      return obj.v;
    } else {
      var ret = [];
      for (var i = 0; i < valuePy.v.length; ++i) {
        ret.push(Sk.ffi.remapToJs(valuePy.v[i]));
      }
      return ret;
    }
  }

  /**
		Unpacks in any form nested Lists
	**/
  function unpack(py_obj, buffer, state) {
    if (py_obj instanceof Sk.builtin.list || py_obj instanceof Sk.builtin.tuple) {
      var py_items = remapToJs_shallow(py_obj);
      state.level += 1;

      if (state.level > state.shape.length) {
        state.shape.push(py_items.length);
      } else {
        // check for equality
      }
      var i;
      var len = py_items.length;
      for (i = 0; i < len; i++) {
        unpack(py_items[i], buffer, state);
      }
      state.level -= 1;
    } else {
      buffer.push(py_obj);
    }
  }

  function computeStrides(shape) {
    var strides = shape.slice(0);
    strides.reverse();
    var prod = 1;
    var temp;
    for (var i = 0, len = strides.length; i < len; i++) {
      temp = strides[i];
      strides[i] = prod;
      prod *= temp;
    }

    return strides.reverse();
  }

  function computeOffset(strides, index) {
    var offset = 0;
    for (var k = 0, len = strides.length; k < len; k++) {
      offset += strides[k] * index[k];
    }
    return offset;
  }

  /**
    Calculates the size of the ndarray, dummy
	**/
  function prod(numbers) {
    var size = 1;
    var i;
    for (i = 0; i < numbers.length; i++) {
      size *= numbers[i];
    }
    return size;
  }

  /**
		Creates a string representation for given buffer and shape
		buffer is an ndarray
	**/
  function stringify(buffer, shape) {
    var emits = shape.map(function(x) {
      return 0;
    });
    var uBound = shape.length - 1;
    var idxLevel = 0;
    var str = "[";
    var i = 0;
    while (idxLevel !== -1) {
      if (emits[idxLevel] < shape[idxLevel]) {
        if (emits[idxLevel] !== 0) {
          str += ", ";
        }

        if (idxLevel < uBound) {
          str += "[";
          idxLevel += 1;
        } else {
          str += Sk.ffi.remapToJs(Sk.builtin.str(buffer[i++]));
          emits[idxLevel] += 1;
        }
      } else {
        emits[idxLevel] = 0;
        str += "]";
        idxLevel -= 1;
        if (idxLevel >= 0) {
          emits[idxLevel] += 1;
        }
      }
    }
    return str;
  }

  var ndarray_f = function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, shape, dtype, buffer,
      offset, strides, order) {
      var ndarrayJs = {}; // js object holding the actual array
      ndarrayJs.shape = Sk.ffi.remapToJs(shape);

      ndarrayJs.strides = computeStrides(ndarrayJs.shape);
      ndarrayJs.dtype = dtype;

      if (buffer && buffer instanceof Sk.builtin.list) {
        ndarrayJs.buffer = Sk.ffi.remapToJs(buffer);
      }

      self.v = ndarrayJs; // value holding the actual js object and array
      self.tp$name = CLASS_NDARRAY; // set class name
    });

    $loc.__getattr__ = new Sk.builtin.func(function(self, name) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      // TODO: implement this
      switch (name) {
        case 'dtype':
          return ndarrayJs.dtype;
        case 'ndim':
          return new Sk.builtin.int_(ndarrayJs.shape.length);
        case 'shape':
          return new Sk.builtin.tuple(ndarrayJs.shape.map(function(x) {
            return new Sk.builtin.int_(x);
          }));
        case 'size':
          return new Sk.builtin.int_(prod(ndarrayJs.shape));
        case 'strides':
          return new Sk.builtin.tuple(ndarrayJs.strides.map(function(x) {
            return new Sk.builtin.int_(x);
          }));
        case 'buffer':
          return new Sk.builtin.list(ndarrayJs.buffer);

        default:
          throw new Sk.builtin.AttributeError('Attribute "' + name +
            '" is not getable on type "' + CLASS_NDARRAY + '"');
      }
    });

    $loc.tolist = new Sk.builtin.func(function(self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var buffer = ndarrayJs.buffer.map(function(x) {
        return x;
      });
      return new Sk.builtin.list(buffer);
    });

    $loc.reshape = new Sk.builtin.func(function(self, shape, order) {
      Sk.builtin.pyCheckArgs("reshape", arguments, 2, 3);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, ndarrayJs.dtype,
        new Sk.builtin.list(ndarrayJs.buffer));
    });

    $loc.copy = new Sk.builtin.func(function(self, order) {
      Sk.builtin.pyCheckArgs("copy", arguments, 1, 2);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var buffer = ndarrayJs.buffer.map(function(x) {
        return x;
      });
      var shape = new Sk.builtin.tuplePy(ndarrayJs.shape.map(function(x) {
        return new Sk.builtin.int_(x);
      }));
      return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, ndarrayJs.dtype,
        new Sk.builtin.list(buffer));
    });

    $loc.fill = new Sk.builtin.func(function(self, value) {
      Sk.builtin.pyCheckArgs("fill", arguments, 2, 2);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var buffer = ndarrayJs.buffer.map(function(x) {
        return x;
      });
      var i;
      for (i = 0; i < ndarrayJs.buffer.length; i++) {
        if (ndarrayJs.dtypePy) {
          ndarrayJs.buffer[i] = Sk.misceval.callsim(ndarrayJs.dtypePy,
            valuePy);
        }
      }
      return new Sk.builtin.list(buffer);
    });

    $loc.__getitem__ = new Sk.builtin.func(function(self, index) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      // TODO: implement this
      return index;
    });

    $loc.__setitem__ = new Sk.builtin.func(function(self, index) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      // TODO: implement this
      return index;
    });

    $loc.__len__ = new Sk.builtin.func(function(self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);

      return new Sk.builtin.int_(ndarrayJs.shape[0]);
    });

    $loc.__iter__ = new Sk.builtin.func(function(self, index) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var ret = {
        tp$iter: function() {
          return ret;
        },
        $obj: ndarrayJs,
        $index: 0,
        tp$iternext: function() {
          if (ret.$index >= ret.$obj.buffer.length)
            return undefined;

          return ret.$obj.buffer[ret.$index++];
        }
      };
      return ret;
    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      return new Sk.builtin.str(stringify(ndarrayJs.buffer,
        ndarrayJs.shape));
    });

    $loc.__repr__ = new Sk.builtin.func(function(self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      return new Sk.builtin.str("array(" + stringify(ndarrayJs.buffer,
        ndarrayJs.shape) + ")");
    });

    $loc.__add__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "__add__ is not yet implemented");
    });
    $loc.__radd__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "__radd__ is not yet implemented");
    });

    $loc.__sub__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "__sub__ is not yet implemented");
    });
    $loc.__rsub__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "__rsub__ is not yet implemented");
    });

    $loc.__mul__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "__mul__ is not yet implemented");
    });
    $loc.__rmul__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "__rmul__ is not yet implemented");
    });

    $loc.__div__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__rdiv__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    $loc.__mod__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__rmod__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    $loc.__xor__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__rxor__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    $loc.__lshift__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__rlshift__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    $loc.__rshift__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__rrshift__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    $loc.__pos__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__neg__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    $loc.__exp__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });
    $loc.__sin__ = new Sk.builtin.func(function() {
      throw new Sk.builtin.NotImplementedError(
        "ones_like is not yet implemented");
    });

    // end of ndarray_f
  };

  mod[CLASS_NDARRAY] = Sk.misceval.buildClass(mod, ndarray_f,
    CLASS_NDARRAY, []);

  /* Simple reimplementation of the linspace function
   * http://docs.scipy.org/doc/numpy/reference/generated/numpy.linspace.html
   */

  var linspace_f = function(start, stop, num, endpoint, retstep) {
    Sk.builtin.pyCheckArgs("linspace", arguments, 3, 5);
    Sk.builtin.pyCheckType("start", "number", Sk.builtin.checkNumber(
      start));
    Sk.builtin.pyCheckType("stop", "number", Sk.builtin.checkNumber(
      stop));

    if (num === undefined) {
      num = 50;
    }
    var num_num = Sk.builtin.asnum$(num);
    var endpoint_bool;

    if (endpoint === undefined) {
      endpoint_bool = true;
    } else if (endpoint.constructor === Sk.builtin.bool) {
      endpoint_bool = endpoint.v;
    }

    var retstep_bool;
    if (retstep === undefined) {
      retstep_bool = false;
    } else if (retstep.constructor === Sk.builtin.bool) {
      retstep_bool = retstep.v;
    }

    var samples;
    var step;

    start_num = Sk.builtin.asnum$(start) * 1.0;
    stop_num = Sk.builtin.asnum$(stop) * 1.0;

    if (num_num <= 0)
      return new Sk.builtin.list([]);

    var samples_array;
    if (endpoint_bool) {
      if (num_num == 1)
        return new Sk.builtin.list([new Sk.builtin.nmber(start_num,
          Sk.builtin.nmber.float$)]);

      step = (stop_num - start_num) / (num_num - 1);
      samples_array = np.arange(0, num_num);
      samples = np.onarray(samples_array, function(v) {
        return v * step + start_num;
      });
      samples[samples.length - 1] = stop_num;
    } else {
      step = (stop_num - start_num) / num_num;
      samples_array = np.arange(0, num_num);
      samples = np.onarray(samples_array, function(v) {
        return v * step + start_num;
      });
    }

    /* return tuple if retstep is true */
    if (retstep_bool === true)
      return new Sk.builtin.tuple([new Sk.builtin.list(np.wrapasfloats(
        samples)), step]);

    return new Sk.builtin.list(np.wrapasfloats(samples));
  };

  // this should allow for named parameters
  linspace_f.co_varnames = ['start', 'stop', 'num', 'endpoint',
    'retstep'
  ];
  linspace_f.$defaults = [0, 0, 50, true, false];
  mod.linspace =
    new Sk.builtin.func(linspace_f);

  /* Simple reimplementation of the arange function
   * http://docs.scipy.org/doc/numpy/reference/generated/numpy.arange.html#numpy.arange
   */
  var arange_f = function(start, stop, step, dtype) {
    Sk.builtin.pyCheckArgs("arange", arguments, 1, 4);
    Sk.builtin.pyCheckType("start", "number", Sk.builtin.checkNumber(
      start));
    var start_num;
    var stop_num;
    var step_num;

    if (stop === undefined && step === undefined) {
      start_num = Sk.builtin.asnum$(0);
      stop_num = Sk.builtin.asnum$(start);
      step_num = Sk.builtin.asnum$(1);
    } else if (step === undefined) {
      start_num = Sk.builtin.asnum$(start);
      stop_num = Sk.builtin.asnum$(stop);
      step_num = Sk.builtin.asnum$(1);
    } else {
      start_num = Sk.builtin.asnum$(start);
      stop_num = Sk.builtin.asnum$(stop);
      step_num = Sk.builtin.asnum$(step);
    }

    // set to float, if start is not int but a number
    var type = Sk.builtin.nmber.int$;
    if (!Sk.builtin.checkInt(start)) {
      type = Sk.builtin.nmber.float$;
    }

    // return as list, dunno how to work with arrays.
    return new Sk.builtin.list(np.arange(start_num, stop_num,
      step_num, type));
  };

  arange_f.co_varnames = ['start', 'stop', 'step', 'dtype'];
  arange_f
    .$defaults = [0, 1, 1, Sk.builtin.none.none$];
  mod.arange = new Sk.builtin
    .func(arange_f);

  /* implementation for numpy.array
	------------------------------------------------------------------------------------------------
		http://docs.scipy.org/doc/numpy/reference/generated/numpy.array.html#numpy.array

		object : array_like
		An array, any object exposing the array interface, an object whose __array__ method returns an array, or any (nested) sequence.

		dtype : data-type, optional
		The desired data-type for the array. If not given, then the type will be determined as the minimum type required to hold the objects in the sequence. This argument can only be used to ‘upcast’ the array. For downcasting, use the .astype(t) method.

		copy : bool, optional
		If true (default), then the object is copied. Otherwise, a copy will only be made if __array__ returns a copy, if obj is a nested sequence, or if a copy is needed to satisfy any of the other requirements (dtype, order, etc.).

		order : {‘C’, ‘F’, ‘A’}, optional
		Specify the order of the array. If order is ‘C’ (default), then the array will be in C-contiguous order (last-index varies the fastest). If order is ‘F’, then the returned array will be in Fortran-contiguous order (first-index varies the fastest). If order is ‘A’, then the returned array may be in any order (either C-, Fortran-contiguous, or even discontiguous).

		subok : bool, optional
		If True, then sub-classes will be passed-through, otherwise the returned array will be forced to be a base-class array (default).

		ndmin : int, optional
		Specifies the minimum number of dimensions that the resulting array should have. Ones will be pre-pended to the shape as needed to meet this requirement.

		Returns :
		out : ndarray
		An array object satisfying the specified requirements
	*/
  // https://github.com/geometryzen/davinci-dev/blob/master/src/stdlib/numpy.js
  // https://github.com/geometryzen/davinci-dev/blob/master/src/ffh.js
  // http://docs.scipy.org/doc/numpy/reference/arrays.html
  var array_f = function(object, dtype, copy, order, subok, ndmin) {
    Sk.builtin.pyCheckArgs("array", arguments, 1, 6);

    if (object === undefined)
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(object) +
        "' object is undefined");

    var elements = [];
    var state = {};
    state.level = 0;
    state.shape = [];
    //debugger;
    unpack(object, elements, state);

    // apply dtype casting function, if it has been provided
    if (dtype && Sk.builtin.checkFunction(dtype)) {
      var i;
      for (i = 0; i < elements.length; i++) {
        elements[i] = Sk.misceval.callsim(dtype, elements[i]);
      }
    }

    var _shape = new Sk.builtin.tuple(state.shape.map(function(x) {
      return new Sk.builtin.int_(x);
    }));

    var _buffer = new Sk.builtin.list(elements);

    // create new ndarray instance
    return Sk.misceval.callsim(mod[CLASS_NDARRAY], _shape, dtype,
      _buffer);
  };

  array_f.co_varnames = ['object', 'dtype', 'copy', 'order',
    'subok', 'ndmin'
  ];
  array_f.$defaults = [null, Sk.builtin.none.none$, true, Sk.builtin
    .none.none$, false, 0
  ];
  mod.array = new Sk.builtin.func(array_f);

  var zeros_f = function(shape, dtype, order) {
    Sk.builtin.pyCheckArgs("zeros", arguments, 1, 3);

    if (dtype instanceof Sk.builtin.list) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) +
        "' is not supported for dtype.");
    }

    // generate an array of the dimensions for the generic array method
    var dims = [];
    var i;
    if (shape === undefined) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(shape) +
        "' object is undefined while calling zeros");
    } else if (Sk.builtin.checkNumber(shape)) {
      dims.push(Sk.builtin.asnum$(shape));
    } else if (shape instanceof Sk.builtin.tuple) {
      for (i = 0; i < shape.v.length; i++)
        dims.push(Sk.builtin.asnum$(shape.v[i]));
    } else {
      for (i = 0; i < shape.v.length; i++)
        dims.push(Sk.builtin.asnum$(shape.v[i]));
    }

    var res = np.array.apply(np, dims);
    res = np.zeros(res, dtype, order);

    return Sk.ffi.remapToPy(res);
  };
  zeros_f.co_varnames = ['shape', 'dtype', 'order'];
  zeros_f.$defaults = [0, Sk.builtin.none.none$, 'C'];
  mod.zeros = new Sk.builtin.func(zeros_f);

  var ones_f = function(shape, dtype, order) {
    Sk.builtin.pyCheckArgs("ones", arguments, 1, 3);

    if (dtype instanceof Sk.builtin.list) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) +
        "' is not supported for dtype.");
    }

    // generate an array of the dimensions for the generic array method
    var dims = [];
    var i;
    if (shape === undefined) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(shape) +
        "' object is undefined while calling ones");
    } else if (Sk.builtin.checkNumber(shape)) {
      dims.push(Sk.builtin.asnum$(shape));
    } else if (shape instanceof Sk.builtin.tuple) {
      for (i = 0; i < shape.v.length; i++)
        dims.push(Sk.builtin.asnum$(shape.v[i]));
    } else {
      for (i = 0; i < shape.v.length; i++)
        dims.push(Sk.builtin.asnum$(shape.v[i]));
    }

    var res = np.array.apply(np, dims);
    res = np.ones(res, dtype, order);

    return Sk.ffi.remapToPy(res);
  };
  ones_f.co_varnames = ['shape', 'dtype', 'order'];
  ones_f.$defaults = [0, Sk.builtin.none.none$, 'C'];
  mod.ones = new Sk.builtin.func(ones_f);

  var dot_f = function(a, b) {
    Sk.builtin.pyCheckArgs("dot", arguments, 2, 2);

    if (!(a instanceof Sk.builtin.list) && !Sk.builtin.checkNumber(
      a)) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(a) +
        "' is not supported for a.");
    }

    if (!(b instanceof Sk.builtin.list) && !Sk.builtin.checkNumber(
      b)) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(b) +
        "' is not supported for b.");
    }

    var res;

    var a_matrix = Sk.ffi.remapToJs(a);
    var b_matrix = Sk.ffi.remapToJs(b);

    var a_size = np.math.size(a_matrix);
    var b_size = np.math.size(b_matrix);


    if (a_size.length >= 1 && b_size.length > 1) {
      if (a_size[a_size.length - 1] != b_size[b_size - 2]) {
        throw new Sk.builtin.ValueError(
          "The last dimension of a is not the same size as the second-to-last dimension of b."
        );
      }
    }

    res = np.math.multiply(a_matrix, b_matrix);

    return Sk.ffi.remapToPy(res);
  };
  dot_f.co_varnames = ['a', 'b'];
  dot_f.$defaults = [Sk.builtin.none.none$, Sk.builtin.none.none$];
  mod.dot = new Sk.builtin.func(dot_f);

  /* not implemented methods */
  mod.ones_like = new Sk.builtin.func(function() {
    throw new Sk.builtin.NotImplementedError(
      "ones_like is not yet implemented");
  });
  mod.empty_like = new Sk.builtin.func(function() {
    throw new Sk.builtin.NotImplementedError(
      "empty_like is not yet implemented");
  });
  mod.ones_like = new Sk.builtin.func(function() {
    throw new Sk.builtin.NotImplementedError(
      "ones_like is not yet implemented");
  });
  mod.empty = new Sk.builtin.func(function() {
    throw new Sk.builtin.NotImplementedError(
      "empty is not yet implemented");
  });
  mod.asarray = new Sk.builtin.func(array_f);
  return mod;
};
