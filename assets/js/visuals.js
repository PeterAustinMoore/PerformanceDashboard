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

    initChartist: function(d, t, goalId){

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
