window.process = {
    cwd: function() {}
}

define('fs', {})
define('path', {})
define('http', {})
define('https', {})
define('url', {})

define('ckstyle/ckservice', function(require, exports, module) {
    var styler = require('./ckstyler');
    var CssChecker = styler.CssChecker;

    exports.doCompress = function(css) {
        var checker = new CssChecker(css);
        checker.prepare()
        return checker.doCompress();
    }

    exports.doFix = function(css) {
        var checker = new CssChecker(css)
        checker.prepare();
        return checker.doFix()
    }

    exports.doFormat = function(css) {
        var checker = new CssChecker(css)
        checker.prepare();
        return checker.doFormat()
    }
})

seajs.use('ckstyle/ckservice', function(service) {
	window.service = service
})

define('clean-css/go', function(require, exports) {
    var CleanCSS = require('./lib/clean')

    exports.compress = function(code) {
    	return new CleanCSS({
    		compatibility: 'ie7'
    	}).minify(code)
    }
});

seajs.use('clean-css/go', function(A) {
    window.CleanCSS = A
});

// extend jquery
$.errorMsg = function(msg, title) {
	var con = $('#error-msg-container');
	if (con.length == 0) {
		con = $('<div class="modal hide" id="error-msg-container">\
		  <div class="modal-header">\
		    <h3 style="font-size:16px;" class="title"></h3>\
		  </div>\
		  <div class="modal-body">\
		    <p class="msg"></p>\
		  </div>\
		  <div class="modal-footer">\
		    <a href="#" class="btn" data-dismiss="modal">Close</a>\
		  </div>\
		</div>').appendTo('body');
	}
	con.find('.msg').html(msg).end().find('.title').html(title || '对不起，貌似出了点小问题~~').end().modal('show');
};

$.hideErrorMsg = function() {
	$('#error-msg-container').modal('hide');
};


;;(function(global) {

	var RULES = [];

	define('ckstyle/init-home', function(require, exports, module) {
	    var styler = require('./ckstyler');
	    var CssChecker = styler.CssChecker;
	    var checker = new CssChecker('.a {width:100px}')
	    checker.prepare();
	    for(var prop in window) {
	    	if (prop.indexOf('FED') == 0) {
	    		var instance = new window[prop];
	    		//console.log(instance.id + ' | ' + instance.__doc__.summary + ' | ' + instance.errorLevel)
	    		RULES.push({
	    			id: instance.id,
	    			priority: instance.errorLevel,
	    			summary: instance.__doc__.summary,
	    			desc: instance.__doc__.desc,
	    			checked: instance.errorLevel == 0 || instance.errorLevel == 1
	    		})
	    	}
	    }
	})

	seajs.use('ckstyle/init-home', function(){})

	var CKSTYLE_RULES = {
		template:  
		'{{#rules}}<li>\
			<label class="checkbox option-{{priority}}" \
				data-content="{{desc}}" title="" \
				data-original-title="{{summary}}">\
				<input type="checkbox" id="{{id}}" name="{{id}}" {{#checked}}checked=checked{{/checked}}/>{{summary}}\
			</label>\
		</li>{{/rules}}',
		rules: RULES};

	rules = CKSTYLE_RULES.rules;
	rules.sort(function(e1, e2) {
		return e1.priority - e2.priority;
	});

	var i, rule, l, prioritys = ['error', 'warning', 'log'];
	
	for(i = 0, rule, l = rules.length; i < l; i ++) {
		rule = rules[i];
		rule.priority = prioritys[rule.priority] || 'log';
	}
	global.CKSTYLE_RULES = CKSTYLE_RULES;
})(this);

// init tooltip
$(function() {
	$('.fork-mask').tooltip({
		placement: 'left'
	});
	$('.guideline-tooltip').tooltip({
		placement: 'top'
	});
	$('.browsers-trigger').tooltip({
		placement: 'top'
	});
	$('.replace').tooltip({
		placement: 'top'
	});
});

var Editor;

