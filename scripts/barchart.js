(function() {
    var r;

    function setPaperAttributes(x, y, width, height, gutter, min, max, bars, orientation, rtl){
    	var bar_width, bars_space, y_pos_ini, y_pos_fin, x_pos_ini, x_pos_fin, viewbox_width, 
    		viewbox_height, viewbox_x, viewbox_y, offset;
		if(orientation == 'V'){
			var y_pos_zero, y_pos_negative;
			bar_width = getVBarWidth(width, bars, gutter);
	    	bars_space = getVBarSpace(bar_width, gutter);
			x_pos_ini = getVXPosIni(x, bars_space);
			x_pos_fin = getVXPosFin(x_pos_ini, width);    	
			y_pos_ini = getVYPosIni(y, height, gutter, max);
	    	y_pos_zero = getVYPosZero(y_pos_ini, height, gutter, max);
	    	y_pos_negative = getVYPosNegative(y_pos_zero, height, gutter, max, min);
	    	y_pos_fin = (min < 0 ? y_pos_negative : y_pos_zero);
	    	offset = 0;
		} else if(orientation == 'H'){
	        bar_width = getHBarWidth(height, bars, gutter);
			bars_space = getHBarSpace(bar_width, gutter);
	    	x_pos_ini = getHXPosIni(x, min);
	    	x_pos_fin = getHXPosFin(x_pos_ini, width, getHXNegativeOffset(min, max, width));
	    	y_pos_ini = getHYPosIni(y);
	    	y_pos_fin = getHYPosFin(y, bar_width, bars_space, bars);
	    	offset = 50;
		}
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
    
    function drawBarChart(chart_title, chart_label, height, width, orientation, grid_lines_color,
    		bars_labels_position, bars_labels_color, background_color, label_background_color, 
    		label_text_color, fit_scale, show_scale, show_axis, show_gridlines, show_bars_labels, 
    		use_background_color, scale_intervals, show_groups_labels, show_groups_background, 
    		titles_font, show_legend, rtl, min_scale_value, max_scale_value, scale_auto, 
    		symbol_position, stroke, show_baseline, baseline_text, baseline_color, baseline_value, data) {

    	var data_bundle = parseChartData(data);
    	if(!data_bundle || data_bundle.data.length == 0){
    		return false;
    	}
    	var chart_data = data_bundle.data;
    	var series_colors = data_bundle.colors;
    	var groups_names = data_bundle.groups;
    	var series_names = data_bundle.series;
    	var symbols = data_bundle.symbols;
    	
    	var x = 200, y = 50, gutter = 20;
    	width = parseInt(width); 
    	height = parseInt(height);
    	//set values for calculations
    	var min, max, bars, tmp_value, max_value, min_value;
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
	    if(scale_auto){
        	min = roundUp(min_value, fit_scale);
        	max = roundUp(max_value, fit_scale);   
    	} else {
	    	min = min_scale_value;
	    	max = max_scale_value;
    	}
        if (r) {
        	r.clear();
        	$('#chart').html('');
        }
        r = Raphael("chart");
        setPaperAttributes(x, y, width, height, gutter, min, max, bars, orientation, rtl);
        var chart;
        if(orientation == "H"){
        	//create axis
            setHValuesAxis(x, y, min, max, width, height, bars, gutter, grid_lines_color,
            		use_background_color, background_color, label_background_color, label_text_color, 
            		show_scale, show_axis, show_gridlines, groups_names, series_names,
            		scale_intervals, show_groups_labels, show_groups_background, symbols, 
            		symbol_position);
            //create chart
            var x_pos = (min < 0 ? (x-1 + (getHScaleFactor(width, max) * Math.abs(min))) : x);
        	chart = r.hbarchart(x_pos, y, width, height, chart_data, {type: "square", gutter:gutter, 
        		colors:series_colors}, max, symbols, stroke);
        	//show baseline
        	showHorizontalBaseline(x, y, min, max, width, height, bars, gutter, 
            		show_baseline, baseline_text, baseline_color, baseline_value);
        } else if(orientation == "V") {
        	//create axis
        	setVValuesAxis(x, y, min, max, width, height, bars, gutter, grid_lines_color,
        			use_background_color, background_color, label_background_color, label_text_color, 
        			show_scale, show_axis, show_gridlines, groups_names, series_names,
        			scale_intervals, show_groups_labels, show_groups_background, symbols, rtl, 
        			symbol_position);
            //create chart
        	chart = r.barchart(x, y, width, height, chart_data, 
        			{type: "square", gutter:gutter, colors:series_colors}, max, 
        			symbols, stroke);
        	//show baseline
        	showVerticalBaseline(x, y, min, max, width, height, bars, gutter, 
            		show_baseline, baseline_text, baseline_color, baseline_value);      	
        }
        //set chart title
        setChartTitle(x, y, width, bars, gutter, min, max, orientation, chart_title, titles_font);
        //set chart label
        setChartLabel(x, y, height, bars, gutter, min, max, orientation, chart_label, titles_font);
        //show bar values
        if(show_bars_labels){
        	showBarsLabels(chart, orientation, bars_labels_position, bars_labels_color, symbol_position);	
        }
        if(show_legend){
        	showLegend(x, y, width, height, gutter, min, max, bars, orientation, series_names, series_colors, rtl);	
        }
        return true;
    };
 
    function showLegend(x, y, width, height, gutter, min, max, bars, orientation, series_names, series_colors, rtl){
    	var bar_width, bars_space, y_pos_ini, y_pos_fin, x_pos_ini, x_pos_fin, series_margin = 50, labels_space = 30, 
    		rows_space = 15, row_height = 15, font_size = 18, bullet_size = 10, bullet_space = 5;
    	//setting start positions
    	if(orientation == 'V'){
    		var y_pos_zero, y_pos_negative;
    		bar_width = getVBarWidth(width, bars, gutter);
        	bars_space = getVBarSpace(bar_width, gutter);
    		x_pos_ini = getVXPosIni(x, bars_space);
    		x_pos_fin = getVXPosFin(x_pos_ini, width);    	
    		y_pos_ini = getVYPosIni(y, height, gutter, max);
        	y_pos_zero = getVYPosZero(y_pos_ini, height, gutter, max);
        	y_pos_negative = getVYPosNegative(y_pos_zero, height, gutter, max, min);
        	y_pos_fin = (min < 0 ? y_pos_negative : y_pos_zero);
    	} else if(orientation == 'H'){
            bar_width = getHBarWidth(height, bars, gutter);
    		bars_space = getHBarSpace(bar_width, gutter);
        	x_pos_ini = getHXPosIni(x, min);
        	x_pos_fin = getHXPosFin(x_pos_ini, width, getHXNegativeOffset(min, max, width));
        	y_pos_ini = getHYPosIni(y);
        	y_pos_fin = getHYPosFin(y, bar_width, bars_space, bars);
    	}
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
    	var border = r.rect(x_pos_border, y_pos_border, series_width, series_height).attr ("stroke-width", "1");
    	if(curved_edges){
    		var radius = 10;
    		border.attr("rx", radius);
    		border.attr("ry", radius);
    		border.attr("r", radius);    		
    	}
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
    	var radius = 10;
    	var background = r.rect(x, y, width, height);
    	background.attr ("stroke-width", "0");
    	background.attr ("fill", background_color);    		
    	if(curved_edges){
        	background.attr("rx", radius);
        	background.attr("ry", radius);
        	background.attr("r", radius);
    	}
    }
    
    function getTextWidth(text, big_text, bigger){
    	var size;
    	if(bigger){
    		size = 11;
    	} else if(big_text){
    		size = 8;
    	} else {
    		size = 6;
    	}
    	return text.toString().length * size;
    }
    
    function showBarsLabels(chart, orientation, bars_labels_position, bars_labels_color, symbol_position){
    	var x_offset, y_offset, bar, font_size = 18, str_value;
        for(var j=0; j<chart.bars.length; j++){
        	if(chart.bars[j].length) {
		        for (var i=0; i<chart.bars[j].length; i++) {
		        	  bar=chart.bars[j][i];
		    		  if(symbol_position == 'prefix'){
		    		      str_value = (bar.symbol.length > 0 ? bar.symbol + ' ' : '') + addCommasToNumber(bar.value);
		    		  } else {
		    		      str_value = addCommasToNumber(bar.value) + (bar.symbol.length > 0 ? ' ' + bar.symbol : '');
		    		  }
		        	  if(orientation == 'V'){
		        		  y_offset = (bars_labels_position == 'inside' ? -13 : 13) * (bar.value/Math.abs(bar.value));
		        		  x_offset = 0;
		        	  } else {
		        		  y_offset = 0;
		        		  x_offset = (bars_labels_position == 'inside' ? -1 : 1) * getTextWidth(str_value, false,true)/2 * (bar.value/Math.abs(bar.value));
		        	  }		        	  
		        	  bar.count_label = r.text(bar.x + x_offset, bar.y-y_offset, str_value || "0")
		        	  	.attr('font-size', font_size.toString())
		        	  	.attr('text-anchor', 'middle')
		        	  	.attr('fill', bars_labels_color)
		        	    .insertAfter(bar);
		        }
        	} else {
        		  bar=chart.bars[j];
	    		  if(symbol_position == 'prefix'){
	    		      str_value = (bar.symbol.length > 0 ? bar.symbol + ' ' : '') + addCommasToNumber(bar.value);
	    		  } else {
	    		      str_value = addCommasToNumber(bar.value) + (bar.symbol.length > 0 ? ' ' + bar.symbol : '');
	    		  }
	        	  if(orientation == 'V'){
	        		  y_offset = (bars_labels_position == 'inside' ? -10 : 10) * (bar.value/Math.abs(bar.value));
	        		  x_offset = 0;
	        	  } else {
	        		  y_offset = 0;
	        		  x_offset = (bars_labels_position == 'inside' ? -1 : 1) * getTextWidth(str_value, false, true)/2 * (bar.value/Math.abs(bar.value));        		  
	        	  }
	        	  bar.count_label = r.text(bar.x + x_offset, bar.y-y_offset, str_value || "0")
        		  	.attr('font-size', font_size.toString())
        		  	.attr('text-anchor', 'middle')
        		  	.attr('fill', bars_labels_color)
        		  	.insertAfter(bar);       
        	}
        }
    }
    
    function setChartTitle(x, y, width, bars, gutter, min, max, orientation, chart_title, titles_font){
    	var x_pos_ini, x_pos_fin;
    	if(orientation == 'V'){
    		x_pos_ini = getVXPosIni(x, getVBarSpace(getVBarWidth(width, bars, gutter), gutter));
    		x_pos_fin = getVXPosFin(x_pos_ini, width);    		
    	} else if(orientation == 'H'){
        	x_pos_ini = getHXPosIni(x, min);
        	x_pos_fin = getHXPosFin(x_pos_ini, width, getHXNegativeOffset(min, max, width));
    	}
        r.text((x_pos_ini + x_pos_fin)/2, 20, chart_title).attr({"font-family":titles_font, 
            "font-size":"30",
            "text-anchor":"middle"});    	
    }

    function setChartLabel(x, y, height, bars, gutter, min, max, orientation, chart_label, titles_font){
    	var group_labels_x;
    	if(orientation == 'V'){
        	var y_pos_ini = getVYPosIni(y, height, gutter, max);
        	var y_pos_zero = getVYPosZero(y_pos_ini, height, gutter, max);
        	var y_pos_negative = getVYPosNegative(y_pos_zero, height, gutter, max, min);
        	height = y_pos_ini + (min < 0 ? y_pos_negative : y_pos_zero);
        	group_labels_x = 35;
    	} else if(orientation == 'H') {
            var bar_width = getHBarWidth(height, bars, gutter),
    			bars_space = getHBarSpace(bar_width, gutter);	
            var y_pos_fin = getHYPosFin(y, bar_width, bars_space, bars);
    		height = y + y_pos_fin;
    		group_labels_x = 100;
    	}
        r.text(x - group_labels_x, height/2, chart_label).attr({"font-family":titles_font, 
            "font-size":"22",
            "transform": "r-90",
            "text-anchor":"middle"});    	
    }
    
    function getVScaleFactor(height, gutter, max){
    	return (height - (2 * gutter))/max;
    }
    
    function getVBarWidth(width, bars, gutter){
    	return 100 * (width / (bars * (100 + gutter) + gutter));
    }
    
    function getVBarSpace(bar_width, gutter){
    	return bar_width * gutter / 100;
    }
    
    function getVYPosIni(y, height, gutter, max){
    	return y + height - gutter - (max * getVScaleFactor(height, gutter, max));
    }

    function getVYPosZero(y_pos_ini, height, gutter, max){
    	return y_pos_ini + (max * getVScaleFactor(height, gutter, max));
    }
    
    function getVYPosBaseline(y_pos_zero, height, gutter, max, value){
    	return y_pos_zero - (value * getVScaleFactor(height, gutter, max));
    }
    
    function getVYPosNegative(y_pos_zero, height, gutter, max, min){
    	return y_pos_zero + Math.abs(min * getVScaleFactor(height, gutter, max));
    }

    function getVXPosIni(x, bars_space){
    	return x + bars_space;
    }
    
    function getVXPosFin(x_pos_ini, width){
    	return x_pos_ini + width;
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
        
    function showVerticalBaseline(x, y, min, max, width, height, bars, gutter, 
    		show_baseline, baseline_text, baseline_color, baseline_value){
    	if(show_baseline && baseline_value > (min < 0 ? min : 0) && baseline_value < max){
            var bar_width = getVBarWidth(width, bars, gutter),
        		bars_space = getVBarSpace(bar_width, gutter),
        		font_size = 18;
        	var y_pos_ini = getVYPosIni(y, height, gutter, max);    	
        	var y_pos_zero = getVYPosZero(y_pos_ini, height, gutter, max);    		
    		var y_pos_baseline = getVYPosBaseline(y_pos_zero, height, gutter, max, baseline_value);
        	var x_pos_ini = getVXPosIni(x, bars_space);
        	var x_pos_fin = getVXPosFin(x_pos_ini, width);
        	
    		var baseline = r.path("M" + (x_pos_ini).toString() + "," + (y_pos_baseline).toString() + "L"+ (x_pos_fin).toString() + "," + (y_pos_baseline).toString());
    		baseline.attr("stroke", baseline_color);
    		
    		var baseline_label = r.text(x_pos_fin, y_pos_baseline - 15, baseline_text);
    		baseline_label.attr({ fill: baseline_color });
    		baseline_label.attr('font-size', font_size.toString());    
    		baseline_label.attr('text-anchor', 'end');
    	}
    }
    
    function setVValuesAxis(x, y, min, max, width, height, bars, gutter, grid_lines_color,
    		use_background_color, background_color, label_background_color, label_text_color,
    		show_scale, show_axis, show_gridlines, groups_names, series_names,
    		scale_intervals, show_groups_labels, show_groups_background, symbols, rtl,
    		symbol_position){
    	var valuesInterval = max / getCalculatedInterval(min, max, scale_intervals);    	
        var bar_width = getVBarWidth(width, bars, gutter),
        	bars_space = getVBarSpace(bar_width, gutter),
        	font_size = 18;
    	//set axis positions
    	var y_pos_ini = getVYPosIni(y, height, gutter, max);    	
    	var y_pos_zero = getVYPosZero(y_pos_ini, height, gutter, max);
    	var y_pos_negative = getVYPosNegative(y_pos_zero, height, gutter, max, min);
    	var x_pos_ini = getVXPosIni(x, bars_space);
    	var x_pos_fin = getVXPosFin(x_pos_ini, width);
        //set background color
    	if(use_background_color){
    		var background_height = (min < 0 ? (max + Math.abs(min)) : max) * getVScaleFactor(height, gutter, max);
    		setBackgroundColor(x_pos_ini, y_pos_ini, width, background_height, background_color);
    	}
		//setting the scale values
    	var interval_pos = (y_pos_zero - y_pos_ini)/(max/valuesInterval);
    	var y_value_pos = (min < 0 ? y_pos_negative - 1 : y_pos_zero - 1);
    	var x_value_pos, gridline, text_start_point, text, symbol;
    	for(var i=(min < 0 ? min : 0); i<=max; i+=valuesInterval) {
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
        		gridline = r.path("M" + x_pos_ini.toString() + "," + (y_value_pos + 1).toString() + "L"+ (x_pos_fin).toString() + "," + (y_value_pos + 1).toString());
        		gridline.attr("stroke", grid_lines_color);    			
    		}
    		y_value_pos -= interval_pos;
    	}
    	//drawing the axis
    	if(show_axis){
        	r.path("M" + x_pos_ini.toString() + "," + (y_pos_ini).toString() + "L" + x_pos_ini.toString() + "," + (min < 0 ? y_pos_negative : y_pos_zero).toString()); //y axis
        	r.path("M" + x_pos_ini.toString() + "," + (y_pos_zero).toString() + "L"+ (x_pos_fin).toString() + "," + (y_pos_zero).toString()); //x axis    		
    	}
    	//setting the groups labels
    	if(show_groups_labels){
	    	var label_text, label_bkg_width, label_bkg_height = 30, label_margin = 25, label_bkg_x_pos;
	    	y_value_pos = (min < 0 ? y_pos_negative : y_pos_zero) + label_margin;
	    	var label_bkg_y_pos = y_value_pos - (label_bkg_height/2);
	    	if(groups_names.length == 1){
	    		label_bkg_x_pos = x_pos_ini + 1;
	    		x_value_pos = (x_pos_ini + x_pos_fin)/2;
	        	label_bkg_width = width;
	        	if(show_groups_background){
	        		setBackgroundColor(label_bkg_x_pos, label_bkg_y_pos, label_bkg_width, label_bkg_height, label_background_color);
	        	}
	        	label_text = r.text(x_value_pos, y_value_pos, groups_names[0]);
	    		label_text.attr({ fill: label_text_color });
	    		label_text.attr('font-size', font_size.toString());
	    	} else {
	    		label_bkg_x_pos = x_pos_ini + 1 + bars_space;
	        	x_value_pos = x_pos_ini + ((bar_width)/2) + bars_space;
	        	label_bkg_width = bar_width;
	        	for(var i=0; i<groups_names.length; i++){
	        		if(show_groups_background){
	        			setBackgroundColor(label_bkg_x_pos, label_bkg_y_pos, label_bkg_width, label_bkg_height, label_background_color)
	        		}
	        		label_text = r.text(x_value_pos, y_value_pos, groups_names[i]);
	        		label_text.attr({ fill: label_text_color });
	        		label_text.attr('font-size', font_size.toString());
	        		x_value_pos += bar_width + bars_space;
	        		label_bkg_x_pos += bar_width + bars_space;
	        	}	
	    	}
    	}
    }
    
    function getHScaleFactor(width, max){
    	return (width - 1)/max;
    }
    
    function getHBarWidth(height, bars, gutter){
    	return  Math.floor(100 * (height / (bars * (100 + gutter) + gutter)));
    }
    
    function getHBarSpace(bar_width, gutter){
    	return Math.floor(bar_width * gutter / 100);
    }
    
    function getHXNegativeOffset(min, max, width){
    	return (min < 0 ? getHScaleFactor(width, max) * Math.abs(min) : 0);
    }

    function getHXPosIni(x, min){
    	return  x - (min < 0 ? 1 : 0);
    }
    
    function getHXPosFin(x_pos_ini, width, x_negative_offset){
    	return x_pos_ini + width + x_negative_offset;
    }
    
    function getHYPosIni(y){
    	return y;
    }
    
    function getHYPosFin(y, bar_width, bars_space, bars){
    	return y + (bar_width + bars_space)*bars;
    }

    function getHXPosBaseline(x_pos_zero, width, max, value){
    	return x_pos_zero + (value * getHScaleFactor(width, max));
    }
    
    function showHorizontalBaseline(x, y, min, max, width, height, bars, gutter, 
    		show_baseline, baseline_text, baseline_color, baseline_value){
    	if(show_baseline && baseline_value > (min < 0 ? min : 0) && baseline_value < max){
            var bar_width = getHBarWidth(height, bars, gutter),
	    		bars_space = getHBarSpace(bar_width, gutter),
	    		font_size = 18;	
	        var x_negative_offset = getHXNegativeOffset(min, max, width);
	    	var y_pos_ini = getHYPosIni(y);
	    	var y_pos_fin = getHYPosFin(y, bar_width, bars_space, bars);
	    	var x_pos_ini = getHXPosIni(x, min);
	    	var x_pos_zero = x_pos_ini + x_negative_offset;
	    	var x_pos_fin = getHXPosFin(x_pos_ini, width, x_negative_offset);
	    	var x_pos_baseline = getHXPosBaseline(x_pos_zero, width, max, baseline_value);
	    	
	    	var baseline = r.path("M" + x_pos_baseline.toString() + "," + (y_pos_ini).toString() + "L" + x_pos_baseline.toString() + "," + y_pos_fin.toString());
    		baseline.attr("stroke", baseline_color);

    		var baseline_label = r.text(x_pos_baseline - 15, y_pos_ini + getTextWidth(baseline_text), baseline_text);
    		baseline_label.attr({ fill: baseline_color });
    		baseline_label.attr('font-size', font_size.toString());    
    		baseline_label.attr('text-anchor', 'middle');
    		baseline_label.attr('transform', 'r-90');
    	}
    }  
    
    function setHValuesAxis(x, y, min, max, width, height, bars, gutter, grid_lines_color,
    		use_background_color, background_color, label_background_color, label_text_color,
    		show_scale, show_axis, show_gridlines, groups_names, series_names,
    		scale_intervals, show_groups_labels, show_groups_background, symbols,
    		symbol_position){
    	var valuesInterval = max / getCalculatedInterval(min, max, scale_intervals);
    	var interval_pos, x_pos, y_pos;
        var bar_width = getHBarWidth(height, bars, gutter),
    		bars_space = getHBarSpace(bar_width, gutter),
    		font_size = 18;	
    	//set axis positions
        var x_negative_offset = getHXNegativeOffset(min, max, width);
    	var y_pos_ini = getHYPosIni(y);
    	var y_pos_fin = getHYPosFin(y, bar_width, bars_space, bars);
    	var x_pos_ini = getHXPosIni(x, min);
    	var x_pos_zero = x_pos_ini + x_negative_offset;
    	var x_pos_fin = getHXPosFin(x_pos_ini, width, x_negative_offset);
        //set background color
    	if(use_background_color){
    		setBackgroundColor(x_pos_ini, y_pos_ini, width + x_negative_offset, (bar_width + bars_space)*bars, background_color);	
    	}
        //setting the scale values
    	var interval_pos = (width/((max/valuesInterval)));
    	var x_value_pos = x_pos_ini + 1;
    	var y_value_pos = y + (bar_width + bars_space)*bars;
    	var gridline, text, symbol;
    	for(var i=(min < 0 ? min : 0); i<=max; i+=valuesInterval) { 
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
    			r.text(x_value_pos - 1, y_value_pos + 10, text)
    			.attr('font-size', font_size.toString());
    		}
    		if(show_gridlines){
        		gridline = r.path("M" + (x_value_pos - 2).toString() + "," + y_pos_ini.toString() + "L"+ (x_value_pos - 2).toString() + "," + y_pos_fin.toString());
        		gridline.attr ("stroke", grid_lines_color);    			
    		}
    		x_value_pos += interval_pos;
    	}
    	//drawing the axis
    	if(show_axis){
        	r.path("M" + ((min < 0 ? x_pos_zero : x_pos_ini) - 1).toString() + "," + (y_pos_ini).toString() + "L" + ((min < 0 ? x_pos_zero : x_pos_ini) - 1).toString() + "," + y_pos_fin.toString()); //y axis
        	r.path("M" + (x_pos_ini).toString() + "," + y_pos_fin.toString() + "L"+ (x_pos_fin).toString() + "," + y_pos_fin.toString()); //x axis
    	}
    	//setting the groups labels
    	if(show_groups_labels){
	    	var label_text, label_bkg_y_pos, label_bkg_width = 75, label_bkg_height, text;
	    	x_value_pos = x_pos_ini - 40;
	    	var label_bkg_x_pos = x_value_pos - (x_value_pos/4);
	    	if(groups_names.length == 1){
	    		y_value_pos = (y_pos_ini + y_pos_fin)/2;
	    		label_bkg_y_pos = y_pos_ini;
	        	label_bkg_height = y_pos_fin - y_pos_ini;
	        	if(show_groups_background){
	        		setBackgroundColor(label_bkg_x_pos, label_bkg_y_pos, label_bkg_width, label_bkg_height, label_background_color);	
	        	}
        		text = groups_names[0];
        		if(text.indexOf(' ') > -1){
        			text_arr = text.split(' ');
        			var line_space = 0;
        			for(var j=0; j<text_arr.length; j++){
		        		label_text = r.text(x_value_pos, y_value_pos + line_space, text_arr[j]);
		        		label_text.attr({ fill: label_text_color });
		        		label_text.attr('font-size', font_size.toString());
		        		line_space += 15;				
        			}
        		} else {
	        		label_text = r.text(x_value_pos, y_value_pos, text);
	        		label_text.attr({ fill: label_text_color });
	        		label_text.attr('font-size', font_size.toString());
        		}
	    	} else {
	        	y_value_pos = y_pos_ini + ((bar_width)/2) + (bars_space/2);
	        	label_bkg_y_pos = y_pos_ini + (bars_space/2) + 1;
	        	label_bkg_height = bar_width - 1;
	        	for(var i=0; i<groups_names.length; i++){
	        		if(show_groups_background){
	        			setBackgroundColor(label_bkg_x_pos, label_bkg_y_pos, label_bkg_width, label_bkg_height, label_background_color)
	        		}
	        		text = groups_names[i];
	        		if(text.indexOf(' ') > -1){
	        			text_arr = text.split(' ');
	        			var line_space = -15;
	        			for(var j=0; j<text_arr.length; j++){
			        		label_text = r.text(x_value_pos, y_value_pos + line_space, text_arr[j]);
			        		label_text.attr({ fill: label_text_color });
			        		label_text.attr('font-size', font_size.toString());
			        		line_space += 15;				
	        			}
	        		} else {
		        		label_text = r.text(x_value_pos, y_value_pos, text);
		        		label_text.attr({ fill: label_text_color });	
		        		label_text.attr('font-size', font_size.toString());
	        		}
	        		y_value_pos += bar_width + bars_space;
	        		label_bkg_y_pos += bar_width + bars_space;
	        	}	
	    	}
    	}
    }
    
    $(document).ready(function() {
        $("#save_chart").click(function() {
            Filesystem.saveChart(r, "barchart", "svg");
        });
        $("#generate_chart").click(function() {
            generateChart();
        });
    });

    function generateChart(){
    	evalConfiguration();
    	var data = getChartData();
        if(drawBarChart(chart_title, chart_label, height, width, orientation, grid_lines_color,
        		chart_labels_position, chart_labels_color, background_color, label_background_color, 
        		label_text_color, fit_scale, show_scale, show_axis, show_gridlines, show_chart_labels, 
        		use_background_color, scale_intervals, show_groups_labels, show_groups_background, 
        		titles_font, show_legend, rtl, min_scale_value, max_scale_value, scale_auto, 
        		symbol_position, stroke, show_baseline, baseline_text, baseline_color, baseline_value, data)){
        	enableButton('save_chart');
        }
    }
})();