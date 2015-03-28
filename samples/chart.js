google.load('visualization', '1', {
    packages: ['corechart', 'line']
});
google.setOnLoadCallback(drawBasic);
    var data ;
   var chart;
   var options ;
function drawBasic() {

     data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Dogs');

    data.addRows([

        [48, 72],
        [49, 68],
        [50, 66],
        [51, 65],
        [52, 67],
        [53, 70],
        [54, 71],
        [55, 72],
        [56, 73],
        [57, 75],
        [58, 70],
        [59, 68],
        [60, 64],
        [61, 60],
        [62, 65],
        [63, 67],
        [64, 68],
        [65, 69],
        [66, 70],
        [67, 72],
        [68, 75],
        [69, 80]
    ]);

     options = {
       
		        backgroundColor: {
				fill:	'#E4E4E4',
        stroke: '#4322c0',
        strokeWidth: 1,
            
    },
           'width':184,
                     'height':36,
        hAxis: {
            textPosition: 'none',
            gridlines: {
                color: 'transparent'
            },
            baseline: {
                color: 'transparent'
            },
        },
        vAxis: {
            textPosition: 'none',
            gridlines: {
                color: 'transparent'
            },
            baseline: {
                color: 'transparent'
            },
        },
        legend: {
            position: 'none'
        },
        enableInteractivity: false,
        tooltip: {
            trigger: 'none'
        },
        chartArea: {
            left:2,
            top:2,
            width:180 ,     
            height:32 ,
  
            
}
        
    };

     chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);
}