// init editor
$(function() {
	var jqTextarea = $('#editor'),
		textarea = jqTextarea[0], top;
	Editor = CodeMirror.fromTextArea(textarea, {
		mode: 'css',
	    theme: 'default',
	    lineNumbers: true,
	    indentUnit: 4,
	    autofocus: true
	});
	Editor.on('change', function() {
		textarea.value = Editor.getValue();
	})
	Editor.setSelection({line: 100,ch: textarea.value.length}, {line: 100, ch: textarea.value.length});
	//jqTextarea.attr('placeholder', jqTextarea.val());
	// locate to error pos 
	top = $(textarea).next('.CodeMirror').position().top - 10;

	function focusToLine(selector) {
		var css = Editor.getValue(),
			reg = new RegExp('' + selector + '\\s*{'),
			matched = reg.exec(css);
		if (matched) {
			index = matched.index;
			lineNo = css.substring(0, index).split('\n').length - 1;
			Editor.setSelection({ line: lineNo, ch: 0 }, { line: lineNo, ch:100});
			scrollTo(0, top);
			Editor.scrollIntoView({line: lineNo, ch:0}, 90);
		} else {

		}
	}

	$('.check-result').delegate('li[data-pos]', 'click', function() {
		var pos = $(this).data('pos');
		if (!pos) {
			Editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: textarea.value.split('\n')[0].length });
		    scrollTo(0, top);
		    return;
		}
		focusToLine(pos);
	});


	var templates = {
		check: '{{#hasError}}<h4 class="text-error">{{totalError}} error{{#manyErrors}}s{{/manyErrors}}</h4>{{/hasError}}\
			      {{#hasError}}<ol>{{/hasError}}\
				  	  {{#errors}}<li class="text-error" data-pos="{{selector}}">{{errorMsg}}</li>{{/errors}}\
				  {{#hasError}}</ol>{{/hasError}}\
				  {{#hasWarning}}<hr style="margin:10px 0;">\
				  	  <h4 class="text-warning">{{totalWarning}} warning{{#manyWarnings}}s{{/manyWarnings}}</h4>{{/hasWarning}}\
				  {{#hasWarning}}<ol>{{/hasWarning}}\
				  	  {{#warnings}}<li class="text-warning" data-pos="{{selector}}">{{errorMsg}}</li>{{/warnings}}\
				  {{#hasWarning}}</ol>{{/hasWarning}}\
				  {{#hasLog}}<hr style="margin:10px 0;">\
				  	  <h4 class="muted">{{totalLog}} suggest{{#manyLogs}}s{{/manyLogs}}</h4>{{/hasLog}}\
				  {{#hasLog}}<ol>{{/hasLog}}\
				      {{#logs}}<li class="muted" data-pos="{{selector}}">{{errorMsg}}</li>{{/logs}}\
				  {{#hasLog}}</ol>{{/hasLog}}',
		check_noerror: '<p class="text-success mt10">CKStyle没有找到问题，赞CSS！</p>',
		fix: '<textarea class="compressed">{{fixed}}</textarea>',
		format: '<textarea class="compressed">{{formatted}}</textarea>',
		compress: '<h4>compress <span style="font-size:14px;">[节省字符: {{after}}/{{before}}=<span class="CK">{{rate}}</span>%]</span></h4>\
					  <textarea>{{compressed}}</textarea>',
		yui: '<h4>by CKStyle<span class="stumb"></span><span style="font-size:14px;">[节省字符: {{after1}}/{{before1}}=<span class="CK">{{rate1}}</span>%\
						{{#greater}}，比YUICompressor多节省 <span class="CK">{{delta}}</span>%] <span class="ml10">;-)</span> {{/greater}}\
						{{#equal}}，与YUICompressor<span class="ok">持平] :-o</span>{{/equal}}\
						{{#worse}}，比YUICompressor<span class="muted">还低</span>] :-( ，<a href="https://github.com/wangjeaf/CSSCheckStyle/issues/new" target="_blank">报bug去</a>{{/worse}}</span>\
						</h4>\
						<textarea>{{compressed}}</textarea>\
						<hr style="margin:10px 0;">\
					    <h4>by YUICompressor <span style="font-size:14px;">[节省字符: {{after2}}/{{before2}}=<span class="CK">{{rate2}}</span>%]</span></h4>\
					    <textarea>{{yuimin}}</textarea>\
					    <hr style="margin:10px 0;">\
					    <div id="highchart-container-YUICompressor" style="width: 600px; height: 300px; margin: 0 auto;box-shadow: 1px 1px 2px #ccc;"></div>',
		cleancss: '<h4>by CKStyle<span class="stumb"></span><span style="font-size:14px;">[节省字符: {{after1}}/{{before1}}=<span class="CK">{{rate1}}</span>%\
						{{#greater}}，比clean-css多节省 <span class="CK">{{delta}}</span>%] <span class="ml10">;-)</span> {{/greater}}\
						{{#equal}}，与clean-css<span class="ok">持平] :-o</span>{{/equal}}\
						{{#worse}}，比clean-css<span class="muted">还低</span>] :-( ，<a href="https://github.com/wangjeaf/CSSCheckStyle/issues/new" target="_blank">报bug去</a>{{/worse}}</span>\
						</h4>\
						<textarea>{{compressed}}</textarea>\
						<hr style="margin:10px 0;">\
					    <h4>by clean-css <span class="stumb" style="margin-left:57px;"></span><span style="font-size:14px;">[节省字符: {{after2}}/{{before2}}=<span class="CK">{{rate2}}</span>%]</span></h4>\
					    <textarea>{{cleancss}}</textarea>\
					    <hr style="margin:10px 0;">\
					    <div id="highchart-container-cleancss" style="width: 600px; height: 300px; margin: 0 auto;box-shadow: 1px 1px 2px #ccc;"></div>',
		differ: '<div class="diff-con">\
					<div class="diff-viewer"></div>\
					<div class="diff-close">&times;</div>\
				</div>'
	};

	function improve(type, before, result) {
		if (type == 'check') {
			result = result.checkresult;
			if ((!result.errors || result.errors.length == 0) && 
				(!result.warnings || result.warnings.length == 0) && 
				(!result.logs || result.logs.length == 0)) {
				type = 'check_noerror';
			} else {
				if (result.errors && result.errors.length != 0) {
					result.hasError = true;
					result.totalError = result.errors.length;
					if (result.totalError > 1) {
						result.manyErrors = true;
					}
				}
				if (result.warnings && result.warnings.length != 0) {
					result.hasWarning = true;
					result.totalWarning = result.warnings.length;
					if (result.totalWarning > 1) {
						result.manyWarnings = true;
					}
				}
				if (result.logs && result.logs.length != 0) {
					result.hasLog = true;
					result.totalLog = result.logs.length;
					if (result.totalLog > 1) {
						result.manyLogs = true;
					}
				}
			}
		} else if (type == 'compress') {
			result.before = before.length;
			result.after = before.length - result.compressed.length;
			result.rate = (result.after / result.before * 100).toFixed(2);
		} else if (type == 'yui') {
			result.before1 = before.length;
			result.before2 = before.length;
			result.after1 = before.length - result.compressed.length;
			result.after2 = before.length - result.yuimin.length;
			result.rate1 = (result.after1 / result.before1 * 100).toFixed(2);
			result.rate2 = (result.after2 / result.before2 * 100).toFixed(2);
			result.delta = (result.rate1 - result.rate2).toFixed(2);
			result.greater = result.delta > 0;
			result.equal = result.delta == 0;
			result.worse = result.delta < 0;
		} else if (type == 'cleancss') {
			result.before1 = before.length;
			result.before2 = before.length;
			result.after1 = before.length - result.compressed.length;
			result.after2 = before.length - result.cleancss.length;
			result.rate1 = (result.after1 / result.before1 * 100).toFixed(2);
			result.rate2 = (result.after2 / result.before2 * 100).toFixed(2);
			result.delta = (result.rate1 - result.rate2).toFixed(2);
			result.greater = result.delta > 0;
			result.equal = result.delta == 0;
			result.worse = result.delta < 0;
		} else if (type == 'fix') {
			result.fixed = result.fixed.replace(/\\n/g, '\n');
		} else if (type == 'format') {
			result.formatted = result.formatted.replace(/\\n/g, '\n');
		}
		return Mustache.to_html(templates[type], result);
	}

	function makeMirror(textarea, cut) {
		var mirror = CodeMirror.fromTextArea(textarea, {
			mode: 'css',
		    theme: 'default',
		    lineNumbers: true,
		    indentUnit: 4,
		    readOnly: true
		});
		cut && $(textarea).next('.CodeMirror').css('height', '50px');
		return mirror;
	}

	function highChart(result, from) {
		$(function () {
	        $('#highchart-container-' + from).highcharts({
	            chart: {
	                type: 'column',
	                margin: [ 50, 50, 100, 80]
	            },
	            title: {
	                text: 'CKstyle和' + from + '压缩后字符数对比'
	            },
	            xAxis: {
	                categories: [
	                    'Raw',
	                    from,
	                    'CKStyle'
	                ],
	                labels: {
	                    align: 'center',
	                    style: {
	                        fontSize: '14px',
	                        fontFamily: '\'Microsoft Yahei\', serif, Verdana, sans-serif'
	                    }
	                }
	            },
	            yAxis: {
	                min: 0,
	                title: {
	                    text: '代码字符数'
	                }
	            },
	            legend: {
	                enabled: false
	            },
	            tooltip: {
	                formatter: function() {
	                    return '<b>'+ this.x +'</b><br/>'+
	                        '代码长度: '+ this.y +
	                        ' 字符';
	                }
	            },
	            series: [{
	                name: '代码字符数',
	                data: [result.before1, result.before1 - result.after2, result.before1 - result.after1],
	                dataLabels: {
	                    enabled: true,
	                    color: '#333',
	                    align: 'center',
	                    x: 4,
	                    y: -2,
	                    style: {
	                        fontSize: '13px',
	                        fontFamily: 'Verdana, sans-serif'
	                    }
	                }
	            }]
	        });
	    });
	}

	function diffUsingJS(base, newtxt, beforeText, afterText) {
		$('.diff-con').remove();
		var differ = $(templates.differ).hide();
		differ.find('.diff-viewer').css({
			'max-height': $(window).height() - 80
		})
		differ.appendTo('body').show('slow');
		$('.diff-con').delegate('.diff-close', 'click', function() {
			$('.diff-con').hide('slow', function() {
				$(this).remove();
			})
		})
		
        base = difflib.stringAsLines(base)
        newtxt = difflib.stringAsLines(newtxt)
        var sm = new difflib.SequenceMatcher(base, newtxt),
            opcodes = sm.get_opcodes(),
            diffoutputdiv = $('.diff-viewer')[0];

        diffoutputdiv.innerHTML = "";

        diffoutputdiv.appendChild(diffview.buildView({
            baseTextLines: base,
            newTextLines: newtxt,
            opcodes: opcodes,
            baseTextName: beforeText || "Before(Raw)",
            newTextName: afterText || "After(Precisely Fixed)",
            contextSize: 200,
            viewType: 0
        }));
    }

	// var prefix = document.location.href.toLowerCase().indexOf('fed.d.xiaonei.com') != -1 ? '/ckstyle' : '';
	function handleResponse(result, opType) {
		if (result.css) {
			Editor.setValue(result.css);
		}
		var resultContainer = $('.' + opType + '-result');
		if ($('.options-container').is(':visible')) {
			$('.options-trigger').trigger('click');
		}
		if ($('.tools-container').is(':visible')) {
			$('.tools-trigger').trigger('click');
		}
		//if ($('.browsers-container').is(':visible')) {
			//$('.browsers-trigger').trigger('click');
		//}
		$('.result-container .result').hide();
		resultContainer.find('.content').html(improve(opType, $('#editor').val(), result)).end().show();
		if (opType == 'check') {
			return;
		}

		resultContainer.find('.diff-btn').click(function() {
			var me = result.compressed
			var he = result.yuimin || result.cleancss
			setTimeout(function() {
                diffUsingJS(service.doFormat(me), service.doFormat(he), 'CKStyle compress', result.yuimin ? 'YUICompressor' : 'clean-css')
			}, 16);
		})


		var textareas = $('.' + opType + '-result').find('textarea');
		var mirror1 = makeMirror(textareas[0], opType == 'yui' || opType == 'cleancss');
		if (opType == 'yui') {
			var mirror2 = makeMirror(textareas[1], true);
			// you scroll, i scroll
			mirror1.on('scroll', function(e) {
				mirror2.scrollTo(e.getScrollInfo().left, 0);
			})
			highChart(result, 'YUICompressor');
		}

		if (opType == 'cleancss') {
			var mirror3 = makeMirror(textareas[1], true);
			// you scroll, i scroll
			mirror1.on('scroll', function(e) {
				mirror3.scrollTo(e.getScrollInfo().left, 0);
			})
			highChart(result, 'cleancss');
		}
	}

	function trim(str) {
		return str.replace('/^\s+|\s+$/g', '');
	}

	$('input[type=button]').click(function() {
		var jqThis = $(this),
			opType = jqThis.data('type'),
			scrollTop = $(window).scrollTop();
		if (trim(textarea.value) == '' || 
			jqTextarea.val() == jqTextarea.attr('placeholder')) {
			Editor.setSelection({line: 0,ch: 0}, {line: 100, ch: textarea.value.length});
			Editor.focus();
			return;
		}
		// $.errorMsg('<div><div class="progress progress-striped active"><div class="bar" style="width: 100%;font-size:14px;">正在处理中，请稍候~~</div></div></div>', 'CKStyling~~~');
		// $("html, body").animate({
		// 	scrollTop: 0
		// });

		var code = jqTextarea.val()
		var browsers = $('.browsers-hidden').val();
		var safe = $('#safeModeInput').val()

		var include = 'all'
		var collector = [];
		var options = $('.options input:checked');
		options.each(function(i, node) {
			collector.push($(node).attr('id'))
		})
		include = collector.join(',') || 'none'

		var top = $('.btns-container').position().top;
		$("html, body").animate({scrollTop: top - 5 - 80}, 500);

		seajs.use(['ckstyle/handle', 
			'ckstyle/browsers/Analyser',
			'ckstyle/command/args'], function(handler, analyser, args) {
    		var CommandArgs = args.CommandArgs
			var defaultConfig = new CommandArgs(opType)
			var browser = analyser.analyse(browsers)
			var browserValue
			for(var prop in browser) {
				browserValue = browser[prop]
			}
			browser = browserValue

			defaultConfig.include = include
			defaultConfig.safe = safe == "true"

			handleResponse({
				css: code,
				checkresult: opType == 'check' ? handler.check(code, defaultConfig) : '',
				yuimin: opType == 'yui' ? cssmin(code) : '',
				cleancss: opType == 'cleancss' ? CleanCSS.compress(code) : '',
				formatted: opType == 'format' ? service.doFormat(code) : '',
				compressed: (opType == 'compress' || opType == 'yui' || opType == 'cleancss' ? handler.compress(code, defaultConfig, browser) : ''),
				fixed: opType == 'fix' ? handler.fix(code, defaultConfig, browser) : ''
			}, opType);
		})
	});

	$('.result .close').click(function() {
		$(this).parents('.result').hide();
	});
});

