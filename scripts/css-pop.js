function toggle(div_id) {
	var el = document.getElementById(div_id);
	if ( el.style.display == 'none' ){
		$('#'+div_id).fadeIn('slow');
	} else {
		$('#'+div_id).fadeOut('slow');
	}
}
function blanket_size(popUpDivVar, y) {
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight;
	} else {
		viewportheight = document.documentElement.clientHeight;
	}
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	var blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv_height = (blanket_height-$('#'+popUpDivVar).height())/6;
	popUpDiv_height = (popUpDiv_height < 10 ? 10 : popUpDiv_height);
	popUpDiv.style.top = popUpDiv_height + 'px';
}
function window_pos(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}
	window_width=(window_width-$('#'+popUpDivVar).width())/2;
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv.style.left = window_width + 'px';
}
function popup(windowname, e) {
    if (!e) e = window.event;
    var x, y;
    if (window.opera) {
        x = e.clientX;
        y = e.clientY;
    } else if (document.all) {
        x = document.body.scrollLeft + e.clientX;
        y = (document.documentElement ? document.documentElement.scrollTop :
            document.body.scrollTop) + e.clientY;
    } else if (document.layers || document.getElementById) {
        x = e.pageX;
        y = e.pageY;
    }
	blanket_size(windowname, y);
	window_pos(windowname, x);
	toggle('blanket');
	toggle(windowname);		
}