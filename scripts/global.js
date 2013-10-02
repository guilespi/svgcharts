var groups = [], series = [], data = [];
var edited_group, edited_serie, edited_value;

function Data(id, group, serie, value){
	this.id = id;
	this.group = group;
	this.serie = serie;
	this.value = value;
	this.name = (group && serie ? group.name.replace(' ','') + '_' + serie.name.replace(' ','') : '');
	this.validate = function(){
		if(this.group == null){
			alert('Select a group');
			return false;
		}
		if(this.serie == null){
			alert('Select a serie');
			return false;
		}		
		if(!this.value){
			alert('Enter some value');
			return false;
		}
		return true;
	};
}

Data.next_id = 1;

function Group(id, name){
	this.id = id;
	this.name = name;
	this.series = [];
	this.addSerie = function(serie, value){
		var s = new Serie(serie.id, serie.name, serie.color, serie.dot_type);
		s.addValue(value);
		this.series.push(s);
	};
	this.validate = function(){
		if(this.name.length == 0){
			alert('Add a group name');
			return false;
		}
		if(isInvalidText(this.name)){
			alert('Invalid characters in group name');
			return false;
		}
		if(groups.contains(this)){
			alert('Group already exists');
			return false;
		}
		return true;
	};
	this.equals = function(other){
		return this.name == other.name;
	};
}

Group.next_id = 1;

function Serie(id, name, color, dot_type){
	this.id = id;
	this.name = name;
	this.color = color;
	this.dot_type = dot_type;
	this.value;
	this.symbol;
	this.group_name;
	this.addValue = function(value){
		this.value = value.match(/[\-]*[\d]+[\.,]*[\d]*/g)[0];
		this.symbol = $.trim(value.replace(this.value, ""));
		this.value = parseFloat(this.value);
	};
	this.validate = function(){
		if(this.name.length == 0){
			alert('Add a serie name');
			return false;
		}
		if(isInvalidText(this.name)){
			alert('Invalid characters in serie name');
			return false;
		}
		if(series.contains(this)){
			alert('Serie already exists');
			return false;
		}
		return true;
	};
	this.equals = function(other){
		return this.name == other.name;
	};
}

Serie.next_id = 1;

Array.prototype.indexOfId = function(obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == obj.id) {
            return i;
        }
    }
    return -1;
};

Array.prototype.indexOf = function(obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].toString() == obj.toString()) {
            return i;
        }
    }
    return -1;
};

Array.prototype.indexOfName = function(obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].name == obj.name) {
            return i;
        }
    }
    return -1;
};

Array.prototype.contains = function(obj) {
	return this.indexOfName(obj) > -1;
};


Array.prototype.remove = function(obj) {
    var idx = this.indexOfId(obj);
    if(idx > -1){
    	this.splice(idx, 1);
    }
};

Array.prototype.get = function(id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        }
    }
    return null;
};

function getRandomNumber(min, max) {
    var random = Math.floor(Math.random() * (max - min + 1)) + min;
    return random;
};

function addCommasToNumber(number) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function parseChartData(data){
	var groups = JSON.parse(data);
	if(!groups || groups.length == 0){
		alert('Add some data to the chart');
		return;
	}
	var chart_data = [], series_colors = [], groups_names = [], series_names = [], symbols = [],
	dot_types = [], group, serie = [], serie_symbol = [];
	if(groups.length == 1){
		group = groups[0];
		groups_names.push(group.name);
		var serie_name, is_single_serie = true;
		for(var i=0; i<group.series.length; i++){
			if(!serie_name){
				serie_name = group.series[i].name; 
			} else if(group.series[i].name != serie_name){
				is_single_serie = false;
				break;
			}
		}
		for(var i=0; i<group.series.length; i++){
			if(is_single_serie){
				serie.push(group.series[i].value);
				serie_symbol.push(group.series[i].symbol);
			}
			else{
				chart_data.push(group.series[i].value);
				symbols.push(group.series[i].symbol);
			}
			series_colors.push(group.series[i].color);
			series_names.push(group.series[i].name);
			dot_types.push(group.series[i].dot_type);
		}
		if(is_single_serie){
			chart_data.push(serie);
			symbols.push(serie_symbol);
		}
	} else {
		var prev_group, group_serie;
		var groups_series = [];
		for(var i=0; i<groups.length; i++){
			group = groups[i];
			groups_names.push(group.name);
			for(var j=0; j<group.series.length; j++){
				//check if data entered is consistent
				if(prev_group && (prev_group.series.length != group.series.length || !prev_group.series.contains(group.series[j]))){
					alert('All groups must have the same series, check the data entered');
					return;
				}
				group_serie = group.series[j];
				group_serie.group_name = group.name;
				groups_series.push(group.series[j]);
			}
			prev_group = group;
		}
		groups_series.sort(function(a,b){
			if(a.name > b.name){
				return 1;
			}
			if(a.name < b.name){
				return -1;
			}
			if(groups_names.indexOf(a.group_name) > groups_names.indexOf(b.group_name)){
				return 1;
			}
			if(groups_names.indexOf(a.group_name) < groups_names.indexOf(b.group_name)){
				return -1;
			}
			return 0;
		});
		var previous;
		for(var i=0; i<groups_series.length; i++){
			previous = groups_series[i];
			for(var j=i; j<groups_series.length && groups_series[j].name == previous.name; j++){
				serie.push(groups_series[j].value);
				serie_symbol.push(groups_series[j].symbol);
				i=j;
			}
			chart_data.push(serie);
			symbols.push(serie_symbol);
			series_colors.push(groups_series[i].color);
			series_names.push(groups_series[i].name);
			dot_types.push(groups_series[i].dot_type);
			serie = [];	
			serie_symbol = [];
		}
	}
	var data_bundle = new Array();
	data_bundle["data"] = chart_data;
	data_bundle["colors"] = series_colors;
	data_bundle["groups"] = groups_names;
	data_bundle["series"] = series_names;
	data_bundle["symbols"] = symbols;
	data_bundle["dot_types"] = dot_types;
	return data_bundle;
}