define('ckstyle/handle', function(require, exports, module) {
    var styler = require('./ckstyler');
    var fill = require('./reporter/helper').fill;
    var CssChecker = styler.CssChecker;

    exports.check = function(css, config) {
    	var checker = new CssChecker(css, config);
	    checker.prepare()

	    checker.doCheck();
	    var result = checker.getErrors()
	    result[0].forEach(function(obj) {
	    	obj.errorMsg = fill(obj);
	    })
	    result[1].forEach(function(obj) {
	    	obj.errorMsg = fill(obj);
	    })
	    result[2].forEach(function(obj) {
	    	obj.errorMsg = fill(obj);
	    })
	    return {
	    	logs: result[0],
	    	warnings: result[1],
	    	errors: result[2]
	    };
    }

    exports.fix = function(css, config, browser) {
    	var checker = new CssChecker(css, config);
	    checker.prepare()

	    var fixed = checker.doFix(browser);
	    return (fixed);
    }

    exports.compress = function(css, config, browser) {
    	var checker = new CssChecker(css, config);
	    checker.prepare()

	    var compressed = checker.doCompress(browser);
	    return compressed;
    }
})

// init options
$(function() {
	var optionsContainer = $('.options-container'),
		toolsContainer = $('.tools-container'),
		browsersContainer = $('.browsers-container'),
		browserHidden = $('.browsers-hidden'),
		supportLocalStorage = Modernizr.localstorage,
		selectedOptions, options,
		i, current, l,
		storage = window.localStorage,
		exIds = ['select-all'],
		selectAll;

	$('.options-trigger').click(function() {
		optionsContainer.toggle();
		$(this).find('i').toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
	});

	$('.tools-trigger').click(function() {
		toolsContainer.toggle();
		$(this).find('i').toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
	});

	$('.browsers-trigger').click(function() {
		browsersContainer.toggle();
		$(this).find('i').toggleClass('glyphicon-chevron-down').toggleClass('glyphicon-chevron-up');
	});

	browsersContainer.find('button').click(function() {
		var jqThis = $(this);
		browsersContainer.find('i').hide();
		if (jqThis.find('i').length == 0) {
			$('<i class="glyphicon glyphicon-ok"></i>').appendTo(jqThis);
		}
		jqThis.find('i').show();
		browserHidden.val(jqThis.data('value'));
	});

	$(Mustache.to_html(CKSTYLE_RULES.template, {rules:CKSTYLE_RULES.rules})).appendTo('.options-container .options');

	options = $('.tools .checkbox, .options .checkbox');
	options.popover({
		trigger: 'hover',
		delay: 300,
		animate: true,
		html: true,
		placement: 'top'
	});

	selectAll = $('#select-all-wrapper');
	selectAll.click(function() {
		options.find('input').attr('checked', !!$(this).find('input').attr('checked'));
	});

	$('.safe-mode-btn').click(function() {
		$('#safeModeInput').val(!$(this).hasClass('active'));
		$(this).find('i').toggleClass('icon-remove').toggleClass('icon-ok');
	});
	// reset rules
	$('.reset-rules').click(function() {
		if ($('.options-container').is(':hidden')) {
			$('.options-trigger').trigger('click');
		}
		var top = $('.tools-container').position().top;
		$("html, body").animate({scrollTop: top + "px" }, 500);
		var rules = CKSTYLE_RULES.rules, i, l, rule, current;
		for(var i = 0, l = rules.length; i < l; i++) {
			rule = rules[i];
			current = $('#' + rule.id);
			if (!!current.attr('checked') != rule.checked) {
				current.attr('checked', rule.checked);
				blinkElement(current);
			} else {
				current.attr('checked', rule.checked);
			}
		}

		saveToLocalStorage();

		function blinkElement(current) {
			return current.parents('li')
				.animate({opacity: 0.1}, 400).animate({opacity: 1}, 100)
				.animate({opacity: 0.1}, 400).animate({opacity: 1}, 100)
				.animate({opacity: 0.1}, 400).animate({opacity: 1}, 100);
		}
	});

	function saveToLocalStorage() {
		var selects = [], counter = 0;
		options.each(function(i, ele) {
			var input = $(ele).find('input');
			if (exIds.indexOf(input.attr('id')) != -1) {
				return;
			}
			if (!!input.attr('checked')) {
				counter ++;
			}
		});
		selectAll.find('input').attr('checked', counter === options.length - 2);
		options.each(function(i, ele) {
			var input = $(ele).find('input');
			selects[selects.length] = {id:input.attr('id'), checked:!!input.attr('checked')};
		});
		window.localStorage.setItem('ckstyle-options', JSON.stringify(selects));
	}

	if (supportLocalStorage) {
		options.click(saveToLocalStorage);

		selectedOptions = window.localStorage.getItem('ckstyle-options');
		if (selectedOptions) {
			selectedOptions = JSON.parse(selectedOptions);
			for (i = 0, l = selectedOptions.length; i < l; i++) {
				current = selectedOptions[i];
				$('#' + current.id).attr('checked', current.checked);
			}
		}
	}
});

