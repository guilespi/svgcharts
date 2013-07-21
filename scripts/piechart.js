(function() {
    var r;

    function drawPieChart() {
        // Creates canvas 640 × 480 at 10, 50
        r = Raphael(10, 50, 640, 480);
        // Creates pie chart at with center at 320, 200,
        // radius 100 and data: [55, 20, 13, 32, 5, 1, 2]
        r.piechart(320, 240, 100, [9,11, 1,2], { legend:["uno", "dos", "tres", "cuatro"], colors:["red", "blue", "yellow", "green"], stroke: "#000000" });
    };

    function exportSvg() {
        var svgString = r.toSVG();
        var a = document.createElement('a');
        a.download = 'piechart.svg';
        a.type = 'image/svg+xml';

        var blob = new Blob([svgString], {type: 'image/svg+xml'});

        a.href = (window.URL || webkitURL).createObjectURL(blob);
        a.click();
    };

    $(document).ready(function() {
        drawPieChart();
        $("#export").click(exportSvg);
    });

})();