function getChartData(){
	var chart_data = [];
	var group, serie, value, chart_group, idx;
	for(var i=0; i < data.length; i++){
		group = data[i].group;
		serie = data[i].serie;
		value = data[i].value;
		chart_group = new Group(group.id, group.name);
		idx = chart_data.indexOfName(chart_group);
		if(idx < 0){
			chart_data.push(chart_group);
		} else {
			chart_group = chart_data[idx];
		}
		chart_group.addSerie(serie, value);
	}
	return JSON.stringify(chart_data);
}

function getConfiguration(){
    var config = {
        chart_title: $("#chart_title").val(),
	chart_label: $("#chart_label").val(),
	height: $("#height").val(),
        width: $("#width").val(),
	radio: ($("#radio").val() || 100),
	min_scale_value: $("#min_scale_value").val(),
	max_scale_value: $("#max_scale_value").val(),
	scale_auto: $("#scale_auto").is(':checked'),
	stroke: $("#stroke").is(':checked'),
	exploded: $("#exploded").is(':checked'),
	x_axis_on_zero: $("#x_axis_on_zero").is(':checked'),
        symbol_position: $("#symbol_position").val(),
	orientation: $("#orientation").val(),
	titles_font: $("#titles_font").val(),
	scale_intervals: $("#scale_intervals").val(),
	show_groups_labels: $("#show_groups_labels").is(':checked'),
	show_groups_background: $("#show_groups_background").is(':checked'),
	chart_labels_position: $("#chart_labels_position").val(),
	chart_labels_color: '#' + $("#chart_labels_color").val(),
	grid_lines_color: '#' + $("#grid_lines_color").val(),
	background_color: '#' + $("#background_color").val(),
	label_background_color: '#' + $("#label_background_color").val(),
	label_text_color: '#' + $("#label_text_color").val(),
	fit_scale: $("#fit_scale").is(':checked'),
	show_scale: $("#show_scale").is(':checked'),
	show_axis: $("#show_axis").is(':checked'),
	show_gridlines: $("#show_gridlines").is(':checked'),
	show_chart_labels: $("#show_chart_labels").is(':checked'),
	show_legend: $("#show_legend").is(':checked'),
	rtl: $("#rtl").is(':checked'),
	use_background_color: $("#use_background_color").is(':checked')
    };
    return config;
}

