var $builtinmodule = function(name)
{
	
	var mod = {};
	
	/****************************************************/
	/*** Simple d3 based plot function implementation ***/
	/*** http://matplotlib.org/api/pyplot_api.html#matplotlib.pyplot.plot ***/
	/****************************************************/
	var plot_f = function(xdata, ydata, fillstyle, label)
	{
	
	};
	
	plot_f.co_varnames = ['agg_filter','alpha','animated','antialiased', 'axes', 
							'clip_box', 'clip_on', 'clip_path', 'color', 'contains',
							'dash_capstyle', 'dash_joinstyle', 'dashes', 'drawstyle',
							'figure', 'fillstyle', 'gid', 'label', 'linestyle',
							'linewidth', 'lod', 'marker', 'markeredgecolor', 'markeredgewidth',
							'markerfacecolor', 'markerfacecoloralt', 'makersize',
							'markevery', 'path_effects', 'picker', 'pickradius',
							'rasterized', 'sketch_params', 'snap', 'solid_capstyle',
							'solid_joinstyle', 'transform', 'url', 'visible', 'xdata',
							'ydata', 'zorder'];
	plot_f.$defaults = [null,Sk.builtin.none.none$,true,Sk.builtin.none.none$,false, 0];
	mod.plot = new Sk.builtin.func(plot_f);
	
	return mod;
};