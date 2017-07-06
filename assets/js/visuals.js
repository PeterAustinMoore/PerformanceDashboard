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

    initChartist: function(goalId){
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
        var data = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [null, null, 42, null, null, 62, null, null, 60, null, null, null],
            [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
            [null, null, null, null, null, null, null, null, 60, null, null, 80],
            [null, null, null, null, null, null, null, null, 60, null, null, 90],
            [null, null, null, null, null, null, null, null, 60, null, null, 70]
          ]
        };

        var options = {
            fullWidth: true,
            seriesBarDistance: 10,
            axisX: {
                showGrid: true
            },
            low: 0,
            height: "245px",
            lineSmooth: Chartist.Interpolation.cardinal({
                fillHoles: true
            })
        };
        var goal = '#goal-'+goalId;
        console.log(goal);
        Chartist.Line(goal, data, options);
    },
    newChart: function(goalId) {
      var data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          [null, null, 42, null, null, 62, null, null, 60, null, null, null],
          [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
          [null, null, null, null, null, null, null, null, 60, null, null, 80],
          [null, null, null, null, null, null, null, null, 60, null, null, 90],
          [null, null, null, null, null, null, null, null, 60, null, null, 70]
        ]
      };

      var options = {
          fullWidth: true,
          seriesBarDistance: 10,
          axisX: {
              showGrid: true
          },
          low: 0,
          height: "245px",
          lineSmooth: Chartist.Interpolation.cardinal({
              fillHoles: true
          })
      };

      Chartist.Line("#goal-"+goalId, data, options);
    }
}