function loadConfiguration(config) {
    $("#chart_title").val(config.chart_title);
    $("#chart_label").val(config.chart_label);
    $("#height").val(config.height);
    $("#width").val(config.width);
    $("#radio").val(config.radio);
    $("#min_scale_value").val(config.min_scale_value);
    $("#max_scale_value").val(config.max_scale_value);
    $("#scale_auto").attr("checked", config.scale_auto);
    $("#stroke").attr("checked", config.stroke);
    $("#exploded").attr("checked", config.exploded);
    $("#x_axis_on_zero").attr("checked", config.x_axis_on_zero);
    $("#symbol_position").val(config.symbol_position);
    $("#orientation").val(config.orientation);
    $("#titles_font").val(config.titles_font);
    $("#scale_intervals").val(config.scale_intervals);
    $("#show_groups_labels").attr('checked', config.show_groups_labels);
    $("#show_groups_background").attr('checked', config.show_groups_background),
    $("#chart_labels_position").val(config.chart_labels_position);
    $("#chart_labels_color").val(config.chart_labels_color.substr(1));
    $("#grid_lines_color").val(config.grid_lines_color.substr(1));
    $("#background_color").val(config.background_color.substr(1));
    $("#label_background_color").val(config.label_background_color.substr(1));
    $("#label_text_color").val(config.label_text_color.substr(1));
    $("#fit_scale").attr('checked', config.fit_scale);
    $("#show_scale").attr('checked', config.show_scale);
    $("#show_axis").attr('checked', config.show_axis);
    $("#show_gridlines").attr('checked', config.show_gridlines);
    $("#show_chart_labels").attr('checked', config.show_chart_labels);
    $("#show_legend").attr('checked', config.show_legend);
    $("#rtl").attr('checked', config.rtl);
    $("#use_background_color").attr('checked', config.use_background_color)
}

function evalConfiguration(){
    var config = getConfiguration();
    for (var name in config) {
        if (config.hasOwnProperty(name)) {
            window[name] = config[name];
        }
    }
}

function roundUp(number, fit){
	if(number < 0){
		number = Math.floor(number);
	} else {
		number = Math.ceil(number);
	}
	var str_number = Math.abs(number).toString();
	var length = (fit ? (str_number.length == 1 ? str_number.length : str_number.length - 1) : str_number.length);
	var dividend = parseInt("1" + Array(length).join("0"));
	if(dividend){
		if(number < 0){
			return Math.floor(number/dividend)*dividend;
		} else {
			return Math.ceil(number/dividend)*dividend;
		}
	}
	return number;
}

function addToCombo(comboName, value, text){
	var select = document.getElementById(comboName);
	if(select == null){
		return;
	}
	var option = document.createElement("option");
	option.value = value;
	option.text = text;
	try{
		select.add(option, null);
	}		
	catch(ex){
		select.add(option);
	}
}

function removeFromCombo(comboName, value){
	$("#" + comboName + " option[value='" + value + "']").remove();
}

function editGroup(table){
	var row = $('#edit_' + edited_group.id).parents('tr');
	if(row.length > 0){
		var group_name = $('#group_name').val();
		var updated_group = new Group(edited_group.id, group_name);
		if(!updated_group.equals(edited_group) && !updated_group.validate()){
			return;
		}
		var old_name = edited_group.name; 
		edited_group.name = updated_group.name;
		//now we set the visible part
		row.children('td')[0].innerHTML = edited_group.name;
		//update combo
		removeFromCombo('group', edited_group.id);
		addToCombo('group', edited_group.id, edited_group.name);
		//update data
		var value_group;
		$('[name="value_data"]').each(function(){
			value_group = $(this).children('td')[0];
			if(value_group.innerHTML == old_name){
				value_group.innerHTML = edited_group.name;
			}
		});
		edited_group = null;
		$('#group_name').val('');
	} else { 						//if select edit and then delete the row
		edited_group = null;
		addGroup(table);
	}
}

function addGroup(table) {
	if(edited_group){
		editGroup(table);
		return;
	}
	var group_name = $('#group_name').val(),
		group_id = 'group_' + Group.next_id.toString();

	var group = new Group(group_id, group_name);
	if(!group.validate()){
		return;
	}
	groups.push(group);
	Group.next_id++;
	//now we set the visible part
	var tr = document.createElement('tr'),
		td1 = document.createElement('td'),
		td2 = document.createElement('td'),
		td3 = document.createElement('td'),
		img1 = document.createElement('img'),
		img2 = document.createElement('img');
	
	td1.setAttribute('colspan', 2);
	img1.setAttribute('id', 'delete_' + group.id);
	img1.setAttribute('src', 'img/delete.png');
	img2.setAttribute('id', 'edit_' + group.id);
	img2.setAttribute('src', 'img/edit.png');
	
	td1.appendChild(document.createTextNode(group.name));
	td2.appendChild(img1);
	td3.appendChild(img2);
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	table.append(tr);
	$('#delete_' + group.id).click(function(){
		groups.remove(group);
		//now we remove the visible part
		$(this).parents('tr').remove();
		removeFromCombo('group', group.id);
	});
	$('#edit_' + group.id).click(function(){
		edited_group = group;
		$('#group_name').val(edited_group.name);
	});
	$('#group_name').val('');
	addToCombo('group', group.id, group.name);
}

