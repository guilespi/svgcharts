(function(){
	var r;
	
    function setPaperAttributes(x, y, width, height, gutter, min, max, rtl){
    	var y_pos_zero, y_pos_ini, y_pos_fin, x_pos_ini, x_pos_fin, viewbox_width, 
    		viewbox_height, viewbox_x, viewbox_y, offset;
    	y_pos_ini = getYPosIni(y, gutter);
    	y_pos_zero = getYPosZero(y_pos_ini, height, gutter, min, max);
    	y_pos_fin = getYPosFin(y_pos_ini, height, gutter);
    	x_pos_ini = getXPosIni(x, gutter);
    	x_pos_fin = getXPosFin(x_pos_ini, width);
    	offset = 0;
        viewbox_width = x_pos_fin - x_pos_ini + 150 + offset;
        viewbox_height = y_pos_fin - y_pos_ini + 200;
        viewbox_x = x_pos_ini - 75 - offset;
        viewbox_y = y_pos_ini - 75;
        r.setViewBox(viewbox_x, viewbox_y, viewbox_width, viewbox_height);
        if(rtl){
            var direction = document.createAttribute('direction');
            direction.nodeValue = 'rtl';
            r.canvas.attributes.setNamedItem(direction);
        } else {
        	if(r.canvas.attributes.getNamedItem('direction')){
        		r.canvas.attributes.removeNamedItem('direction');	
        	}
        }
    }
    
	function drawLineChart(chart_title, chart_label, height, width, orientation, grid_lines_color,
    		lines_labels_position, lines_labels_color, background_color, label_background_color, 
    		label_text_color, fit_scale, show_scale, show_axis, show_gridlines, show_lines_labels, 
    		use_background_color, scale_intervals, show_groups_labels, show_groups_background, 
    		titles_font, show_legend, rtl, min_scale_value, max_scale_value, scale_auto, 
    		x_axis_on_zero, symbol_position, data){

    	var data_bundle = parseChartData(data);
    	if(!data_bundle || data_bundle.data.length == 0){
    		return false;
    	}
    	var chart_data = data_bundle.data;
    	var series_colors = data_bundle.colors;
    	var groups_names = data_bundle.groups;
    	var series_names = data_bundle.series;
    	var symbols = data_bundle.symbols;
    	var dot_types = data_bundle.dot_types;
    	
    	var x = 200, y = 50, gutter = 10;
    	width = parseInt(width); 
    	height = parseInt(height);
    	//set values for calculations
    	var min, max;
    	if(scale_auto){
    		var tmp_value, bars, max_value, min_value;
			for(var j=0; j<chart_data.length; j++){
		    	if(Object.prototype.toString.call(chart_data[j]) === '[object Array]') {
		    		var values = chart_data[j];
		    		if(!bars){
		    			bars = values.length;
		    		}
		    		for(var i=0; i<values.length; i++){
		    			tmp_value = parseFloat(values[i]);
		    			if(max_value == null || Math.abs(tmp_value) > max_value){
		    				max_value = Math.abs(tmp_value);
		    			}
		    			if(min_value == null || tmp_value < min_value){
		    				min_value = tmp_value;
		    			}
		    		}
		    	} else {
		    		if(!bars){
		    			bars = chart_data.length;
		    		}
	    			tmp_value = parseFloat(chart_data[j]);
	    			if(max_value == null || Math.abs(tmp_value) > max_value){
	    				max_value = Math.abs(tmp_value);
	    			}
	    			if(min_value == null || tmp_value < min_value){
	    				min_value = tmp_value;
	    			}
		    	}
			}
	    	min = min_value;
	    	max = roundUp(max_value, fit_scale);
	    	if(min == max){
	    		min = 0;
	    	}
    	} else {
    		min = min_scale_value;
    		max = max_scale_value;
    	}
        if (r) {
        	r.clear();
        	$('#chart').html('');
        }
		r = Raphael('chart');
		setPaperAttributes(x, y, width, height, gutter, min, max, rtl);
		var x_points = new Array();
		for(var i=0; i<groups_names.length; i++){
			x_points.push(i);
		}
	    var options =  {
				gutter: gutter,
			    nostroke: false,
			    symbol: dot_types,
			    smooth: false,
			    colors: series_colors
			};
		setValuesAxis(x, y, min, max, width, height, gutter, grid_lines_color,
	    		use_background_color, background_color, label_background_color, label_text_color,
	    		show_scale, show_axis, show_gridlines, groups_names, series_names, scale_intervals, 
	    		show_groups_labels, show_groups_background, symbols, rtl, x_axis_on_zero,
	    		symbol_position);
		
		var chart = r.linechart(x, y, width, height, x_points, chart_data, options, min, max,
				show_lines_labels, lines_labels_position, lines_labels_color, symbols,
				symbol_position);
        //set chart title
        setChartTitle(x, width, gutter, chart_title, titles_font);
        //set chart label
        setChartLabel(x, y, height, gutter, min, max, chart_label, titles_font);
        if(show_legend){
        	showLegend(x, y, width, height, gutter, min, max, series_names, series_colors, rtl);	
        }
        return true;
	}
	
    function showLegend(x, y, width, height, gutter, min, max, series_names, series_colors, rtl){
    	var y_pos_ini, y_pos_fin, y_pos_zero, x_pos_ini, x_pos_fin, series_margin = 50, labels_space = 30, 
    		rows_space = 15, row_height = 15, font_size = 18, bullet_size = 10, bullet_space = 5;
    	//setting start positions
    	y_pos_ini = getYPosIni(y, gutter);
    	y_pos_zero = getYPosZero(y_pos_ini, height, gutter, min, max);
    	y_pos_fin = getYPosFin(y_pos_ini, height, gutter);
    	x_pos_ini = getXPosIni(x, gutter);
    	x_pos_fin = getXPosFin(x_pos_ini, width);
    	//calculating height and width
    	var max_row_width = (x_pos_fin - x_pos_ini);
    	var text_length = 0;
    	for(var i=0; i<series_names.length; i++){
    		text_length += bullet_size + bullet_space + getTextWidth(series_names[i], true);
    	}
    	var labels_spaces = series_names.length + 1;
    	text_length += labels_space * labels_spaces;
    	var rows = Math.ceil(text_length/max_row_width);
    	var rows_spaces = (rows == 1 ? rows : rows - 1);
    	var series_height = (row_height * rows) + (rows_space * rows_spaces);
    	var series_width = (rows == 1 ? text_length :  max_row_width);
    	//drwawing the border
    	x_pos_border = (x_pos_ini + x_pos_fin)/2 - (series_width/2);
    	y_pos_border = y_pos_fin + series_margin;
    	r.rect(x_pos_border, y_pos_border, series_width, series_height).attr ("stroke-width", "1");
    	//printing each serie
    	var label_x_pos, label_y_pos, label_text, row_width = labels_space, text_start_point;
    	label_x_pos = x_pos_border + labels_space;
    	label_y_pos = y_pos_border + rows_space;
    	text_start_point = rtl && (BrowserDetect.browser == 'Chrome' || BrowserDetect.browser == 'Opera') ? 'end' : 'start';
    	for(var i=0; i<series_names.length; i++){
    		drawBullet(label_x_pos, label_y_pos - (bullet_size/2), series_colors[i], bullet_size);
    		label_x_pos += bullet_size + bullet_space;
    		label_text = series_names[i];
    		r.text(label_x_pos, label_y_pos, label_text)
    			.attr('text-anchor', text_start_point)
    			.attr('font-size', font_size.toString());
    		 
    		label_x_pos += getTextWidth(label_text, true) + labels_space;
    		if(i<(series_names.length -1)){
    			row_width = label_x_pos - (x_pos_border + labels_space) + bullet_size + bullet_space + getTextWidth(series_names[i + 1], true) + labels_space;
        		if(row_width > max_row_width){
        			label_y_pos += rows_space;
        			label_x_pos = x_pos_border + labels_space;
        			row_width = labels_space;
        		}
    		}
    	}
    }
    
    function drawBullet(x, y, background_color, size){
    	r.rect(x, y, size, size)
    		.attr ("stroke-width", "0")
    		.attr ("fill", background_color);
    }
    
    function setBackgroundColor(x, y, width, height, background_color){
    	var background = r.rect(x, y, width, height);
    	background.attr ("stroke-width", "0");
    	background.attr ("fill", background_color);
    }
        
    function getTextWidth(text, big_text){
    	return text.toString().length * (big_text ? 8 : 6);
    }
    
    function setChartTitle(x, width, gutter, chart_title, titles_font){
    	var x_pos_ini = getXPosIni(x, gutter),
    		x_pos_fin = getXPosFin(x_pos_ini, width);	
        r.text((x_pos_ini + x_pos_fin)/2, 20, chart_title).attr({"font-family":titles_font, 
            "font-size":"30",
            "text-anchor":"middle"});    	
    }

    function setChartLabel(x, y, height, gutter, min, max, chart_label, titles_font){
    	var group_labels_x = 60;
    	var y_pos_ini = getYPosIni(y, gutter),
	    	y_pos_zero = getYPosZero(y_pos_ini, height, gutter, min, max),
    		y_pos_fin = getYPosFin(y_pos_ini, height, gutter);
    	height = y_pos_ini + y_pos_fin;
        r.text(x - group_labels_x, height/2, chart_label).attr({"font-family":titles_font, 
            "font-size":"22",
            "transform": "r-90",
            "text-anchor":"middle"});    	
    }
	
    function getYScaleFactor(height, gutter, min, max){
    	return (height - gutter * 2) / ((max - min) || 1);
    }
    
    function getXScaleFactor(width, gutter, min, max){
    	return width / max;
    }
    
	function getYPosIni(y, gutter){
		return y + gutter - 1;
	}
	
	function getYPosZero(y_pos_ini, height, gutter, min, max){
		return y_pos_ini + (max * getYScaleFactor(height, gutter, min, max));
	}
	
	function getYPosFin(pos_ini, height, gutter){
		return pos_ini + height - (gutter * 2);
	}
	
	function getXPosIni(x, gutter){
		return x + gutter;
	}

	function getXPosFin(pos_ini, width){
		return pos_ini + width;
	}
    
    function getCalculatedInterval(min, max, scale_intervals){
    	if(!scale_intervals || scale_intervals < 1){
    		scale_intervals = 10;
    	}
    	var interval = scale_intervals;
    	if(min < 0){
        	for(var i=1; i<=max; i++) {
        		if(max%i == 0){
        			interval = i;
            		if(i >= scale_intervals){
            			break;
            		}
        		}
        	}    		
    	}
    	return interval;
    }
    
    function setValuesAxis(x, y, min, max, width, height, gutter, grid_lines_color,
    		use_background_color, background_color, label_background_color, label_text_color,
    		show_scale, show_axis, show_gridlines, groups_names, series_names, scale_intervals, 
    		show_groups_labels, show_groups_background, symbols, rtl, x_axis_on_zero,
    		symbol_position){
    	var valuesInterval = max / getCalculatedInterval(min, max, scale_intervals);
    	var y_scale_factor = getYScaleFactor(height, gutter, min, max),
    		x_scale_factor = getXScaleFactor(width, gutter, 0, groups_names.length);
    	var font_size = 18;
    	//set axis positions
    	var y_pos_ini = getYPosIni(y, gutter);
    	var y_pos_zero = getYPosZero(y_pos_ini, height, gutter, min, max);
    	var y_pos_fin = getYPosFin(y_pos_ini, height, gutter);
    	var x_pos_ini = getXPosIni(x, gutter);
    	var x_pos_fin = getXPosFin(x_pos_ini, width);

        //set background color
    	if(use_background_color){
    		var background_height = (max - min) * y_scale_factor;
    		setBackgroundColor(x_pos_ini, y_pos_ini, width, background_height, background_color);
    	}
		//setting the scale values
    	var interval_pos = (y_pos_fin - y_pos_ini)/((max - min)/valuesInterval);
    	var y_value_pos = y_pos_fin - 1;
    	var x_value_pos, gridline, text_start_point, text, symbol;
    	for(var i=min; i<=max; i+=valuesInterval) {
    		x_value_pos = x_pos_ini - 5;
    		if(show_scale){
				if(Object.prototype.toString.call(symbols[0]) === '[object Array]'){
					symbol = symbols[0][0];
				} else {
					symbol = symbols[0];
				}
    			if(symbol_position == 'prefix'){
    				text = (symbol.length > 0 ? symbol + ' ' : '') + addCommasToNumber((Math.round(i * 10) / 10).toString());
    			} else {
    				text = addCommasToNumber((Math.round(i * 10) / 10).toString()) + (symbol.length > 0 ? ' ' + symbol : '');
    			}
    			text_start_point = rtl && (BrowserDetect.browser == 'Chrome' || BrowserDetect.browser == 'Opera') ? 'start' : 'end';
    			r.text(x_value_pos, y_value_pos, text)
    			.attr('font-size', font_size.toString())
    			.attr('text-anchor', text_start_point);
    		}
    		if(show_gridlines){
        		gridline = r.path("M" + x_pos_ini.toString() + "," + (y_value_pos + 2).toString() + "L"+ (x_pos_fin).toString() + "," + (y_value_pos + 2).toString());
        		gridline.attr ("stroke", grid_lines_color);    			
    		}
    		y_value_pos -= interval_pos;
    	}
    	//drawing the axis
    	if(show_axis){
        	r.path("M" + x_pos_ini.toString() + "," + (y_pos_ini).toString() + "L" + x_pos_ini.toString() + "," + ((y_pos_zero > y_pos_fin || !x_axis_on_zero ? y_pos_fin : y_pos_zero) + 1).toString()); //y axis
        	r.path("M" + x_pos_ini.toString() + "," + ((y_pos_zero > y_pos_fin || !x_axis_on_zero ? y_pos_fin : y_pos_zero) + 1).toString() + "L"+ (x_pos_fin).toString() + "," + ((y_pos_zero > y_pos_fin || !x_axis_on_zero ? y_pos_fin : y_pos_zero) + 1).toString()); //x axis    		
    	}
    	//setting the groups labels
    	if(show_groups_labels){
	    	var label_text, label_bkg_height = 25, label_margin = 15;
	    	var gap = (width - ((groups_names.length - 1) * x_scale_factor))/2;
	    	y_value_pos = (y_pos_zero > y_pos_fin || !x_axis_on_zero ? y_pos_fin : y_pos_zero) + label_margin;
	    	var label_bkg_width = x_scale_factor, 
	    		label_bkg_y_pos, label_bkg_x_pos, x_value_pos;
        	label_bkg_y_pos = y_value_pos - (label_bkg_height/2);
        	if(groups_names.length == 1){
	    		label_bkg_x_pos = x_pos_ini + 1;
	    		x_value_pos = (x_pos_ini + x_pos_fin)/2;
	        	if(show_groups_background){
	        		setBackgroundColor(label_bkg_x_pos, label_bkg_y_pos, label_bkg_width, label_bkg_height, label_background_color);
	        	}
	        	label_text = r.text(x_value_pos, y_value_pos, groups_names[0]);
	    		label_text.attr({ fill: label_text_color });
	    		label_text.attr('font-size', font_size.toString());
        	} else {
        		x_value_pos = x_pos_ini + gap;
            	for(var i=0; i<groups_names.length; i++){
        			label_bkg_x_pos = x_value_pos - (label_bkg_width/2);
            		if(show_groups_background){
            			setBackgroundColor(label_bkg_x_pos, label_bkg_y_pos, label_bkg_width, label_bkg_height, label_background_color)
            		}
            		label_text = r.text(x_value_pos, y_value_pos, groups_names[i]);
            		label_text.attr({ fill: label_text_color });
            		label_text.attr('font-size', font_size.toString());
            		x_value_pos += x_scale_factor;
            	}	
        	}
    	}
    }
    
    function saveChart() {
        var svgString = r.toSVG();
        var a = document.createElement('a');
        a.download = 'linechart.svg';
        a.type = 'image/svg+xml';

        var blob = new Blob([svgString], {type: 'image/svg+xml'});

        a.href = (window.URL || webkitURL).createObjectURL(blob);
        if($.browser.mozilla){
        	document.location = a.href;
        } else {
        	a.click();
        }
    };

	$(document).ready(function(){
		$('#orientation').attr('disabled', true);
        $("#save_chart").click(saveChart);
        $("#generate_chart").click(function() {
        	generateChart();
        });
	});
	
    function generateChart(){
    	eval(getConfiguration());
    	var data = getChartData();
    	//var data = '[{"id":"group_1","name":"g1","series":[{"id":"serie_1","name":"serie uno","color":"#FF930B","value":10,"symbol":""},{"id":"serie_2","name":"serie dos","color":"#3AB546","value":40,"symbol":""},{"id":"serie_3","name":"serie tres","color":"#262BAD","value":5,"symbol":""}]},{"id":"group_2","name":"g2","series":[{"id":"serie_1","name":"serie uno","color":"#FF930B","value":20,"symbol":""},{"id":"serie_2","name":"serie dos","color":"#3AB546","value":50,"symbol":""},{"id":"serie_3","name":"serie tres","color":"#262BAD","value":15,"symbol":""}]},{"id":"group_3","name":"g3","series":[{"id":"serie_1","name":"serie uno","color":"#FF930B","value":30,"symbol":""},{"id":"serie_2","name":"serie dos","color":"#3AB546","value":25,"symbol":""},{"id":"serie_3","name":"serie tres","color":"#262BAD","value":-10,"symbol":""}]}]';
    	//var data = '[{"id":"group_1","name":"g1","series":[{"id":"serie_1","name":"s1","color":"#FF930B","value":123,"symbol":""}]},{"id":"group_2","name":"g2","series":[{"id":"serie_1","name":"s1","color":"#FF930B","value":111,"symbol":""}]}]';
    	//var data = '[{"id":"group_1","name":"g1","series":[{"id":"serie_1","name":"s1","color":"#141CFF","value":123,"symbol":""}]},{"id":"group_2","name":"g2","series":[{"id":"serie_1","name":"s1","color":"#141CFF","value":111,"symbol":""}]},{"id":"group_3","name":"g3","series":[{"id":"serie_1","name":"s1","color":"#141CFF","value":89,"symbol":""}]}]';
    	//var data = '[{"id":"group_1","name":"g1","series":[{"id":"serie_1","name":"s1","color":"#FF930B","value":10,"symbol":""},{"id":"serie_2","name":"s2","color":"#4621FF","value":40,"symbol":""}]},{"id":"group_2","name":"g2","series":[{"id":"serie_1","name":"s1","color":"#FF930B","value":20,"symbol":""},{"id":"serie_2","name":"s2","color":"#4621FF","value":55,"symbol":""}]},{"id":"group_3","name":"g3","series":[{"id":"serie_1","name":"s1","color":"#FF930B","value":30,"symbol":""},{"id":"serie_2","name":"s2","color":"#4621FF","value":29,"symbol":""}]}]';
        if(drawLineChart(chart_title, chart_label, height, width, orientation, grid_lines_color,
        		chart_labels_position, chart_labels_color, background_color, label_background_color, 
        		label_text_color, fit_scale, show_scale, show_axis, show_gridlines, show_chart_labels, 
        		use_background_color, scale_intervals, show_groups_labels, show_groups_background, 
        		titles_font, show_legend, rtl, min_scale_value, max_scale_value, scale_auto, 
        		x_axis_on_zero, symbol_position, data)){
        	enableButton('save_chart');
        }
    }
}());