nv.addGraph(function() {
  var chart = nv.models.bulletChart();

  d3.select('#chart svg')
      .datum(exampleData())
      .transition().duration(1000)
      .call(chart);

  return chart;
});


function exampleData() {
  return {
    "title":"Budget vs Actual",		//Label the bullet chart
    "subtitle":"US $, in thousands",		//sub-label for bullet chart
    "ranges":[0,0,400],	 //Minimum, mean and maximum values.
    "measures":[220],		 //Value representing current measurement (the thick blue line in the example)
    "markers":[100,200,300,400], //Place a marker on the chart (the white triangle marker)
    "shape":"square"
  };
}
