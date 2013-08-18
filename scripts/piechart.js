(function() {
    var r;

    function setPaperAttributes(x, y, radio, rtl){
        viewbox_width = x + radio * 2;
        viewbox_height = y + radio * 2;
        viewbox_x = x - radio * 2;
        viewbox_y = y - radio * 2;
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
    
    function drawPieChart(chart_title, chart_label, height, width, 
    		chart_labels_position, chart_labels_color, show_chart_labels, 
    		titles_font, show_legend, rtl, symbol_position, stroke, exploded, radio, data) {

    	var data_bundle = parseChartData(data);
    	if(!data_bundle || data_bundle.data.length == 0){
    		return false;
    	}
    	var chart_data = data_bundle.data;
    	var series_colors = data_bundle.colors;
    	var groups_names = data_bundle.groups;
    	var series_names = data_bundle.series;
    	var symbols = data_bundle.symbols;

    	var x = radio * 2.8, y = radio * 1.7;
    	width = parseInt(width); 
    	height = parseInt(height);
    	
        if (r) {
        	r.clear();
        	$('#chart').html('');
        }
		r = Raphael('chart');
		setPaperAttributes(x, y, radio, rtl);
        r.piechart(x, y, radio, 
        		chart_data, 
        		{legend:series_names, 
        		 colors:series_colors, 
        		 stroke: (stroke == true ? "#000000" : "#fff"),
        		 symbol_position:symbol_position,
        		 show_chart_labels:show_chart_labels,
        		 chart_labels_position:chart_labels_position,
        		 chart_labels_color:chart_labels_color,
        		 show_legend:show_legend,
        		 exploded:exploded,
        		 symbols:symbols
        		});
        
        //set chart title
        setChartTitle(x, radio, chart_title, titles_font);
        //set chart label
        setChartLabel(x, y, radio, chart_label, titles_font);
        
        return true;
    };
    
    function setChartTitle(x, radio, chart_title, titles_font){
    	var x_pos_ini = x - radio * 2,
    		x_pos_fin = x + radio + 100;
        r.text((x_pos_ini + x_pos_fin)/2, 10, chart_title).attr({"font-family":titles_font, 
            "font-size":"30",
            "text-anchor":"middle"});    	
    }

    function setChartLabel(x, y, radio, chart_label, titles_font){
    	var x_pos_ini = x - radio * 2 + 10,
    		y_pos_ini = y - radio * 2,
			y_pos_fin = y + radio + 100;
    	height = y_pos_ini + y_pos_fin;
        r.text(x_pos_ini, height/2, chart_label).attr({"font-family":titles_font, 
            "font-size":"22",
            "transform": "r-90",
            "text-anchor":"middle"});    	
    }

    function exportSvg() {
        var svgString = r.toSVG();
        var a = document.createElement('a');
        a.download = 'piechart.svg';
        a.type = 'image/svg+xml';

        var blob = new Blob([svgString], {type: 'image/svg+xml'});

        a.href = (window.URL || webkitURL).createObjectURL(blob);
        a.click();
    };
    
    function saveChart() {
        var svgString = r.toSVG();
        var a = document.createElement('a');
        a.download = 'piechart.svg';
        a.type = 'image/svg+xml';

        var blob = new Blob([svgString], {type: 'image/svg+xml'});

        a.href = (window.URL || webkitURL).createObjectURL(blob);
        if($.browser.mozilla){
        	document.location = a.href;
        } else {
        	a.click();
        }
    };
    
    $(document).ready(function() {
        $("#save_chart").click(saveChart);
        $("#generate_chart").click(function() {
        	generateChart();
        });
    });

    function generateChart(){
    	eval(getConfiguration());
    	var data = getChartData();
    	if(drawPieChart(chart_title, chart_label, height, width, 
        		chart_labels_position, chart_labels_color, show_chart_labels, 
        		titles_font, show_legend, rtl, symbol_position, stroke, exploded, radio, data)){
        	enableButton('save_chart');
        }
    }
})();