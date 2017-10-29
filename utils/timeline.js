(function($, window, document) {



  $(function() {

    var file_ = 'ged50';
    var file = 'fake-data'

    d3.csv('../conflict-project/json/' + file + '.csv', function(error, data) {
      if (error) throw error;

      var dataByCountryArr = d3.nest()
        .key(function(d) {
          return d.country;
        })
        .sortKeys(d3.descending)
        .entries(data);

      var counter = -1;

      var dataByCountryObj = d3.nest()
        .key(function(d) {
          return d.key;
        })
        .rollup(function(v) {
          counter++;
          return {
            pos: counter
          }
        })
        .object(dataByCountryArr);

      // set the dimensions and margins of the graph
      var xAxisM = 10,
        yAxisM = 10,
        hCountryAxis = 14;
      var margin = { top: 50, right: 50, bottom: 60, left: (150 + yAxisM) },
        width = $(window).width() - margin.left - margin.right - yAxisM,
        height = (dataByCountryArr.length * hCountryAxis) - margin.top - margin.bottom;

      // set the ranges
      var x = d3.scaleTime().range([0, width]);
      var y = d3.scaleLinear().range([height, 0]);


      var svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right + yAxisM)
        .attr('height', height + margin.top + margin.bottom + xAxisM)
        .append('g')
        .attr('transform',
          'translate(' + margin.left + ',' + margin.top + ')');


      //______________

      var timeAxis = d3.axisBottom(x)
        .ticks(50);
      var countryAxis = d3.axisLeft(y)
        .ticks(dataByCountryArr.length);



      // format the data
      data.forEach(function(d, i) {

        var day = new Date(d.date_start);
        var dayWrapper = moment(day);

        var dayEnd = new Date(d.date_end);
        var dayWrapperEnd = moment(dayEnd);

        d.date_start = dayWrapper;
        d.date_end = dayWrapperEnd;


        var a = dayWrapper;
        var b = dayWrapperEnd;

        d.days = dayWrapperEnd.diff(dayWrapper, 'days') === 0 ? 1 : b.diff(a, 'days');

      });

      var numDays = 30;

      x.domain(d3.extent(data, function(d) { return d.date_start; }));
      y.domain([0, dataByCountryArr.length - 1]);



      var daysScale = d3.scaleLog()
        .domain([d3.min(data, function(d) { return d.days; }), d3.max(data, function(d) { return d.days; })])
        .range([1, numDays])

      var white = '#FFFFFF';
      var blue = '#60c1dc';
      var pink = '#e68fc3';
      var orange = '#f7cd83';
      var green = '#55e851';
      var violet = '#a651e8';
      var red = '#e85151';
      var yellow = '#f7e883';

      var colors = chroma
        .scale([blue, violet, pink, red, yellow, orange]).colors(numDays);

      var hDot = 10;

      svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attrs({
          'class': 'unit',
          'width': function(d) {
            //return r(d.days);
            return 1;
          },
          'height': function(d) {
            //return r(d.days);
            return hDot;
          },
          'x': function(d) {
            return x(d.date_start);
          },
          'y': function(d) {
            return y(dataByCountryObj[d.country].pos) - (hDot / 2);
          }
        })
        .styles({
          'fill': function(d) {
            return colors[Math.round(daysScale(d.days))]
          }
        });


      // Add the x Axis
      var gxAxis = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + (height + xAxisM) + ')')
        .call(timeAxis);

      gxAxis
        .selectAll('text')
        .attr('y', 0)
        .attr('x', 9)
        .attr('dy', '.35em')
        .attr('dx', '-20px')
        .attr('transform', 'rotate(270)')
        .style('text-anchor', 'end');

      gxAxis
        .selectAll('line')
        .attrs({
          'y1' : (height + xAxisM) * -1 
        })



      // Add the Y Axis
      var gyAxis = svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + (yAxisM * -1) + ',0)')
        .call(countryAxis);

      gyAxis
        .selectAll('text')
        .text(function(d, i) {
          return dataByCountryArr[i].key;
        });

      gyAxis
        .selectAll('line')
        .attrs({
          'x2' : width + yAxisM
        })  

    }); //---GET DATA    

  }); ///--- ON READY


}(window.jQuery, window, document));