function editSerie(table){
	var row = $('#edit_' + edited_serie.id).parents('tr');
	if(row.length > 0){
		var serie_name = $('#serie_name').val(),
			serie_color = '#' + $('#serie_color').val(),
			dot_type = $('#dot_type').val();
		var updated_serie = new Serie(edited_serie.id, serie_name, serie_color, dot_type);
		if(!updated_serie.equals(edited_serie) && !updated_serie.validate()){
			return;
		}
		var old_name = edited_serie.name;
		edited_serie.name = updated_serie.name;
		edited_serie.color = updated_serie.color,
		edited_serie.dot_type = updated_serie.dot_type;
		//now we set the visible part
		row.find('div').css('background-color', edited_serie.color);
		if(dot_type != null){
			row.children('td')[0].innerHTML = edited_serie.dot_type;
			row.children('td')[1].innerHTML = edited_serie.name;
		} else {
			row.children('td')[0].innerHTML = edited_serie.name;
		}
		//update combo
		removeFromCombo('serie', edited_serie.id);
		addToCombo('serie', edited_serie.id, edited_serie.name);
		//update data
		var value_group;
		$('[name="value_data"]').each(function(){
			value_serie = $(this).children('td')[1];
			if(value_serie.innerHTML == old_name){
				value_serie.innerHTML = edited_serie.name;
			}
		});
		edited_serie = null;
		$('#serie_name').val('');
	} else { 						//if select edit and then delete the row
		edited_serie = null;
		addSerie(table);
	}
}

function addSerie(table) {
	if(edited_serie){
		editSerie(table);
		return;
	}
	var serie_name = $('#serie_name').val(),
		serie_color = '#' + $('#serie_color').val(),
		serie_id = 'serie_' + Serie.next_id.toString(),
		dot_type = $('#dot_type').val();
	
	var serie = new Serie(serie_id, serie_name, serie_color, dot_type);
	if(!serie.validate()){
		return;
	}
	series.push(serie);
	Serie.next_id++;
	//now we set the visible part
	var tr = document.createElement('tr'),
		th = document.createElement('th'),
		td0 = document.createElement('td'),
		td1 = document.createElement('td'),
		td2 = document.createElement('td'),
		td3 = document.createElement('td'),
		img1 = document.createElement('img'),
		img2 = document.createElement('img'),
		div_color = document.createElement('div');
	
	img1.setAttribute('id', 'delete_' + serie.id);
	img1.setAttribute('src', 'img/delete.png');
	img2.setAttribute('id', 'edit_' + serie.id);
	img2.setAttribute('src', 'img/edit.png');
	div_color.className = 'serie_color';
	div_color.style.background = serie.color;
	
	th.appendChild(div_color);
	td1.appendChild(document.createTextNode(serie.name));
	td2.appendChild(img1);
	td3.appendChild(img2);
	tr.appendChild(th);
	if(dot_type != null){
		td0.appendChild(document.createTextNode(serie.dot_type));
		tr.appendChild(td0);
	}
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	table.append(tr);
	$('#delete_' + serie.id).click(function(){
		series.remove(serie);
		//now we remove the visible part
		$(this).parents('tr').remove();
		removeFromCombo('serie', serie.id);
	});
	$('#edit_' + serie.id).click(function(){
		edited_serie = serie;
		$('#serie_name').val(edited_serie.name);
		$('#serie_color').val(edited_serie.color.replace('#',''));
		$('#serie_color').css('background-color', edited_serie.color);
		if(dot_type != null){
			$('#dot_type').val(edited_serie.dot_type);
		}
	});
	$('#serie_name').val('');
	addToCombo('serie', serie.id, serie.name);
}

function editValue(table){	
	var row = $('#edit_' + edited_value.id).parents('tr');
	if(row.length > 0){
		var group = groups.get($('#group').val()),
			serie = series.get($('#serie').val()),
			value = $('#value_data').val();
		var updated_value = new Data(edited_value.id, group, serie, value);
		if(!updated_value.validate()){
			return;
		}
		edited_value.group = updated_value.group;
		edited_value.serie = updated_value.serie;
		edited_value.value = updated_value.value;
		//now we set the visible part
		row.children('td')[0].innerHTML = edited_value.group.name;
		row.children('td')[1].innerHTML = edited_value.serie.name;
		row.children('td')[2].innerHTML = edited_value.value;
		edited_value = null;
		$('#value_data').val('');
	} else { 						//if select edit and then delete the row
		edited_value = null;
		addValue(table);
	}
}

