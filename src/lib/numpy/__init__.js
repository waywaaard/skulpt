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
}

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
	mod.linspace = new Sk.builtin.func(function(start, stop, num, endpoint, retstep) {
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
    });
	
	/* Simple reimplementation of the arange function 
	 * http://docs.scipy.org/doc/numpy/reference/generated/numpy.arange.html#numpy.arange
	 */
	mod.arange = new Sk.builtin.func(function(start, stop, step, dtype) {
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
    });
	
	return mod;
}