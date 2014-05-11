var jsplotlib = {
	// empty object creation
	
};

var chart_counter = 0; // for creating unique ids

jsplotlib.make_chart = function(width, height, where_to_insert, how_to_insert, attributes) 
{
	chart_counter++;
	var DEFAULT_PADDING = 10;
	where_to_insert = where_to_insert || "body";
	width = width - 2 * DEFAULT_PADDING || 500;
	height = height - 2 * DEFAULT_PADDING || 200;
	attributes = attributes || {};
	
	// create id, if not given
	if(!('id' in attributes))
	{
		attributes.id = 'chart' + chart_counter;
	}
	
	var chart;
	if(!how_to_insert)
	{
		chart = d3.select(where_to_insert).append('svg');
	}
	else
	{
		chart = d3.select(where_to_insert).insert('svg', how_to_insert);
	}
	
	// set css classes
	chart.attr('class', 'chart');
	chart.attr('width', width);
	chart.attr('height', height);
	chart.attr('chart_count', chart_counter);
	// set additional given attributes
	for(var attribute in attributes)
	{
		if(attributes.hasOwnProperty(attribute))
		{
			chart.attr(attribute, attributes[attribute]);
		}
	}
	
	$('.chart#' + attributes.id).css('padding', DEFAULT_PADDING + 'px');
	return chart;
};

jsplotlib.construct_axis = function() 
{
	var axis_count = 0;
	return function(parent_graph, x_or_y) 
	{
		var that = {};
		that._id = "axis" + axis_count++;
		that._will_draw_label = false;
		that._will_draw_axis = true;
		that._x_or_y = x_or_y;
		that._size = 0;
		that._label_offset = 0;
		that._label_string = "";
		if (x_or_y === "x") 
		{
			that._axis_proportion = .12;
			that._label_proportion = .12;
		} 
		else if (x_or_y === "y") 
		{
			that._axis_proportion = .07;
			that._label_proportion = .05;
		} 
		else 
		{
			throw "Invalid axis type (must be x or y): " + this._x_or_y;
		}
		that._proportion = that._axis_proportion;
		that.n_ticks = 4;
		that.set_n_ticks = function(n) 
		{
			this.n_ticks = n;
		};
      that.set_label = function(label_string) 
	  {
        this._label_string = label_string;
        this._will_draw_label = true;
        this._proportion = this._axis_proportion + this._label_proportion;
        return this;
      };
		that._turn_off = function() 
		{
			this._will_draw_axis = false;
			return this;
		};
		that._turn_on = function() 
		{
			this._will_draw_axis = true;
			return this;
		};
		that.set_bar_limits = function(minmaxplus) 
		{
			var min = minmaxplus[0];
			var oldmax = minmaxplus[1];
			var plus = minmaxplus[2];
			var newmax;
			if (oldmax instanceof Date) 
			{
			  newmax = new Date(oldmax.getTime() + plus);
			} 
			else 
			{
			  newmax = oldmax + plus;
			}
			this._set_data_range([ min, newmax ]);
		};
		that._set_data_range = function(minmax) {
			this._min = minmax[0];
			this._max = minmax[1];
			if (this._min instanceof Date || this._max instanceof Date) 
			{
				this._scale = d3.time.scale();
				this._min = new Date(this._min);
				this._max = new Date(this._max);
			} 
			else 
			{
				this._scale = d3.scale.linear();
			}
			this._domain = [ this._min, this._max ];
			return this;
		};
		that._set_formatter = function(formatter) 
		{
			this._formatter = formatter;
			return this;
		};
		that.get_scale = function() 
		{
			if (this._x_or_y === "x") 
			{
				this._range = [ parent_graph._yaxis._size, parent_graph._chartwidth ];
			} 
			else if (this._x_or_y === "y") 
			{
				this._range = [ parent_graph._height, parent_graph._title_size ];
			}
			this._scale
				.domain(this._domain)
				.range(this._range);
            return this._scale;
		};
		that._init = function(chart) 
		{
			var dimension;
			if (this._will_draw_axis) 
			{
				if (this._x_or_y === "x") 
				{
					dimension = parent_graph._chartheight;
				} 
				else if (this._x_or_y === "y") 
				{
					dimension = parent_graph._chartwidth;
				} 
				else 
				{
					throw "Invalid axis type (must be x or y): " + this._x_or_y;
				}
				this._size = dimension * this._proportion;
				this._label_offset = this._size * this._label_proportion;
			} 
			else 
			{
				this._size = 0;
			}
			return this;
		};
		that._compute_transform_string = function() 
		{
			var offset_h, offset_v;
			var offset_label_h, offset_label_v;
			var label_rotation = "";
			if (this._x_or_y === "x") 
			{
				offset_h = 0;
				offset_v = parent_graph._height;
				offset_label_h = parent_graph._yaxis._size + parent_graph._chartwidth / 2;
				offset_label_v = parent_graph._height + this._size - this._label_offset;
				this._writing_mode = "lr-tb";
				this._orientation = "bottom";
			} 
			else if (this._x_or_y === "y") 
			{
				offset_h = this._size;
				offset_v = 0;
				offset_label_h = this._label_offset;
				offset_label_v = parent_graph._chartheight / 2;
				label_rotation = "rotate(180)";
				this._writing_mode = "tb-rl";
				this._orientation = "left";
			} 
			else 
			{
				throw "Invalid axis type (must be x or y): " + this._x_or_y;
			}
			this._transform_string = "translate(" + offset_h + "," + offset_v + ")scale(1,1)";
			this._label_transform_string = "translate(" + offset_label_h + "," + offset_label_v + ")" + label_rotation;
		};
		that._draw_axis = function() {
			if (this._will_draw_axis) 
			{
				this._formatter = this._formatter || this.get_scale().tickFormat(this.n_ticks);
				this._compute_transform_string();
				this._axis = d3.svg.axis().scale(this.get_scale()).ticks(this.n_ticks).orient(this._orientation).tickSubdivide(0).tickFormat(this._formatter);
				parent_graph.chart.append("svg:g").attr("id", this._id).attr("class", this._x_or_y + " axis").attr("transform", this._transform_string).call(this._axis);
			}
		};
		that._draw_label = function() {
			this._compute_transform_string();
			if (this._will_draw_axis && this._will_draw_label) 
			{
				parent_graph.chart.append("svg:g").attr("class", this._x_or_y + " axis_label").attr("transform", this._label_transform_string).append("text").append("tspan").attr("text-anchor", "middle").attr("class", this._x_or_y + " axis_label").attr("writing-mode", this._writing_mode).text(this._label_string);
			}
		};
		return that;
	};
}();

