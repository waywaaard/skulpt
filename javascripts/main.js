var script = script || {};

// don't pollute the global namespace
$(function() {'use strict';

	script.init = function() {
		
		// iterates over all textareas that have the .pythoncm class and instantiates
		// a new coldmirror instance and binds the skulpt run events
		var codes = $('.pythoncm');
		$.each(codes, function(k, v) {
			new script.Code($(v));
		});

		// init side nav
		//script.affix();
	};

	/**
	 * Basic side navigation handling with bootstrap affix plugin. Automatically arranges the
	 * navigation margin and position for responive layouts.
	 *
	 */
	script.affix = function() {
		var $window = $(window);
		var $body = $(document.body);

		$body.scrollspy({
			target : '.bs-docs-sidebar',
			// offset: navHeight
		});

		$window.on('load', function() {
			$body.scrollspy('refresh');
		});

		// back to top
		setTimeout(function() {
			var $sideBar = $('.bs-docs-sidebar');

			$sideBar.affix({
				offset : {
					top : function() {
						var offsetTop = $sideBar.offset().top;
						var sideBarMargin = parseInt($sideBar.children(0).css('margin-top'), 10);
						var navOuterHeight = $('.script-nav').height();

						return (this.top = offsetTop - navOuterHeight - sideBarMargin);
					},
					bottom : function() {
						return (this.bottom = $('.script-footer').outerHeight(true));
					}
				}
			});
		}, 100);

		setTimeout(function() {
			$('.bs-top').affix();
		}, 100);
	};

	script.CodePiece = function(textarea) {
		this.textarea = textarea;
		this.name = textarea.attr('name');
		this.codeMirror = null;
		this.filename = textarea.attr('data-file-name') || "";

		this.create();

		this.codeMirror = CodeMirror.fromTextArea(textarea[0], {
			mode : "python",
			lineNumbers : true,
			matchBrackets : true,
			tabMode : "indent",
			indentUnit : 4,
			readonly : true,
		});
		
		var that = this;
		// reload python file from server and replace text in the editor
		$.get(this.filename, function(data, textstatus) {
			if(data)
			{
				that.codeMirror.setValue(data);
			}
			else
			{
				that.textarea.val("Fehler beim Laden der Daten: " + textstatus);			
			}
		}).fail(function() {
			that.textarea.val("Konnte Daten nicht laden - evtl. keine Internetverbindung vorhanden.");
		});
	};

	script.CodePiece.prototype.create = function() {
		var panel = $('<div class="panel panel-default panel-codepiece"></div>');

		// insert panel
		this.textarea.before(panel);

		// move textArea to form
		this.textarea.appendTo(panel);
	};

	/**
	 * Code class for placing executable code examples directly into
	 * the script. Relies on skulpt.js and codemirror. Does automatically
	 * bind the events and inserts a template for a panel with input and
	 * output.
	 *
	 * Each Panel recieves an "anchorable" id in the following format:
	 * 		a_[textarea_id]
	 *
	 * Use this to provide anchor links inside the document
	 *
	 * Use the data-attributes:
	 * 		- data-description: replaces the title of the panel
	 * 		- data-eval: indicates to prerun the code and show the output immediatelly
	 *
	 * @param {Object} textarea with given code
	 */
	script.Code = function(textarea) {
		this.textarea = textarea;
		this.name = textarea.attr('name');
		this.output = null;
		this.runButton = null;
		this.clearButton = null;
		this.resetButton = null;
		this.canvas = this.textarea.attr('data-canvas') || 'mycanvas';;
		this.anchor = "a_" + this.name;
		this.codeMirror = null;
		this.description = this.textarea.attr('data-description') || 'Code';
		this.prerun = this.textarea.attr('data-eval') || false;
		this.foldonline = textarea.attr('data-fold-line') || false;
		this.filename = textarea.attr('data-file-name') || "";
		this.imports = textarea.attr('data-imports') || "";
		this.static_url = textarea.attr('data-static-url') || "";
		
		// fetch imports
		this.parseImports(this.imports);

		// create textarea
		this.create();
		
		// create codemirror object
		this.codeMirror = CodeMirror.fromTextArea(textarea[0], {
			mode : "python",
			lineNumbers : true,
			matchBrackets : true,
			tabMode : "indent",
			indentUnit : 4,
			extraKeys : {
				"Ctrl-Space" : "autocomplete"
			},
			foldGutter : {
				rangeFinder : new CodeMirror.fold.combine(CodeMirror.fold.indent, CodeMirror.fold.comment)
			},
			gutters : ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		});
		
		// load src from server
		this.load();
		
		// bind btns to actions
		this.bind();
	};

	script.Code.prototype.create = function() {
		var panel = $('<div id="' + this.anchor + '" class="panel panel-default"></div>');
		var body = $('<div class="panel-body">');
		var footer = $('<div class="panel-footer">');
		
		if (!this.prerun) {
			footer.addClass("hidden-print");	
		}
		
		panel.append(body);
		panel.append(footer);

		var form = $('<form role="form"></form>');
		var formgroup = $('<div class="form-group"></div>');

		var label = $('<label>' + this.description + '</label>');
		label.attr('for', this.name);

		formgroup.append(label);
		form.append(formgroup);

		// Buttons
		this.runButton = $('<button class="btn btn-success btn-xs btn-run hidden-print" type="button">Run</button>');
		this.runButton.attr('name', this.name);
		this.runButton.attr('id', this.name + "RunBtn");

		this.clearButton = $('<button class="btn btn-danger btn-xs btn-clear hidden-print" type="button">Clear</button>');
		this.clearButton.attr('name', this.name);
		this.clearButton.attr('id', this.name + "ClearBtn");
		
		this.resetButton = $('<button class="btn btn-warning btn-xs hidden-print" type="button">Reset</button>');
		this.resetButton.attr('name', this.name);
		this.resetButton.attr('id', this.name + "ResetBtn");
		
		// label
		var nameLabelArray = this.filename.split('/');
		var nameLabelStr = nameLabelArray[nameLabelArray.length-1]; // get last part of the name --> should be the file
		var nameLabel = $('<label class="name-label pull-right"><small>' + nameLabelStr + '</small></label>');

		form.append(this.runButton);
		form.append(this.clearButton);
		form.append(this.resetButton);
		form.append(nameLabel);

		body.append(form);

		// create footer
		var footerForm = $('<form role="form"></form>');
		var footerFormgroup = $('<div class="form-group"></div>');
		var footerLabel = $('<label>Output</label>');
		footerLabel.attr('for', 'out' + this.name);
		this.output = $('<pre></pre>');
		this.output.attr('name', this.name);
		this.output.attr('id', 'out' + this.name);

		footerForm.append(footerFormgroup);
		footerFormgroup.append(footerLabel);
		footerFormgroup.append(this.output);

		footer.append(footerForm);
		// insert panel
		this.textarea.before(panel);

		// move textArea to form
		this.textarea.appendTo(formgroup);
	};

	script.Code.prototype.bind = function() {
		var that = this;
		this.runButton.on('click', $.proxy(that.run, that));
		this.clearButton.on('click', $.proxy(that.clear, that));
		this.resetButton.on('click', $.proxy(that.load, that));
	};
	
	script.Code.prototype.fold = function () {
		// check on boolean value and string from django template
		if (this.foldonline != false && this.foldonline != "False") {
			var lines = this.foldonline.split(',');
			var i;

			for ( i = 0; i < lines.length; i++) {
				try {
					var line = parseInt(lines[i]) - 1;
					// codemirror starts counting at 0
					this.codeMirror.foldCode(line);
				} catch(err)// cm would break otherwise complete script
				{
					console.log("Could not fold line, check line numbers again: " + this.filename + " | " + this.foldonline);
				}
			}
		}
	};
	
	script.Code.prototype.escape = function(string) {
		var entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;',
			" ": '&nbsp;'
		};
	
	    return String(string).replace(/[&<>"'\/]/g, function (s) {
	      return entityMap[s];
	    });

	};
	
	script.Code.prototype.run = function() {
		var that = this;
		var code = this.codeMirror.getValue();
		Sk.canvas = this.canvas;

		Sk.configure({
			output : function(text) {
				that.outf.call(that, text);
			},
			read : function(x) {
				return that.builtinRead.call(that, x);
			},
			python3 : true
		});
		try {
			eval(Sk.importMainWithBody("<stdin>", false, code));
		} catch (e) {
			this.output.append('<p class="text-danger">' + this.escape(e) + '</p>');
			console.log(e);
		}
	};

	/**
	 * Loads the python code file from the static server and sets 
	 * the content to the codemirror objects.
	 * 
	 * Checks if it should fold specific lines and if it should prerun 
	 * the code.
	 *  
	 */
	script.Code.prototype.load = function() {
		var that = this;
		// reload python file from server and replace text in the editor
		if(this.filename) {
			$.get(this.filename, function(data, textstatus) {
				if(data)
				{
					that.codeMirror.setValue(data);
					that.fold();
					
					// evaluates the code when the data-attribute data-eval is set.
					if (that.prerun.toString().toLowerCase() === "true")
						that.run();
				}
				else
				{
					that.outf("Fehler beim Laden der Daten: " + textstatus);			
				}
			}).fail(function() {
				that.outf("Konnte Daten nicht laden - evtl. keine Internetverbindung vorhanden.");
			});
		}
	};

	script.Code.prototype.parseImports = function(filenames_str) {
		var that = this;
		
		if(!filenames_str  || filenames_str.length == 0)
			return;
		
		var filenames = filenames_str.split(',');
		
		// return early
		if(!filenames)
			return;
		
		// trim possible whitespace
		filenames.map(Function.prototype.call, String.prototype.trim);
		
		// load all files and import them
		var i;
		for(i = 0; i < filenames.length; i++)
		{
			var data_tuple = filenames[i].split(':'); // imports are given via Name:file.py
			$.get(that.static_url + data_tuple[1], function(data, textstatus) {
				if(data)
				{
					that.addImport("src/lib/" + data_tuple[0] + ".py", data);
				}
				else
				{
					that.outf("Fehler beim Laden der Datei: " + filenames[i] + " - "  + textstatus);			
				}
			}).fail(function() {
				that.outf("Konnte Daten nicht laden - evtl. keine Internetverbindung vorhanden.");
			});
				
		}
	};

	script.Code.prototype.addImport = function(filename, file) {
		if(!filename && !file)
			throw "File or filename undefined: '" + file + "'";
			
		if (Sk.builtinFiles === undefined)
			throw "Could not access Sk.builtinFiles";
		
		if(Sk.builtinFiles["files"][filename]){
			console.log("Filename has been already imported: " + filename);
			return;
		}
		
		// add import to builtinFiles
		Sk.builtinFiles["files"][filename] = file;
	};

	script.Code.prototype.clear = function() {
		this.output.empty();
		var $canvas = $('#' + this.canvas);
		if($canvas) $canvas.empty();
	};

	script.Code.prototype.outf = function(text) {
		this.output.append('<span>' + this.escape(text) + '</span>');
	};

	script.Code.prototype.builtinRead = function builtinRead(x) {
		if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
			throw "File not found: '" + x + "'";
		return Sk.builtinFiles["files"][x];
	};
	
	// init code
	script.init();

});