$(function() {
	var prefix = '', 
		supportHistory = !!window.history.pushState;

	if (window.location.href.indexOf('fed.d.xiaonei.com') != -1) {
		prefix = '/ckstyle/';
	}

	// support html5 history
	if (supportHistory) {
		if (!window.location.hash) {
			window.history.pushState({
				href: '#index'
			}, document.title, window.location.href);
		}
		window.addEventListener('popstate', function(e) {
			if (e.state) {
				handleHash(e.state.href);
			}
		});
	}

	function activeImg(element) {
		if (!element.data('inited')) {
			element.data('inited', true);
		}
		element.find('.img[data-src]').each(function(_, node) {
			var img = $(node);
			img.attr('src', prefix + img.data('src'));
			img.removeAttr('data-src');
		});
	}
	function handleHash(href) {
		items.removeClass('current');
		wrappers.hide();
		$(href).show();
		$('.menu a[href=' + href+']').addClass('current');
		var ele = $(window.location.hash)
		ele.show();
		activeImg(ele);
	}

	var wrappers = $('.wrapper'),
		items = $('a[href^=#]');
	items.click(function(e) {
		$(window).scrollTop(0,0)
		items.removeClass('current');
		e.preventDefault();
		wrappers.hide();
		var me = $(this);
		$('.menu [href^=' + me.attr('href')+ ']').addClass('current');
		var href = me.attr('href');
		if (supportHistory) {
			window.history.pushState({
				href: href
			}, document.title, window.location.href.split('#')[0] + href);
		}
		var ele = $(href);
		ele.show();
		activeImg(ele);
	});

	if (window.location.hash) {
		if (window.location.hash != '#index') {
			handleHash(window.location.hash);
		}
	}

	$('#features').delegate('.feature-arrow', 'click', function() {
		var me = $(this);
		if (me.hasClass('expanded')) {
			me.removeClass('expanded')
			me.parent().next().slideUp()
		} else {
			me.addClass('expanded')
			me.parent().next().slideDown()
		}
	})

	$('#features').delegate('.result .title', 'click', function() {
		var me = $(this);
		var arrow = me.find('.feature-arrow')
		if (arrow.hasClass('expanded')) {
			arrow.removeClass('expanded')
			arrow.parent().next().slideUp()
		} else {
			arrow.addClass('expanded')
			arrow.parent().next().slideDown()
		}
	})
});