jsplotlib.construct_graph = function(chart) 
{
	var that = {
	  chart: chart
	};

	that._chartheight = parseInt(chart.attr("height"), 10);
	that._chartwidth = parseInt(chart.attr("width"));
	that._title_string = "";
	that._title_size = 0;
	that._xaxis = jsplotlib.construct_axis(that, "x");
	that._yaxis = jsplotlib.construct_axis(that, "y");
	that._axes = [ that._xaxis, that._yaxis ];
	that.data = function(d) {
	  this._data = d;
	  return this;
	};
	that.xlabel = function(xl) {
	  this._xaxis.set_label(xl);
	  return this;
	};
	that.ylabel = function(yl) {
	  this._yaxis.set_label(yl);
	  return this;
	};
	that.xaxis_off = function() {
	  this._xaxis._turn_off();
	  return this;
	};
	that.yaxis_off = function() {
	  this._yaxis._turn_off();
	  return this;
	};
	that.xaxis_on = function() {
	  this._xaxis._turn_on();
	  return this;
	};
	that.yaxis_on = function() {
	  this._yaxis._turn_on();
	  return this;
	};
	that.axis_on = function() {
	  this.yaxis_on();
	  this.xaxis_on();
	  return this;
	};
	that.axis_off = function() {
	  this.yaxis_off();
	  this.xaxis_off();
	  return this;
	};
	that.title = function(title_string) {
	  this._title_string = title_string;
	  this._title_size = this._chartheight * .1;
	  this._title_transform_string = "translate(" + this._chartwidth / 2 + "," + this._title_size / 2 + ")";
	  return this;
	};
	that._ylimits = function(minmax) {
	  this._yaxis._set_data_range(minmax);
	  return this;
	};
	that._xlimits = function(minmax) {
	  this._xaxis._set_data_range(minmax);
	  return this;
	};
	that.yformat = function(formatter) {
	  this._yaxis._set_formatter(formatter);
	  return this;
	};
	that.xformat = function(formatter) {
	  this._xaxis._set_formatter(formatter);
	  return this;
	};
	that.get_yscale = function() {
	  return this._yaxis.get_scale();
	};
	that.get_xscale = function() {
	  return this._xaxis.get_scale();
	};
	that._init_common = function() {
	  for (var i = 0; i < 2; i++) {
		this._axes[i]._init(this);
	  }
	  this._height = this._chartheight - this._xaxis._size;
	  this._width = this._chartwidth - this._yaxis._size;
	  return this;
	};
	that._draw_axes = function() {
	  for (var i = 0; i < 2; i++) {
		this._axes[i]._draw_axis(this);
		this._axes[i]._draw_label(this);
	  }
	  var myselector = "#" + chart.attr("id") + " .axis line, #" + chart.attr("id") + " .axis path";
	  $(myselector).css("fill", "none").css("stroke", "#000");
	  d3.svg.axis(chart);
	  if (this._title_string !== "") {
		that.chart.append("svg:g").attr("class", "graph_title").attr("transform", this._title_transform_string).append("text").append("tspan").attr("text-anchor", "middle").attr("class", "graph_title").attr("writing-mode", "rl-tb").text(this._title_string);
	  }
	  return this;
	};
	var chart_id = that.chart.attr("id");
	that.resize_function = function(resize_amount, direction) {
	  return function() {
		var node = this;
		while (node.id !== chart_id) {
		  node.parentNode.appendChild(node);
		  node = node.parentNode;
		}
		var object = d3.select(this);
		var x0 = parseInt(object.attr("x") || "0", 10);
		var width0 = parseInt(object.attr("width"), 10);
		var y0 = parseInt(object.attr("y") || "0", 10);
		var height0 = parseInt(object.attr("height"), 10);
		var newwidth, newheight, newx, newy;
		if (direction === "grow") {
		  object.attr("x_orig", x0).attr("y_orig", y0).attr("width_orig", width0).attr("height_orig", height0);
		  newwidth = width0 * resize_amount;
		  newheight = height0 * resize_amount;
		  newx = x0 - (resize_amount - 1) * width0 / 2;
		  newy = y0 - (resize_amount - 1) * height0 / 2;
		} else if (direction === "shrink") {
		  newwidth = object.attr("width_orig");
		  newheight = object.attr("height_orig");
		  newx = object.attr("x_orig");
		  newy = object.attr("y_orig");
		}
		object.attr("x", newx).attr("y", newy).attr("height", newheight).attr("width", newwidth);
	  };
	};
	that.x = function(x) {
	  this._x = x;
	  this._xlimits([ d3.min(x), d3.max(x) ]);
	  return this;
	};
	that.y = function(y) {
	  this._y = y;
	  this._ylimits([ d3.min(y), d3.max(y) ]);
	  return this;
	};
	that.xrange = function(min, max, N) {
	  this.x(jsplotlib.linspace(min, max, N));
	  return this;
	};
	that.yrange = function(min, max, N) {
	  this.y(jsplotlib.linspace(min, max, N));
	  return this;
	};
	return that;
};
  
jsplotlib.imshow = function(chart) 
{
	var that = jsplotlib.construct_graph(chart);
	that.cmap_bounds = function(cmin, cmax) {
	  this._cmin = cmin;
	  this._cmax = cmax;
	  this._color_picker = d3.interpolateRgb(cmin, cmax);
	  return this;
	};
	that.colormap_jet = function() {
	  var interpolators = [ d3.interpolateRgb("#000088", "#0000ff"), d3.interpolateRgb("#0000ff", "#0088ff"), d3.interpolateRgb("#0088ff", "#00ffff"), d3.interpolateRgb("#00ffff", "#88ff88"), d3.interpolateRgb("#88ff88", "#ffff00"), d3.interpolateRgb("#ffff00", "#ff8800"), d3.interpolateRgb("#ff8800", "#ff0000"), d3.interpolateRgb("#ff0000", "#880000") ];
	  this._color_picker = function(val) {
		var idx = Math.min(Math.floor(val * 8), 7);
		return interpolators[idx](val * 8 - idx);
	  };
	  return this;
	};
	that.colormap_gray = function() {
	  this.cmap_bounds("#010101", "#fefefe");
	  return this;
	};
	that.draw = function() {
	  this._init_common();
	  this._xlimits([ 0, this._data[0].length ]);
	  this._ylimits([ this._data.length, 0 ]);
	  var xscale = this.get_xscale();
	  var yscale = this.get_yscale();
	  var width = xscale(1) - xscale(0);
	  var height = yscale(1) - yscale(0);
	  var color_picker = this._color_picker;
	  var max_value = d3.max(this._data, function(d) {
		return d3.max(d);
	  });
	  var min_value = d3.min(this._data, function(d) {
		return d3.min(d);
	  });
	  var data_rescaler = d3.scale.linear().domain([ min_value, max_value ]).range([ 0, 1 ]);
	  this._rows = chart.selectAll("g.img_row").data(this._data).enter().append("g").attr("class", "img_row").attr("transform", function(d, i) {
		return "translate(0," + yscale(i) + ")";
	  });
	  this._pixels = this._rows.selectAll("g.img_pixel").data(function(d, i) {
		return d;
	  }).enter().append("g").attr("class", "img_pixel");
	  this._pixels.append("rect").attr("x", function(d, i) {
		return xscale(i);
	  }).attr("width", width).attr("height", height).style("fill", function(d, i) {
		return color_picker(data_rescaler(d));
	  }).on("mouseover", this.resize_function(1.15, "grow")).on("mouseout", this.resize_function(1.15, "shrink"));
	  var xformat = this._xaxis._formatter || function(x) {
		return x;
	  };
	  var yformat = this._yaxis._formatter || function(x) {
		return x;
	  };
	  $("#" + chart.attr("id") + " rect").tipsy({
		gravity: "w",
		html: true,
		title: function() {
		  return "" + this.__data__;
		}
	  });
	  this._draw_axes();
	  return this;
	};
	return that;
};
  