function addValue(table) {
	if(edited_value){
		editValue(table);
		return;
	}
	var group = groups.get($('#group').val()),
		serie = series.get($('#serie').val()),
		value = $('#value_data').val(),
		data_id = 'value_' + Data.next_id.toString();

	var d = new Data(data_id, group, serie, value);
	if(!d.validate()){
		return;
	}
	data.push(d);
	Data.next_id++;
	//now we set the visible part
	var tr = document.createElement('tr'),
		td1 = document.createElement('td'),
		td2 = document.createElement('td'),
		td3 = document.createElement('td'),
		td4 = document.createElement('td'),
		td5 = document.createElement('td'),
		img1 = document.createElement('img'),
		img2 = document.createElement('img');

	tr.setAttribute('name', 'value_data');
	img1.setAttribute('id', 'delete_' + d.id);
	img1.setAttribute('src', 'img/delete.png');
	img2.setAttribute('id', 'edit_' + d.id);
	img2.setAttribute('src', 'img/edit.png');
	
	td1.appendChild(document.createTextNode(d.group.name));
	td2.appendChild(document.createTextNode(d.serie.name));
	td3.appendChild(document.createTextNode(d.value));
	td4.appendChild(img1);
	td5.appendChild(img2);
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	tr.appendChild(td5);
	table.append(tr);
	$('#delete_' + d.id).click(function(){
		data.remove(d);
		//now we remove the visible part
		$(this).parents('tr').remove();
	});
	$('#edit_' + d.id).click(function(){
		edited_value = d;
		$('#group').val(edited_value.group.id);
		$('#serie').val(edited_value.serie.id);
		$('#value_data').val(edited_value.value);
	});
	$('#value_data').val('');
}

function validateSettings(){
	var scale_intervals =  $('#scale_intervals').val(),
		width = $('#width').val(),
		height = $('#height').val(),
		radio = $('#radio').val(),
		scale_auto = $("#scale_auto").is(':checked'),
		min_scale_value = $('#min_scale_value').val(),
		max_scale_value = $('#max_scale_value').val();
	if(scale_intervals != null && (!isNumeric(scale_intervals) || scale_intervals < 1)){
		alert('Scale interval must be numeric and greater than 0');
		return false;
	}
	if(width != null && (!isNumeric(width) || width < 1)){
		alert('Width must be numeric and greater than 0');
		return false;
	}
	if(height != null && (!isNumeric(height) || height < 1)){
		alert('Height must be numeric and greater than 0');
		return false;
	}
	if(radio != null && (!isNumeric(radio) || radio < 1)){
		alert('Radio must be numeric and greater than 0');
		return false;
	}
	if(isInvalidText($('#titles_font').val())){
		alert('Enter some font for the title');
		return false;
	}
	if(min_scale_value != null && min_scale_value != null && !scale_auto 
			&& (parseFloat(min_scale_value) >= parseFloat(max_scale_value) 
					|| !isNumeric(min_scale_value) || !isNumeric(max_scale_value))){
		alert('Enter correct values for scale min and max');
		return false;
	}
	return true;
}

function isInvalidText(text){
    return !text || text.length == 0;
}

function isNumeric(text){
    var re = new RegExp("[^0-9\\.\\-]");
    return !re.test(text) && text.lastIndexOf('-') < 1;
}

function disableButton(button_id){
    $('#'+button_id).attr("disabled", "disabled");
    $('#'+button_id).addClass("disabled_button");    	
}

function enableButton(button_id){
    $('#'+button_id).removeAttr('disabled');
    $('#'+button_id).removeClass("disabled_button");    	
}

$(document).ready(function() {
    $(".popup").hide();
    disableButton('save_chart');
    
	$('#config').click(function(e){
		popup('config_chart_container', e);
	});
	$('#close_config').click(function(e){
		if(validateSettings()){
			popup('config_chart_container', e);	
		}
	});
	$('#chart_data').click(function(e){
		popup('data_chart_container', e);
	});
	$('#close_data').click(function(e){
		popup('data_chart_container', e);
	});
	$('#add_group').click(function(){
		addGroup($(this).parents('table'));
	});
	$('#add_serie').click(function(){
		addSerie($(this).parents('table'));
	});
	$('#add_value').click(function(){
		addValue($(this).parents('table'));
	});
	BrowserDetect.init();
});

var BrowserDetect = {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent)
				|| this.searchVersion(navigator.appVersion)
				|| "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
		},
		searchString: function (data) {
			for (var i=0;i<data.length;i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},
		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{ 	string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera",
				versionSearch: "Version"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{ 		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],
		dataOS : [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
				   string: navigator.userAgent,
				   subString: "iPhone",
				   identity: "iPhone/iPod"
		    },
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]
};