/* Simple module for some numpy functions */

var numpy = function()
{
 // empty constructor
};

numpy.prototype.wrapasfloats = function(values)
{
	var i;
	for(i=0; i < values.length; i++)
	{
		values[i] = new Sk.builtin.nmber(values[i], Sk.builtin.nmber.float$);
	}
	
	return values;
};

numpy.prototype.zeros = function(shape, dtype, order)
{
	var res = shape;//this.array(shape);
	this.fill(res, dtype, 0);
	return res;
};

numpy.prototype.ones = function(shape, dtype, order)
{
	var res = shape;//this.array(shape);
	this.fill(res, dtype, 1);
	return res;
};

// fills a multidimensional array with the given val
numpy.prototype.fill = function(array_like, dtype, val)
{
	if( Object.prototype.toString.call(array_like) === '[object Array]' ) {
		for (var i = 0; i < array_like.length; ++i)
		{
			if(Object.prototype.toString.call(array_like[i]) === '[object Array]')
			{			
				array_like[i] = this.fill(array_like[i], dtype, val);
			}
			else
			{
				if(dtype === Sk.builtin.nmber.int$)
					array_like[i] = int(val);
				else
					array_like[i] = val * 1.0;
			}
		}
	}

	return array_like;
};

numpy.prototype.array = function(length)
{
    var arr = new Array(length || 0);
    var i = length;

    if (arguments.length > 1) 
	{
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = this.array.apply(this, args);
    }

    return arr;
};

numpy.prototype.onarray = function(array, func)
{
	var i;
	for (i = 0; i < array.length; i++) {
		array[i] = func(Sk.ffi.unwrapo(array[i]));
	}
	
	return array;
};

numpy.prototype.arange = function(start, stop, step, type)
{
	if(step === undefined)
		step = 1.0;
		
	if(type === undefined)
		type = Sk.builtin.nmber.float$;
	
	if(type == Sk.builtin.nmber.float$)
	{
		start *= 1.0;
		stop = Math.ceil((stop - start)/step)
		step *= 1.0;
	}
	
	var res = [];

	for(var i = start; i<stop; i+= step)
	{
		if(type == Sk.builtin.nmber.float$)
		{
			res.push(new Sk.builtin.nmber(i, Sk.builtin.nmber.float$));
		}
		else
		{
			res.push(new Sk.builtin.nmber(i, Sk.builtin.nmber.int$));
		}
	}
	
	return res;
};