jsplotlib.pplot = function(chart) 
{
	var that = jsplotlib.construct_graph(chart);
	
	// used for scatter plot, creating the scatter sizes for s
	that.s = function(s) {
		var N = this._y.length || this._x.length;
		if (!(s instanceof Array)) {
			this._s = jsplotlib.ones(N).map(function(d) {
				return s * d;
			});
			this._s_was_set = false;
		} else {
			this._s = s;
			this._s_was_set = true;
		}
		return this;
	};
	
	that.color_style = function(cs) {
		this._color_style = cs;
		return this;
	};
	
	that.alpha = function(a) {
		this._alpha = a;
		return this;
	};
	
	/* supports butt, round, projecting*/
	that.dash_capstyle = function(dcs) {
		this._dash_capstyle = dcs;
		return this;
	};
	
	/* supports butt, round, projecting*/
	that.solid_capstyle = function(scs) {
		this._solid_capstyle = scs;
		return this;
	};

	/* supports miter, round, bevel' */
	that.solid_jointyle = function(sjs) {
		this._solid_joinstyle = sjs;
		return this;
	};
	
	/* supports miter, round, bevel' */
	that.dash_joinstyle = function(djs) {
		this._dash_joinstyle = djs;
		return this;
	};
	
	/* random float */
	that.marker_size = function(ms) {
		this._marker_size = ms;
		return this;
	};
	
	that.marker_style = function(ms) {
		this._marker_style = ms;
		return this;
	};
	
	that.line_style = function(ls) {
		this._line_style = ls;
		return this;
	};
	
	that.line_width = function(lw) {
		this._line_width = lw;
		return this;
	};
	
	that.draw = function() {
	this._init_common();
	var s_was_set = true;
	var N = this._y.length || this._x.length;
	if (this._line_style === undefined) {
		this._line_style = "-";
	}
	
	// set defaults for all attributes
	if(this._marker_size === undefined) {
		this._marker_size = 2;
	}
	
	if(this._line_width === undefined) {
		this._line_width = 2;
	}
	
	if(this._dash_capstyle === undefined) {
		this._dash_capstyle = "butt";
	}
	
	if(this._solid_capstyle === undefined) {
		this._solid_capstyle = "butt";
	}
	
	if(this._solid_joinstyle === undefined) {
		this._solid_joinstyle = "miter";
	}
	
	if(this._dash_joinstyle === undefined) {
		this._dash_joinstyle = "miter";
	}
	
	if(this._alpha === undefined) {
		this._alpha = 1;
	}
	
	if (!this._x) {
		this.xrange(1, N, N);
	}
	if (!this._s) {
		var siz;
		if (!this._marker_style || this._marker_style === ".") {
			siz = 0;
		} else {
			siz = 5;
		}
		this.s(siz);
	}
	var x = this._x;
	var s = this._s;
	var y = this._y;
	var xys = d3.zip(x, y, s);
	var pairs = d3.zip(xys.slice(0, -1), xys.slice(1));
	var xscale = this.get_xscale();
	var yscale = this.get_yscale();
	var xformat = this._xaxis._formatter || function(x) {
		return x;
	};
	var yformat = this._yaxis._formatter || function(x) {
		return x;
	};
	this._line_containers = chart.selectAll("g.pplot_lines").data(pairs).enter().append("g").attr("class", "pplot_lines");
	  
	  // set appropriate line style
	  if (this._line_style === "-") {
		this._lines = this._line_containers.append("line")
		.attr("x1", function(d) {
			return xscale(d[0][0]);
		})
		.attr("x2", function(d) {
			return xscale(d[1][0]);
		})
		.attr("y1", function(d) {
			return yscale(d[0][1]);
		})
		.attr("y2", function(d) {
			return yscale(d[1][1]);
		})
		.style("stroke", jsplotlib.color(this._color_style))
		.style("stroke-linecap", this._solid_capstyle)
		.style("stroke-linejoin", this._solid_joinstyle)
		.style("stroke-opacity", this._alpha)
		.style("stroke-width", this._line_width);
	  }
	  else if(this._line_style === "--")
	  {
		this._lines = this._line_containers.append("line")
		.attr("x1", function(d) {
			return xscale(d[0][0]);
		})
		.attr("x2", function(d) {
			return xscale(d[1][0]);
		})
		.attr("y1", function(d) {
			return yscale(d[0][1]);
		})
		.attr("y2", function(d) {
			return yscale(d[1][1]);
		})
		.style("stroke", jsplotlib.color(this._color_style))
		.style("stroke-width", this._line_width)
		.style("stroke-linecap", this._dash_capstyle)
		.style("stroke-linejoin", this._dash_joinstyle)
		.style("stroke-opacity", this._alpha)
		.style("stroke-dasharray", "5,5");
	  }
	  else if(this._line_style === ":")
	  {
		this._lines = this._line_containers.append("line")
		.attr("x1", function(d) {
			return xscale(d[0][0]);
		})
		.attr("x2", function(d) {
			return xscale(d[1][0]);
		})
		.attr("y1", function(d) {
			return yscale(d[0][1]);
		})
		.attr("y2", function(d) {
			return yscale(d[1][1]);
		})
		.style("stroke", jsplotlib.color(this._color_style))
		.style("stroke-width", this._line_width)
		.style("stroke-dasharray", "2,5")
		.style("stroke-linejoin", this._dash_joinstyle)
		.style("stroke-opacity", this._alpha)
		.style("stroke-linecap", "round");
	  }
	  else if(this._line_style === "-.")
	  {
		this._lines = this._line_containers.append("line")
		.attr("x1", function(d) {
			return xscale(d[0][0]);
		})
		.attr("x2", function(d) {
			return xscale(d[1][0]);
		})
		.attr("y1", function(d) {
			return yscale(d[0][1]);
		})
		.attr("y2", function(d) {
			return yscale(d[1][1]);
		})
		.style("stroke", jsplotlib.color(this._color_style))
		.style("stroke-width", this._line_width)
		.style("stroke-linecap", this._dash_capstyle)
		.style("stroke-linejoin", this._dash_joinstyle)
		.style("stroke-opacity", this._alpha)
		.style("stroke-dasharray", "5, 5, 2, 5");
	  }
	  
	  this._points = chart.selectAll("g.pplot_points").data(xys).enter().append("g").attr("x", function(d) {
		return d[0];
	  }).attr("y", function(d) {
		return d[1];
	  }).attr("s", function(d) {
		return d[2];
	  }).attr("class", "pplot_points");
	  var s_was_set = this._s_was_set;
	  $("#" + chart.attr("id") + " g.pplot_points").tipsy({
		gravity: "nw",
		html: true,
		title: function() {
		  var d = this.__data__;
		  var output = "(" + xformat(d[0]) + "," + yformat(d[1]) + ")";
		  if (s_was_set) {
			output += ": " + d[2];
		  }
		  return output;
		}
	  });
	  switch (this._marker_style) {
		case undefined:
		case ".":
		case "o":
			this._markers = this._points.append("circle").attr("cx", function(d) {
				return xscale(d[0]);
			}).attr("cy", function(d) {
				return yscale(d[1]);
			}).attr("r", function(d) {
				return d[2];
			});
			break;
		case "x":
			this._points.append("line").attr("x1", function(d) {
			  return xscale(d[0]) - d[2];
			}).attr("x2", function(d) {
			  return xscale(d[0]) + d[2];
			}).attr("y1", function(d) {
			  return yscale(d[1]) - d[2];
			}).attr("y2", function(d) {
			  return yscale(d[1]) + d[2];
			});
			this._points.append("line").attr("x1", function(d) {
			  return xscale(d[0]) + d[2];
			}).attr("x2", function(d) {
			  return xscale(d[0]) - d[2];
			}).attr("y1", function(d) {
			  return yscale(d[1]) - d[2];
			}).attr("y2", function(d) {
			  return yscale(d[1]) + d[2];
			});
			this._markers = this._points.selectAll("line")
			.style("stroke-opacity", this._alpha)
			.style("stroke-width", this._marker_size);
			break;
	  }
		var resize_function = function(resize_amount) {
			return function() {
				var marker = d3.select(this);
				if (marker.attr("r")) {
					marker.attr("r", marker.attr("r") * resize_amount);
				} else {
					true;
				}
			};
		};
		this._markers
		.style("stroke", jsplotlib.color(this._color_style))
		.style("stroke-opacity", this._alpha)
		.style("fill", jsplotlib.color(this._color_style))
		.on("mouseover", resize_function(1.25))
		.on("mouseout", resize_function(.8));
		this._draw_axes();
		return this;
	};
	return that;
};
jsplotlib.bar_graph = function(chart) 
{
	var that = jsplotlib.construct_graph(chart);
	that.series_labels = function(sl) {
	  this._series_labels = sl;
	  return this;
	};
	that.barwidth = function(bw) {
	  this._barwidth = bw;
	  return this;
	};
	that.draw = function() {
	  this._init_common();
	  var series_labels;
	  if (!this._series_labels) {
		series_labels = [];
		for (var i = 0; i < this._data.length; i++) {
		  series_labels.push("Series " + i);
		}
	  } else {
		series_labels = this._series_labels;
	  }
	  var yaxis_width = this._yaxis_width;
	  var myheight = this._height;
	  var mywidth = this._width;
	  var N = this._data[0].length;
	  var bar_width = this._width / N;
	  if (!this._x) {
		this.xrange(0, N - 1, N);
	  }
	  this._barwidth = this._barwidth || this._x[1] - this._x[0];
	  this._xaxis.set_bar_limits([ d3.min(this._x), d3.max(this._x), this._barwidth ]);
	  var x = this._x;
	  var bdl = this._data.map(function(bd) {
		var out = [];
		for (var i = 0; i < bd.length; i++) {
		  out.push({
			x: x[i],
			y: bd[i]
		  });
		}
		return out;
	  });
	  var stacked_data = d3.layout.stack()(bdl);
	  var maxy = d3.max(stacked_data, function(one_series) {
		return d3.max(one_series, function(stackdatum) {
		  return stackdatum.y + stackdatum.y0;
		});
	  });
	  this._ylimits([ 0, maxy ]);
	  var xscale = this.get_xscale();
	  var true_height = function(d) {
		return d.y / maxy * myheight;
	  };
	  var true_y = function(d) {
		return myheight - (d.y + d.y0) / maxy * myheight;
	  };
	  this._series = chart.selectAll("g.bar_graph_series").data(stacked_data).enter().append("g").style("stroke", "white").attr("series_label", function(d, i) {
		return series_labels[i];
	  }).attr("class", "bar_graph_series");
	  this._subbars = this._series.selectAll("g.subbar").data(function(d, i) {
		return d;
	  }).enter().append("g").attr("class", "subbar");
	  this._rects = this._subbars.append("rect").attr("width", bar_width).attr("x", function(d, i) {
		return xscale(d.x);
	  }).attr("y", this._height).attr("height", 0);
	  this._rects.transition().delay(function(d, i) {
		return i * 10;
	  }).attr("y", true_y).attr("height", true_height);
	  this._rects.on("mouseover", this.resize_function(1.15, "grow")).on("mouseout", this.resize_function(1.15, "shrink"));
	  var xformat = this._xaxis._formatter || function(x) {
		return x;
	  };
	  var yformat = this._yaxis._formatter || function(x) {
		return x;
	  };
	  $("#" + chart.attr("id") + "  rect").tipsy({
		gravity: "w",
		html: true,
		title: function() {
		  var d = this.__data__;
		  var output = "" + xformat(d.x) + ": " + yformat(d.y);
		  return output;
		}
	  });
	  this._draw_axes();
	  return this;
	};
	return that;
};

