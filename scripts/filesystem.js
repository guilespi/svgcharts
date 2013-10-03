if (typeof Filesystem !== 'object') {
    Filesystem = {};
}

(function() {

    function saveContent(content, fileName, extension, type) {
        var a = document.createElement('a');  
        a.download = fileName + '.' + extension;
        a.type = type;
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
            saveContent(svgString, fileName, "svg", 'image/svg+xml');
        }
    };

    function saveData(bundle) {
        //the name of the file to save is going to be determined by the chart title
        //changing spaces by _, lowercasing the title and removing non alfanum symbols
        var fileName = bundle.config.chart_title.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
        var content = JSON.stringify(bundle);
        saveContent(content, fileName, "chart", "application/json");
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