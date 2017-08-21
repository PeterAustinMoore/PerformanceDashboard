type = ['','info','success','warning','danger'];


visuals = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },

    initChartist: function(d, t, goalId, budget){
    function ctPointLabels(options) {
      return function ctPointLabels(chart) {
      var defaultOptions = {
        labelClass: 'ct-label',
        labelOffset: {
          x: 0,
          y: -15
        },
        textAnchor: 'middle'
      };

      options = Chartist.extend({}, defaultOptions, options);

      if(chart instanceof Chartist.Bar) {
        chart.on('draw', function(data) {
          if(data.type === 'bar' && data.seriesIndex == 1) {
            data.group.elem('text', {
              x: data.x2 + options.labelOffset.x,
              y: data.y1 + options.labelOffset.y,
                style: 'text-anchor: ' + options.textAnchor
            }, options.labelClass).text("$"+addCommas(data.value.x));
          }
        });
      }
    }
  }
      function addCommas(nStr) {
          nStr += '';
          if(nStr == 'NaN') {
            return 'N/A';
          }
          var x = nStr.split('.');
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
              x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }
          return x1 + x2;
      }


      new Chartist.Bar('#budget-chart', {
        labels: ['Expense to Budget'],
        series: [
          [+budget["expenses"]],
          [+budget["budget"]]
        ]
        }, {
        seriesBarDistance: 0,
        reverseData: true,
        horizontalBars: true,
        axisX: {
          labelInterpolationFnc: function(value) {
            return "$"+addCommas(value);
          },
          type: Chartist.FixedScaleAxis,
          low:0,
          ticks:[0, budget["budget"]]
        },
        axisY: {
          offset: 70
        },
        plugins: [
          ctPointLabels({
            textAnchor: 'middle'
          })
        ]
        });

        var data = {
              series: [
                {
                  name: 'series-1',
                  data: d
                },
                {
                  name: 'target',
                  data: t
                }
              ]
            };

        var options = {
            axisX: {
              type: Chartist.FixedScaleAxis,
              divisor: 5,
              labelInterpolationFnc: function(value) {
                return moment(value).format('MMM YYYY');
              }
            },
            low:0
          };

        var goal = '#goal-'+goalId;
        Chartist.Line(goal, data, options);

    },

    newChart: function(d, t, goalId) {
      var data = {
            series: [
              {
                name: 'series-1',
                data: d
              },
              {
                name: 'target',
                data: t
              }
            ]
          };

      var options = {
          axisX: {
            type: Chartist.FixedScaleAxis,
            divisor: 5,
            labelInterpolationFnc: function(value) {
              return moment(value).format('MMM YYYY');
            }
          },
          low:0
        };

      Chartist.Line("#goal-"+goalId, data, options);
    }
}
