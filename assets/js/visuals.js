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
      var budget = {
              labels: ['Budget vs Actuals'],
              series: [
                [20]
              ]
            };


      var budgetOptions = {
          seriesBarDistance: 10,
          //reverseData: true,
          horizontalBars: true,
          axisX: {
            //type: Chartist.StepAxis,
            stretch:false,
            onlyInteger: true,
            low:0,
            offset:20
            //ticks:["Q1","Q2","Q3"]
            //scaleMinSpace:$('.ct-chart-bar').width()/4
          },
          axisY: {
            offset:100
          },
          high:100,
          height:60
        };

        Chartist.Bar('#chart', budget, budgetOptions);
        var cleanData = [];
        var cleanTarget = [];
        for(i in d) {
          nd = {x: Date.parse(d[i].x), y: d[i].y}
          try{
            nt = {x: Date.parse(t[i].x), y: t[i].y}
          } catch(e) {
            nt = {}
          }
          cleanData.push(nd);
          cleanTarget.push(nt);
        }

        var data = {
              series: [
                {
                  name: 'series-1',
                  data: cleanData
                },
                {
                  name: 'target',
                  data: cleanTarget
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
      var cleanData = [];
      var cleanTarget = [];
      for(i in d) {
        nd = {x: Date.parse(d[i].x), y: d[i].y}
        try {
          nt = {x: Date.parse(t[i].x), y: t[i].y}
        } catch(e) {
          nt = {}
        }
        cleanData.push(nd);
        cleanTarget.push(nt);
      }
      var data = {
            series: [
              {
                name: 'series-1',
                data: cleanData
              },
              {
                name: 'target',
                data: cleanTarget
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