jsplotlib.linspace = function(min, max, N) 
{
	var newscale = d3.scale.linear().domain([ 1, N ]).range([ min, max ]);
	var data = [];
	for (var i = 1; i <= N; i++) {
		var output = newscale(i);
		if (min instanceof Date) {
			output = new Date(output);
		}
		data.push(output);
	}
	return data;
};

jsplotlib.range = function(N) {
	var l = [];
	for (var i = 0; i < N; i++) {
		l.push(i);
	}
	return l;
};

jsplotlib.ones = function(N) {
	var l = [];
	for (var i = 0; i < N; i++) {
		l.push(1);
	}
	return l;
};

jsplotlib.color = function(cs) {
	var colors =  { 
		'b': 'steelblue',
		'g': 'green',
		'r': 'red',
		'c': 'cyan',
		'm': 'magenta',
		'y': 'yellow',
		'k': 'black',
		'w': 'white'
	};
	
	return colors[cs] ?colors[cs] : colors['b'];
};

/* functions and parsing for linestyles, markers and colors */
jsplotlib.parse_linestyle = function(style, plot) 
{
	if(!style || !plot) return false;
	switch(style)
	{
		case '-': plot.line_style("-"); return true;
		case '--': plot.line_style("--"); return true;
		case '-.': plot.line_style("-."); return true;
		case ':': plot.line_style(":"); return true;
		case '': plot.line_style(""); return true;
		case ' ': plot.line_style(""); return true;
		default: return false;
	}
};

jsplotlib.parse_marker = function(style, plot) 
{
	if(!style || !plot) return false;
	switch(style)
	{
		case '.': plot.marker_style("x"); return true;
		case ',': plot.marker_style("x"); return true;
		case 'o': plot.marker_style("o"); return true;
		case 'v': plot.marker_style("v"); return true;
		case '^': plot.marker_style("x"); return true;
		case '<': plot.marker_style("x"); return true;
		case '>': plot.marker_style("x"); return true;
		case '1': plot.marker_style("x"); return true;
		case '2': plot.marker_style("x"); return true;
		case '3': plot.marker_style("x"); return true;
		case '4': plot.marker_style("x"); return true;
		case 's': plot.marker_style("x"); return true;
		case 'p': plot.marker_style("x"); return true;
		case '*': plot.marker_style("x"); return true;
		case 'h': plot.marker_style("x"); return true;
		case 'H': plot.marker_style("x"); return true;
		case '+': plot.marker_style("x"); return true;
		case 'x': plot.marker_style("x"); return true;
		case 'D': plot.marker_style("x"); return true;
		case 'd': plot.marker_style("x"); return true;
		case '|': plot.marker_style("x"); return true;
		case '_': plot.marker_style("x"); return true;
		default: return false;
	}
};