$(function() {
	/*
	var slogans = [
		'CKStyle[1] —— CSS的解析、检查、美化、修复、压缩，本该一脉相承，不应相互独立。',
		'CKStyle[2] —— 沿着CSS的解析、检查、美化、修复、压缩之路前行，极致优化，让你的CSS更漂亮！',
		'CKStyle[3] —— 一款同时运行在 Nodejs 和 浏览器环境 的CSS解析、检查、美化、压缩工具。',
		'CKStyle[4] —— CSS的代码风格问题，只见规范，不见工具，CKStyle check就是为了弥补这一缺失。',
		'CKStyle[5] —— 不像Uglifyjs那样彻底的吃透JS，CSS压缩工具怎么能做到那么极致的压缩？'
	];
	$('.slogan').html(slogans[Math.floor(Math.random() * slogans.length)]).addClass('shown')
	*/
	var slogan = 'CKStyle — 一脉相承的CSS检查、美化、修复、压缩工具。';
	$('.slogan').html(slogan).addClass('shown')
})

$(function() {
	var cache = {};
	$('.editor-container').delegate('.demo-code', 'click', function() {
		var me = $(this)
		var url = me.data('file')
		if (cache[url]) {
			Editor.setValue(cache[url]);
			return;
		}
		$.get(url, function(code) {
			cache[url] = code;
			Editor.setValue(code);
		})
	})
})