var $builtinmodule = function(name)
{
    var np = new numpy();
	
	var mod = {};
	
	/* Simple reimplementation of the linspace function
	 * http://docs.scipy.org/doc/numpy/reference/generated/numpy.linspace.html
	 */
	 
	var linspace_f = function(start, stop, num, endpoint, retstep) {
		Sk.builtin.pyCheckArgs("linspace", arguments, 3, 5);
		Sk.builtin.pyCheckType("start", "number", Sk.builtin.checkNumber(start));
		Sk.builtin.pyCheckType("stop", "number", Sk.builtin.checkNumber(stop));
		
		if(num === undefined)
		{
			num = 50;
		}
		var num_num = Sk.builtin.asnum$(num);
		
		if(endpoint === undefined)
		{
			var endpoint_bool = true;
		}
		else if(endpoint.constructor === Sk.builtin.bool)
		{
			var endpoint_bool = endpoint.v;
		}
		
		if(retstep === undefined)
		{
			var retstep = false;
		}
		else if(retstep.constructor === Sk.builtin.bool)
		{
			var retstep_bool = retstep.v;
		}
				
		var samples;
		var step;
		
		start_num = Sk.builtin.asnum$(start) * 1.0;
		stop_num = Sk.builtin.asnum$(stop) * 1.0;
		
		if(num_num <= 0)
			return new Sk.builtin.list([]);
		
		if(endpoint_bool)
		{
			if(num_num	== 1)
				return new Sk.builtin.list([new Sk.builtin.nmber(start_num, Sk.builtin.nmber.float$)]);
				
			step = (stop_num - start_num)/(num_num -1);
			var samples_array = np.arange(0, num_num);
			samples = np.onarray(samples_array, function(v) {return v * step + start_num});
			samples[samples.length-1] = stop_num;
		}
		else
		{
			step = (stop_num - start_num)/num_num;
			var samples_array = np.arange(0, num_num);
			samples = np.onarray(samples_array, function(v) {return v * step + start_num});
		}
		
		/* return tuple if retstep is true */
		if(retstep_bool === true)
			return new Sk.builtin.tuple([new Sk.builtin.list(np.wrapasfloats(samples)), step]);
		
		return new Sk.builtin.list(np.wrapasfloats(samples));
	}
	
	// this should allow for named parameters
	linspace_f.co_varnames = ['start','stop','num','endpoint', 'retstep'];
	linspace_f.$defaults = [0,0,50,true,false];
	mod.linspace = new Sk.builtin.func(linspace_f);
	
	/* Simple reimplementation of the arange function 
	 * http://docs.scipy.org/doc/numpy/reference/generated/numpy.arange.html#numpy.arange
	 */
	var arange_f = function(start, stop, step, dtype) {
        Sk.builtin.pyCheckArgs("arange", arguments, 1, 4);
        Sk.builtin.pyCheckType("start", "number", Sk.builtin.checkNumber(start));
	
	
		if(stop === undefined && step === undefined)
		{
			var start_num = Sk.builtin.asnum$(0);
			var stop_num = Sk.builtin.asnum$(start);
			var step_num = Sk.builtin.asnum$(1);
		}
		else if(step === undefined)
		{
			var start_num = Sk.builtin.asnum$(start);
			var stop_num = Sk.builtin.asnum$(stop);
			var step_num = Sk.builtin.asnum$(1);
		}
		else
		{
			var start_num = Sk.builtin.asnum$(start);
			var stop_num = Sk.builtin.asnum$(stop);
			var step_num = Sk.builtin.asnum$(step);
		}
		
		// set to float, if start is not int but a number
		var type = Sk.builtin.nmber.int$;
		if(!Sk.builtin.checkInt(start))
		{
			type = Sk.builtin.nmber.float$;
		}

		// return as list, dunno how to work with arrays.
		return new Sk.builtin.list(np.arange(start_num, stop_num, step_num, type));
    };
	
	arange_f.co_varnames = ['start', 'stop', 'step', 'dtype'];
	arange_f.$defaults = [0,1,1,Sk.builtin.none.none$];
	mod.arange = new Sk.builtin.func(arange_f);
	
	/* dummy implementation for numpy.array
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
	var array_f = function(object, dtype, copy, order, subok, ndmin)
	{
		if(object === undefined)
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(object) + "' object is undefined");
		
		var res=[];
		
		if(object instanceof Sk.builtin.list)
		{
			object = Sk.ffi.remapToJs(object);
			var i;
			var type;
			
			// determine type
			//if(dtype === Sk.builtin.none.none$ && object != undefined && object[0] != undefined)
			//{
			//	type = Sk.builtin.checkNumber(dtype)?new Sk.builtin.nmber.number?;
			//}
			
			if(copy)
			{
				var array = np.array(object.length);
				for(i = 0; i < array.length; i++)
					res.push(array[i]);
			}
			else
			{
				res = object;
			}
		}
		else
		{
			res = Sk.ffi.remapToJs(object);
		}
		
		return Sk.ffi.remapToPy(res);
	}
	
	array_f.co_varnames = ['object','dtype','copy','order', 'subok', 'ndmin'];
	array_f.$defaults = [null,Sk.builtin.none.none$,true,Sk.builtin.none.none$,false, 0];
	mod.array = new Sk.builtin.func(array_f);
	
	var zeros_f = function(shape, dtype, order)
	{
		Sk.builtin.pyCheckArgs("zeros", arguments, 1, 3);
		
		if(dtype instanceof Sk.builtin.list)
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) + "' is not supported for dtype.");
		}
		
		// generate an array of the dimensions for the generic array method
		var dims = [];
		if(shape === undefined)
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(shape) + "' object is undefined while calling zeros");
		}
		else if(Sk.builtin.checkNumber(shape))
		{
			dims.push(Sk.builtin.asnum$(shape));
		}
		else if(shape instanceof Sk.builtin.tuple)
		{
			for(var i = 0; i < shape.v.length; i++)
				dims.push(Sk.builtin.asnum$(shape.v[i]));
		}
		else 
		{
			for(var i = 0; i < shape.v.length; i++)
				dims.push(Sk.builtin.asnum$(shape.v[i]));
		}
		
		var res = np.array.apply(np, dims)
		res = np.zeros(res, dtype, order);
		
		return Sk.ffi.remapToPy(res);
	};
	zeros_f.co_varnames = ['shape','dtype','order'];
	zeros_f.$defaults = [0,Sk.builtin.none.none$,'C'];
	mod.zeros = new Sk.builtin.func(zeros_f);
	
	var ones_f = function(shape, dtype, order)
	{
		Sk.builtin.pyCheckArgs("ones", arguments, 1, 3);
		
		if(dtype instanceof Sk.builtin.list)
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) + "' is not supported for dtype.");
		}
		
		// generate an array of the dimensions for the generic array method
		var dims = [];
		if(shape === undefined)
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(shape) + "' object is undefined while calling ones");
		}
		else if(Sk.builtin.checkNumber(shape))
		{
			dims.push(Sk.builtin.asnum$(shape));
		}
		else if(shape instanceof Sk.builtin.tuple)
		{
			for(var i = 0; i < shape.v.length; i++)
				dims.push(Sk.builtin.asnum$(shape.v[i]));
		}
		else 
		{
			for(var i = 0; i < shape.v.length; i++)
				dims.push(Sk.builtin.asnum$(shape.v[i]));
		}
		
		var res = np.array.apply(np, dims)
		res = np.ones(res, dtype, order);
		
		return Sk.ffi.remapToPy(res);
	};
	ones_f.co_varnames = ['shape','dtype','order'];
	ones_f.$defaults = [0,Sk.builtin.none.none$,'C'];
	mod.ones = new Sk.builtin.func(ones_f);
	
	/* not implemented methods */
	mod.ones_like = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ones_like is not yet implemented")});
	mod.empty_like = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("empty_like is not yet implemented")});
	mod.ones_like = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ones_like is not yet implemented")});
	mod.empty = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("empty is not yet implemented")});
	mod.asarray = new Sk.builtin.func(array_f);
	return mod;
}