jsplotlib.parse_color = function(style, plot) 
{
	if(!style || !plot) return false;
	// unsupported at the moment
	switch(style)
	{
		case 'b': plot.color_style('b'); return true;
		case 'g': plot.color_style('g'); return true;
		case 'r': plot.color_style('r'); return true;
		case 'c': plot.color_style('c'); return true;
		case 'm': plot.color_style('m'); return true;
		case 'y': plot.color_style('y'); return true;
		case 'k': plot.color_style('k'); return true;
		case 'w': plot.color_style('w'); return true;
		default: return false;
	}
};

jsplotlib.parse_linecap = function(style, plot) 
{
	if(!style || !plot) return false;
	// unsupported at the moment
	switch(style)
	{
		case 'butt': plot.linecap_style('butt'); return true;
		case 'round': plot.linecap_style('round'); return true;
		case 'square': plot.linecap_style('square'); return true;
		default: return false;
	}
};

jsplotlib.parse_stylestring = function(str, plot)
{
	if(!str || !plot) return false;
	
	/*
	1. if length == 1, try to parse color, linestyle, marker
	2. if length == 2, try to parse linestyle (single)
	3. if failed try to parse color + linestyle, marker
	
	4. if length == 3+, try to parse color, linestyle, marker
	*/
	
	if(str.length === 1)
	{
		jsplotlib.parse_linestyle(str, plot);
		jsplotlib.parse_marker(str, plot);
		jsplotlib.parse_color(str, plot);
	}
	else if(str.length === 2)
	{
		if(!jsplotlib.parse_linestyle(str, plot))
		{
			// we have to split the string and see
			jsplotlib.parse_linestyle(str[0], plot);
			jsplotlib.parse_marker(str[0], plot);
			jsplotlib.parse_color(str[0], plot);
			jsplotlib.parse_linestyle(str[1], plot);
			jsplotlib.parse_marker(str[1], plot);
			jsplotlib.parse_color(str[1], plot);
		}
	} 
	else if (str.length === 3)
	{
		// multiple possible combinations
		// 1. color and 2 char linestyle
		// 2. marker and 2 char linestyle
		// 3. color, maker, linestyle
		// TODO: should change this to exit early, when found a style
		jsplotlib.parse_color(str[0], plot);
		jsplotlib.parse_marker(str[0], plot);
		jsplotlib.parse_marker(str[1], plot);
		jsplotlib.parse_marker(str[2], plot);
		jsplotlib.parse_linestyle(str[1], plot);
		jsplotlib.parse_linestyle(str[2], plot);
		jsplotlib.parse_linestyle(str.substr(1, 2), plot);
	}
	
	return true;
};



