if (typeof Filesystem !== 'object') {
    Filesystem = {};
}

(function() {

    function saveContent(content, fileName, format) {
        var a = document.createElement('a');  
        a.download = fileName + '.' + format;
        a.type = 'image/' + format + '+xml';
        var blob = new Blob([content], {type: a.type});
        a.href = (window.URL || webkitURL).createObjectURL(blob);
        if($.browser.mozilla){
            document.location = a.href;
        } else {
            a.click();
        }
    };
    
    function saveChart(r, fileName, format) {
        var svgString = r.toSVG();
        if (format === "fxg") {
            $.ajax({ url: "svg2fxg.xsl", 
                     success: function(response, status, xhr) {
                         alert(response);
                     },
                     dataType: "jsonp"
                   });
        }
        else {
            saveContent(svgString, fileName, "svg");
        }
    };

    function saveData() {

    };

    function loadData(f, onLoad) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                onLoad(e.target.result);
            };
        })(f);
        reader.readAsText(f);
    };

    if (typeof Filesystem.saveChart !== "function") {
        Filesystem.saveChart = saveChart;
    }
    if (typeof Filesystem.saveData !== "function") {
        Filesystem.saveData = saveData;
    }
    if (typeof Filesystem.loadData !== "function") {
        Filesystem.loadData = loadData;
    }
})();