var $builtinmodule = function(name)
{
	
	var mod = {};
	var chart;
	var plot;
	var canvas;
	
	var create_chart = function()
	{
		/* test if Canvas ist available should be moved to create_chart function */
		if(Sk.canvas === undefined)
		{
			throw new Sk.builtin.NameError("Can not resolve drawing area. Sk.canvas is undefined!");
		}
		
		if(!chart)
		{
			$('#' + Sk.canvas).empty();
			chart = jsplotlib.make_chart(400, 400, "#" + Sk.canvas);
		}
	};
	
	var plotk_f = function(kwa)
	{
		debugger;
		Sk.builtin.pyCheckArgs("plotk", arguments, 1, Infinity, true, false);
		args = Array.prototype.slice.call(arguments, 1);
		kwargs = new Sk.builtins['dict'](kwa); // is pretty useless for handling kwargs
		kwargs = Sk.ffi.remapToJs(kwargs);
		
		// try parsing plot args
		// possible xdata, ydata, stylestring
		// or x1, y1, stylestring1, x2, y2, stylestring2
		// or ydata, stylestring
		/*
			plot(x, y)        # plot x and y using default line style and color
			plot(x, y, 'bo')  # plot x and y using blue circle markers
			plot(y)           # plot y using x as index array 0..N-1
			plot(y, 'r+')     # ditto, but with red plusses
		*/
		
		// variable definitions for args
		var xdata = [];
		var ydata = [];
		var stylestring = []; // we support only one at the moment
		var i = 0;
		var lines = 0;
		var xdata_not_ydata_flag = true;
		
		for(i = 0; i < args.length; i++)
		{
			if(args[i] instanceof Sk.builtin.list)
			{
				// unwraps x and y, but no 2-dim-data
				if(xdata_not_ydata_flag)
				{
					xdata.push(Sk.ffi.remapToJs(args[i]));
					xdata_not_ydata_flag = false;
				}
				else
				{
					ydata.push(Sk.ffi.remapToJs(args[i]));
					xdata_not_ydata_flag = true;
				}
			}
			else if(Sk.builtin.checkString(args[i]))
			{
				stylestring.push(Sk.ffi.remapToJs(args[i]));
			}
			else
			{
				throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[i]) + "' is not supported for *args[" + i + "].");
			}
		}
		
		/* handle special cases
			only supplied y
			only supplied 1 array and stylestring
		*/
		if((args.length === 1) || (args.length === 2 && (xdata.length > 0 && ydata.length === 0)))
		{
			// only y supplied
			xdata.forEach(function(element) {
				ydata.push(element);
			});
			xdata = [];
		}
		
		// empty canvas from previous plots
		create_chart();
		// create new plot instance, should be replaced with Line2D and then added to the plot
		plot = jsplotlib.pplot(chart);
		
		// parse kwargs
		var linestyle = kwargs['linestyle'];
		var marker = kwargs['marker'];
		var xdata = kwargs['xdata'] || xdata;
		var ydata = kwargs['ydata'] || ydata;
		var color = kwargs['color'];
		var axes = kwargs['axes'];
		var markersize = kwargs['markersize'];
		var linewidth = kwargs['linewidth'];
		var solid_capstyle = kwargs['solid_capstyle'];
		var dash_capstyle = kwargs['dash_capstyle'];
		var solid_joinstyle = kwargs['soild_joinstyle'];
		var dash_joinstyle = kwargs['dash_joinstyle'];
		var alpha = kwargs['alpha'];
		
		/* try to set the kwargs */
		if(xdata)
		{
			if(xdata[0] && xdata[0].length)
				plot.x(xdata[0]);
			else
				plot.x(Sk.ffi.remapToJs(xdata));
		}
		
		if(ydata)
		{
			if(ydata[0] && ydata[0].length)
				plot.y(ydata[0]);
			else
				plot.y(Sk.ffi.remapToJs(ydata));
		}

		// parse the 1st stylestring, we support only 1
		// with Line2D impl, we can support multiple
		if(stylestring.length > 0 )
		{
			jsplotlib.parse_stylestring(stylestring[0], plot)
		}
	
		/* set various possible attributes */
		if(markersize)
			plot.marker_size(Sk.ffi.remapToJs(markersize));
		
		if(linewidth)
			plot.line_width(Sk.ffi.remapToJs(linewidth));
		
		if(solid_capstyle)
			plot.solid_capstyle(Sk.ffi.remapToJs(solid_capstyle));

		if(dash_capstyle)
			plot.dash_capstyle(dash_capstyle);
		
		if(solid_joinstyle)
			plot.solid_joinstyle(Sk.ffi.remapToJs(solid_joinstyle));

		if(dash_joinstyle)
			plot.dash_joinstyle(Sk.ffi.remapToJs(dash_joinstyle));		
		
		if(alpha)
			plot.alpha(Sk.ffi.remapToJs(alpha));
		
		
		// result
		var result = [];
		result.push(Sk.ffi.remapToPy(xdata));
		result.push(Sk.ffi.remapToPy(ydata));
		result.push(Sk.ffi.remapToPy(stylestring));
		
		return new Sk.builtins['tuple'](result);
	};
	plotk_f['co_kwargs'] = true;
	mod.plotk = new Sk.builtin.func(plotk_f);
	
	/****************************************************/
	/*** Simple d3 based plot function implementation ***/
	/*** http://matplotlib.org/api/pyplot_api.html#matplotlib.pyplot.plot ***/
	/****************************************************/
	var plot_f = function(xdata, ydata, stylestring, color, linestyle, linewidth, marker, label, axes, markersize, solid_capstyle, dash_capstyle, dash_joinstyle, solid_joinstyle, alpha)
	{
		// empty canvas from previous plots
		create_chart();
		
		Sk.builtin.pyCheckArgs("plot", arguments, 2, 16);
		// parse inputs
		if(arguments.length > 14)
		{
			throw new Sk.builtin.NotImplementedError("Currently only xdata, ydata, linestyle and label are supported.");
		}
		
		// unwrapped attrs
		var linestyle_unwrap = null;
		var marker_unwrap = null;
		var xdata_unwrap = null;
		var ydata_unwrap = null;
		var stylestring_unwrap = null;
		var color_unwrap = null;
		var axes_unwrap = null;
		var markersize_unwrap = null;
		var linewidth_unwrap = null;
		var solid_capstyle_unwrap = null;
		var dash_capstyle_unwrap = null;
		var solid_joinstyle_unwrap = null;
		var dash_joinstyle_unwrap = null;
		var alpha_unwrap = null;
		
		if(!(xdata instanceof Sk.builtin.list) && !Sk.builtin.checkNumber(xdata))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(xdata) + "' is not supported for xdata.");
		}
		
		if(ydata && (!(ydata instanceof Sk.builtin.list) && !Sk.builtin.checkNumber(ydata)))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(ydata) + "' is not supported for ydata.");
		}
		
		if(label && (!(label instanceof Sk.builtin.list) && !Sk.builtin.checkString(label)))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(label) + "' is not supported for label.");
		}
		
		if(linestyle && !Sk.builtin.checkString(linestyle))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(linestyle) + "' is not supported for linestyle.");
		}
		
		if(marker && !Sk.builtin.checkString(marker))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(marker) + "' is not supported for marker.");
		}
		
		if(axes && (!(axes instanceof Sk.builtin.list) && !Sk.builtin.checkString(axes)))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(axes) + "' is not supported for axes.");
		}
		
		if(color && !Sk.builtin.checkString(color))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(color) + "' is not supported for color.");
		}
		
		if(dash_capstyle && !Sk.builtin.checkString(dash_capstyle))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dash_capstyle) + "' is not supported for dash_capstyle.");
		}
		
		if(solid_capstyle && !Sk.builtin.checkString(solid_capstyle))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(solid_capstyle) + "' is not supported for solid_capstyle.");
		}
		
		if(solid_joinstyle && !Sk.builtin.checkString(solid_joinstyle))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(solid_joinstyle) + "' is not supported for solid_joinstyle.");
		}

		if(dash_joinstyle && !Sk.builtin.checkString(dash_joinstyle))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dash_joinstyle) + "' is not supported for dash_joinstyle.");
		}
		
		if(linewidth && !Sk.builtin.checkNumber(linewidth))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(linewidth) + "' is not supported for linewidth.");
		}
		
		if(markersize && !Sk.builtin.checkNumber(markersize))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(markersize) + "' is not supported for markersize.");
		}
		
		if(alpha && !Sk.builtin.checkNumber(alpha))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(alpha) + "' is not supported for alpha.");
		}
		
		// remapToJs all attributes if possible
		if(xdata)
		{
			xdata_unwrap = Sk.ffi.remapToJs(xdata);
			if(!xdata_unwrap.length)
				xdata_unwrap = [xdata_unwrap];
		}
		
		if(ydata)
			ydata_unwrap = Sk.ffi.remapToJs(ydata);
			if(!ydata_unwrap.length)
				ydata_unwrap = [ydata_unwrap];
		
		if(label)
			label_unwrap = Sk.ffi.remapToJs(label);
		
		if(linestyle)
			linestyle_unwrap = Sk.ffi.remapToJs(linestyle);
		
		if(marker)
			marker_unwrap = Sk.ffi.remapToJs(marker);
		
		if(stylestring)
			stylestring_unwrap = Sk.ffi.remapToJs(stylestring);
	
		if(color)
			color_unwrap = Sk.ffi.remapToJs(color);
		
		if(linewidth)
			linewidth_unwrap = Sk.ffi.remapToJs(linewidth);
		
		if(markersize)
			markersize_unwrap = Sk.ffi.remapToJs(markersize);

		if(solid_capstyle)
			solid_capstyle_unwrap = Sk.ffi.remapToJs(solid_capstyle);
		
		if(dash_capstyle)
			dash_capstyle_unwrap = Sk.ffi.remapToJs(dash_capstyle);

		if(solid_joinstyle)
			solid_joinstyle_unwrap = Sk.ffi.remapToJs(solid_joinstyle);
		
		if(dash_joinstyle)
			dash_joinstyle_unwrap = Sk.ffi.remapToJs(dash_joinstyle);
		
		if(alpha)
			alpha_unwrap = Sk.ffi.remapToJs(alpha);
		
		/* start plotting here */
		
		// create chart
		plot = jsplotlib.pplot(chart);
		
		if(xdata_unwrap)
		{
			plot.x(xdata_unwrap);
		}
		else
		{
			throw new Sk.builtin.ValueError("Malformed values for xdata.");
		}
		
		if(ydata_unwrap)
		{
			plot.y(ydata_unwrap);
		}
		else
		{
			throw new Sk.builtin.ValueError("Malformed values for ydata.");
		}
		
		/* set various possible attributes */
		
		if(markersize_unwrap)
			plot.marker_size(markersize_unwrap);
		
		if(linewidth_unwrap)
			plot.line_width(linewidth_unwrap);
		
		if(solid_capstyle_unwrap)
			plot.solid_capstyle(solid_capstyle_unwrap);

		if(dash_capstyle_unwrap)
			plot.dash_capstyle(dash_capstyle_unwrap);
		
		if(solid_joinstyle_unwrap)
			plot.solid_joinstyle(solid_joinstyle_unwrap);

		if(dash_joinstyle_unwrap)
			plot.dash_joinstyle(dash_joinstyle_unwrap);		
		
		if(alpha_unwrap)
			plot.alpha(alpha_unwrap);
		

		
		// try parsing the style string or linestyle, marker and color
		if(!stylestring_unwrap)
		{
			jsplotlib.parse_linestyle(linestyle_unwrap, plot);
			jsplotlib.parse_marker(marker_unwrap, plot);
			jsplotlib.parse_color(color_unwrap, plot);
		}
		else
		{
			/*
			1. if length == 1, try to parse color, linestyle, marker
			2. if length == 2, try to parse linestyle (single)
			3. if failed try to parse color + linestyle, marker
			
			4. if length == 3+, try to parse color, linestyle, marker
			*/
			
			if(stylestring_unwrap)
			{
				if(stylestring_unwrap.length === 1)
				{
					jsplotlib.parse_linestyle(stylestring_unwrap, plot);
					jsplotlib.parse_marker(stylestring_unwrap, plot);
					jsplotlib.parse_color(stylestring_unwrap, plot);
				}
				else if(stylestring_unwrap.length === 2)
				{
					if(!jsplotlib.parse_linestyle(stylestring_unwrap, plot))
					{
						// we have to split the string and see
						jsplotlib.parse_linestyle(stylestring_unwrap[0], plot);
						jsplotlib.parse_marker(stylestring_unwrap[0], plot);
						jsplotlib.parse_color(stylestring_unwrap[0], plot);
						jsplotlib.parse_linestyle(stylestring_unwrap[1], plot);
						jsplotlib.parse_marker(stylestring_unwrap[1], plot);
						jsplotlib.parse_color(stylestring_unwrap[1], plot);
					}
				} 
				else if (stylestring_unwrap.length === 3)
				{
					// multiple possible combinations
					// 1. color and 2 char linestyle
					// 2. marker and 2 char linestyle
					// 3. color, maker, linestyle
					jsplotlib.parse_color(stylestring_unwrap[0], plot);
					jsplotlib.parse_marker(stylestring_unwrap[0], plot);
					jsplotlib.parse_marker(stylestring_unwrap[1], plot);
					jsplotlib.parse_marker(stylestring_unwrap[2], plot);
					jsplotlib.parse_linestyle(stylestring_unwrap[1], plot);
					jsplotlib.parse_linestyle(stylestring_unwrap[2], plot);
					jsplotlib.parse_linestyle(stylestring_unwrap.substr(1, 2), plot);
				}
			}
		}	
	};

	plot_f.co_varnames = ['axes', 'color', 'fillstyle', 'label', 'linestyle', 'marker', 'xdata', 'ydata', 'markersize', 
							'linewidth', 'dash_capstyle', 'solid_capstyle', 'dash_joinstyle', 'solid_joinstyle', 'alpha'];
	plot_f.$defaults = [null,Sk.builtin.none.none$,Sk.builtin.none.none$,Sk.builtin.none.none$,Sk.builtin.none.none$, 
						Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$, 
						Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$,
						Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$];
	mod.plot = new Sk.builtin.func(plot_f);
	
	var show_f = function()
	{
		// call drawing routine
		if(plot && plot.draw)
		{
			plot.draw();
		}
		else
		{
			throw new Sk.builtin.ValueError("Can not call show without any plot created.");
		}
		
		$('#' + Sk.canvas).show();
	};
	mod.show = new Sk.builtin.func(show_f);
	
	var title_f = function(label, fontdict, loc)
	{
		Sk.builtin.pyCheckArgs("title", arguments, 1, 3);
		
		if(!Sk.builtin.checkString(label))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(label) + "' is not supported for title.");
		}
		
		var label_unwrap = Sk.ffi.remapToJs(label);
		
		if(plot && plot.title)
		{
			plot.title(label_unwrap);
		}
		
		return new Sk.builtin.str(label_unwrap);
	};
	
	title_f.co_varnames = ['label','fontdict','loc',];
	title_f.$defaults = [null,Sk.builtin.none.none$,Sk.builtin.none.none$, Sk.builtin.none.none$];
	mod.title = new Sk.builtin.func(title_f);
	
	var axis_f = function(label, fontdict, loc)
	{
		Sk.builtin.pyCheckArgs("axis", arguments, 0, 3);
		
		// when called without any arguments it should return the current axis limits
		
		if(plot && plot._axes)
		{
			console.log(plot._axes);
		}
		
		// >>> axis(v)
		// sets the min and max of the x and y axes, with
		// ``v = [xmin, xmax, ymin, ymax]``.::
		
		//The xmin, xmax, ymin, ymax tuple is returned
		var res;
		
		return Sk.ffi.remapToPy([]);
	};
	
	axis_f.co_varnames = ['label','fontdict','loc',];
	axis_f.$defaults = [null,Sk.builtin.none.none$,Sk.builtin.none.none$, Sk.builtin.none.none$];
	mod.axis = new Sk.builtin.func(axis_f);
	
	var xlabel_f = function(s, fontdict, loc)
	{
		Sk.builtin.pyCheckArgs("xlabel", arguments, 1, 3);
		
		if(!Sk.builtin.checkString(s))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) + "' is not supported for s.");
		}
		
		if(plot && plot.xlabel)
		{
			plot.xlabel(Sk.ffi.remapToJs(s));
		}
	};
	
	xlabel_f.co_varnames = ['s','fontdict','loc',];
	xlabel_f.$defaults = [null,Sk.builtin.none.none$,Sk.builtin.none.none$, Sk.builtin.none.none$];
	mod.xlabel = new Sk.builtin.func(xlabel_f);
	
	var ylabel_f = function(s, fontdict, loc)
	{
		Sk.builtin.pyCheckArgs("ylabel", arguments, 1, 3);
		
		if(!Sk.builtin.checkString(s))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) + "' is not supported for s.");
		}
		
		if(plot && plot.ylabel)
		{
			plot.ylabel(Sk.ffi.remapToJs(s));
		}
	};
	
	ylabel_f.co_varnames = ['s','fontdict','loc',];
	ylabel_f.$defaults = [null,Sk.builtin.none.none$,Sk.builtin.none.none$, Sk.builtin.none.none$];
	mod.ylabel = new Sk.builtin.func(ylabel_f);
	
	// Clear the current figure
	var clf_f = function()
	{
		// clear all
		chart = null;
		plot = null;
		
		if(Sk.canvas !== undefined)
		{
			$('#' + Sk.canvas).empty();
		}
	};
	
	mod.clf = new Sk.builtin.func(clf_f);
	
	var imshow_f = function(X, cmap)
	{
		// empty canvas from previous plots
		create_chart();
		
		if(!(X instanceof Sk.builtin.list))
		{
			throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(X) + "' is not supported for X.");
		}
		
		plot = jsplotlib.imshow(chart);
        plot.data(Sk.ffi.remapToJs(X));
        plot.colormap_jet(); // the standard matlab colormap
	};
	
	imshow_f.co_varnames = ['X','cmap'];
	imshow_f.$defaults = [null,Sk.builtin.none.none$,Sk.builtin.none.none$];
	mod.imshow = new Sk.builtin.func(imshow_f);
	
	/* list of not implemented methods */
	mod.findobj = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("findobj is not yet implemented")});
	mod.switch_backend = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("switch_backend is not yet implemented")});
	mod.isinteractive = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("isinteractive is not yet implemented")});
	mod.ioff = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ioff is not yet implemented")});
	mod.ion = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ion is not yet implemented")});
	mod.pause = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("pause is not yet implemented")});
	mod.rc = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("rc is not yet implemented")});
	mod.rc_context = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("rc_context is not yet implemented")});
	mod.rcdefaults = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("rcdefaults is not yet implemented")});
	mod.gci = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("gci is not yet implemented")});
	mod.sci = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("sci is not yet implemented")});
	mod.xkcd = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("xkcd is not yet implemented")});
	mod.figure = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("figure is not yet implemented")});
	mod.gcf = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("gcf is not yet implemented")});
	mod.get_fignums = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("get_fignums is not yet implemented")});
	mod.get_figlabels = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("get_figlabels is not yet implemented")});
	mod.get_current_fig_manager = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("get_current_fig_manager is not yet implemented")});
	mod.connect = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("connect is not yet implemented")});
	mod.disconnect = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("disconnect is not yet implemented")});
	mod.close = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("close is not yet implemented")});
	mod.savefig = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("savefig is not yet implemented")});
	mod.ginput = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ginput is not yet implemented")});
	mod.waitforbuttonpress = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("waitforbuttonpress is not yet implemented")});
	mod.figtext = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("figtext is not yet implemented")});
	mod.suptitle = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("suptitle is not yet implemented")});
	mod.figimage = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("figimage is not yet implemented")});
	mod.figlegend = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("figlegend is not yet implemented")});
	mod.hold = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hold is not yet implemented")});
	mod.ishold = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ishold is not yet implemented")});
	mod.over = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("over is not yet implemented")});
	mod.delaxes = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("delaxes is not yet implemented")});
	mod.sca = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("sca is not yet implemented")});
	mod.gca = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("gca is not yet implemented")});
	mod.subplot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("subplot is not yet implemented")});
	mod.subplots = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("subplots is not yet implemented")});
	mod.subplot2grid = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("subplot2grid is not yet implemented")});
	mod.twinx = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("twinx is not yet implemented")});
	mod.twiny = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("twiny is not yet implemented")});
	mod.subplots_adjust = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("subplots_adjust is not yet implemented")});
	mod.subplot_tool = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("subplot_tool is not yet implemented")});
	mod.tight_layout = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("tight_layout is not yet implemented")});
	mod.box = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("box is not yet implemented")});
	mod.xlim = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("xlim is not yet implemented")});
	mod.ylim = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ylim is not yet implemented")});
	mod.xscale = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("xscale is not yet implemented")});
	mod.yscale = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("yscale is not yet implemented")});
	mod.xticks = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("xticks is not yet implemented")});
	mod.yticks = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("yticks is not yet implemented")});
	mod.minorticks_on = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("minorticks_on is not yet implemented")});
	mod.minorticks_off = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("minorticks_off is not yet implemented")});
	mod.rgrids = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("rgrids is not yet implemented")});
	mod.thetagrids = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("thetagrids is not yet implemented")});
	mod.plotting = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("plotting is not yet implemented")});
	mod.get_plot_commands = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("get_plot_commands is not yet implemented")});
	mod.colors = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("colors is not yet implemented")});
	mod.colormaps = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("colormaps is not yet implemented")});
	mod._setup_pyplot_info_docstrings = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("_setup_pyplot_info_docstrings is not yet implemented")});
	mod.colorbar = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("colorbar is not yet implemented")});
	mod.clim = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("clim is not yet implemented")});
	mod.set_cmap = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("set_cmap is not yet implemented")});
	mod.imread = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("imread is not yet implemented")});
	mod.imsave = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("imsave is not yet implemented")});
	mod.matshow = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("matshow is not yet implemented")});
	mod.polar = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("polar is not yet implemented")});
	mod.plotfile = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("plotfile is not yet implemented")});
	mod._autogen_docstring = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("_autogen_docstring is not yet implemented")});
	mod.acorr = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("acorr is not yet implemented")});
	mod.arrow = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("arrow is not yet implemented")});
	mod.axhline = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("axhline is not yet implemented")});
	mod.axhspan = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("axhspan is not yet implemented")});
	mod.axvline = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("axvline is not yet implemented")});
	mod.axvspan = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("axvspan is not yet implemented")});
	mod.bar = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("bar is not yet implemented")});
	mod.barh = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("barh is not yet implemented")});
	mod.broken_barh = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("broken_barh is not yet implemented")});
	mod.boxplot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("boxplot is not yet implemented")});
	mod.cohere = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("cohere is not yet implemented")});
	mod.clabel = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("clabel is not yet implemented")});
	mod.contour = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("contour is not yet implemented")});
	mod.contourf = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("contourf is not yet implemented")});
	mod.csd = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("csd is not yet implemented")});
	mod.errorbar = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("errorbar is not yet implemented")});
	mod.eventplot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("eventplot is not yet implemented")});
	mod.fill = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("fill is not yet implemented")});
	mod.fill_between = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("fill_between is not yet implemented")});
	mod.fill_betweenx = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("fill_betweenx is not yet implemented")});
	mod.hexbin = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hexbin is not yet implemented")});
	mod.hist = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hist is not yet implemented")});
	mod.hist2d = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hist2d is not yet implemented")});
	mod.hlines = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hlines is not yet implemented")});
	mod.loglog = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("loglog is not yet implemented")});
	mod.magnitude_spectrum = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("magnitude_spectrum is not yet implemented")});
	mod.pcolor = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("pcolor is not yet implemented")});
	mod.pcolormesh = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("pcolormesh is not yet implemented")});
	mod.phase_spectrum = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("phase_spectrum is not yet implemented")});
	mod.pie = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("pie is not yet implemented")});
	mod.plot_date = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("plot_date is not yet implemented")});
	mod.psd = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("psd is not yet implemented")});
	mod.quiver = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("quiver is not yet implemented")});
	mod.quiverkey = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("quiverkey is not yet implemented")});
	mod.scatter = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("scatter is not yet implemented")});
	mod.semilogx = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("semilogx is not yet implemented")});
	mod.semilogy = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("semilogy is not yet implemented")});
	mod.specgram = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("specgram is not yet implemented")});
	mod.stackplot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("stackplot is not yet implemented")});
	mod.stem = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("stem is not yet implemented")});
	mod.step = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("step is not yet implemented")});
	mod.streamplot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("streamplot is not yet implemented")});
	mod.tricontour = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("tricontour is not yet implemented")});
	mod.tricontourf = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("tricontourf is not yet implemented")});
	mod.tripcolor = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("tripcolor is not yet implemented")});
	mod.triplot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("triplot is not yet implemented")});
	mod.vlines = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("vlines is not yet implemented")});
	mod.xcorr = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("xcorr is not yet implemented")});
	mod.barbs = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("barbs is not yet implemented")});
	mod.cla = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("cla is not yet implemented")});
	mod.grid = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("grid is not yet implemented")});
	mod.legend = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("legend is not yet implemented")});
	mod.table = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("table is not yet implemented")});
	mod.text = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("text is not yet implemented")});
	mod.annotate = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("annotate is not yet implemented")});
	mod.ticklabel_format = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("ticklabel_format is not yet implemented")});
	mod.locator_params = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("locator_params is not yet implemented")});
	mod.tick_params = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("tick_params is not yet implemented")});
	mod.margins = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("margins is not yet implemented")});
	mod.autoscale = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("autoscale is not yet implemented")});
	mod.autumn = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("autumn is not yet implemented")});
	mod.cool = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("cool is not yet implemented")});
	mod.copper = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("copper is not yet implemented")});
	mod.flag = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("flag is not yet implemented")});
	mod.gray = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("gray is not yet implemented")});
	mod.hot = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hot is not yet implemented")});
	mod.hsv = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("hsv is not yet implemented")});
	mod.jet = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("jet is not yet implemented")});
	mod.pink = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("pink is not yet implemented")});
	mod.prism = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("prism is not yet implemented")});
	mod.spring = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("spring is not yet implemented")});
	mod.summer = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("summer is not yet implemented")});
	mod.winter = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("winter is not yet implemented")});
	mod.spectral = new Sk.builtin.func(function(){ throw new Sk.builtin.NotImplementedError("spectral is not yet implemented")});
	
	return mod;
};