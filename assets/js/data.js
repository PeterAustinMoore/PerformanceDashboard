t = "";
data = {
  initData: function(base) {
    function getGoalInfo(base, g_id, dashboard, category) {
      var g_url = base + "/api/stat/v1/goals/" + g_id + ".json";
      var goalInfo = {"ontarget":0};
      $.ajax({
          url: g_url,
          async: false,
          dataType: 'json',
          success: function(data) {
            // Goals are messy and do not return all values or even consistent fields
            // Constants for all goals
            goalInfo["id"] = data["id"];
            goalInfo["name"] = data["name"];
            goalInfo["category"] = category;
            goalInfo["dashboard"] = dashboard;
            goalInfo["url"] = g_url;

            // Get the summary of the goal
            try {
              goalInfo["summary"] = data["prevailing_measure"]["name"];
            } catch(e) {
              goalInfo["summary"] = data["name"];
            }
            // Get the Unit
            try {
              goalInfo["unit"] = data["prevailing_measure"]["unit"];
            } catch(e) {
              goalInfo["unit"] = "";
            }
            // Get the updated date, if none, set to empty string
            try {
              goalInfo["updated"] = data["prevailing_measure"]["computed_values"]["metric"]["as_of"].substring(0,10);
            } catch(e) {
              goalInfo["updated"] = "";
            }
            // Get Current Value
            try {
              goalInfo["current_value"] = data["prevailing_measure"]["computed_values"]["metric"]["current_value"];
            } catch(e) {
              goalInfo["current_value"] = "N/A";
            }
            // Get the target
            try {
              goalInfo["target"] = data["prevailing_measure"]["target"]
            } catch(e) {
              goalInfo["target"] = 0
            }
            // Get Measure Data
            try {
              var measure = data["prevailing_measure"]["computed_values"]["progress"]["progress"];
              if(measure == "good" || measure == "within_tolerance") {
                goalInfo["ontarget"] = 1;
              }
            } catch(e) {
              goalInfo["ontarget"] = 0;
            }

            // Get the goal estimated Values
            try {
              goalInfo["X_Est"] = Date.parse(data["prevailing_measure"]["end"])
              goalInfo["Y_Est"] = data["prevailing_measure"]["computed_values"]["progress"]["prediction"]["estimated"];
              goalInfo["Y_High_Pred"] = data["prevailing_measure"]["computed_values"]["progress"]["prediction"]["pred_conf_int_high"]
              goalInfo["Y_Low_Pred"] = data["prevailing_measure"]["computed_values"]["progress"]["prediction"]["pred_conf_int_low"]
            } catch(e) {
              goalInfo["X_Est"] = "";
              goalInfo["Y_Est"] = 0;
              goalInfo["Y_High_Pred"] = 0;
              goalInfo["Y_Low_Pred"] = 0;
            }
            // Get the current graph values
            goalInfo["data"] = [];
            goalInfo["target_data"] = [];
            try {
              for(var m in data["prevailing_measure"]["computed_values"]["metric"]["date_values"]) {
                var t = {y: goalInfo["target"], x: Date.parse(data["prevailing_measure"]["computed_values"]["metric"]["date_values"][m])};
                var d = {y: data["prevailing_measure"]["computed_values"]["metric"]["values"][m],
                         x: Date.parse(data["prevailing_measure"]["computed_values"]["metric"]["date_values"][m])
                       };
                goalInfo["data"].push(d);
                goalInfo["target_data"].push(t);
              }
            } catch(e) {
              goalInfo["Y"] = [0];
              goalInfo["X"] = [0];
            }
          }
        });
      return goalInfo;
    }
    function getGoals(base, d_id, dashboard) {
      var d_url = base + "/api/stat/v1/dashboards/" + d_id + ".json";
      var ontarget = 0;
      var goalArray = [];
      $.ajax({
          url: d_url,
          async: false,
          dataType: 'json',
          success: function(data) {
            categories = data['categories'];
            for(var j in categories) {
              goals = categories[j]['goals'];
              for(var k in goals) {
                var goalInfo = getGoalInfo(base, goals[k]['id'],dashboard, categories[j]["name"])
                goalArray.push(goalInfo);
                ontarget += goalInfo["ontarget"];
              }
            }
          }
      });
      return [goalArray,ontarget];
    }

    var url = base + "/api/stat/v1/dashboards.json";
    var goalArray = Array();
    var count = 0;
    var ontarget = 0;
    var car = "";
    var txt = "";

    $.ajax({
        url: url,
        async: false,
        dataType: 'json',
        success: function(data) {
          for(var i in data) {
            d_id = data[i]['id'];
            dashboard = data[i]["name"];
            values = getGoals(base, d_id, dashboard);
            goalArray.push.apply(goalArray,values[0]);
            ontarget += values[1];
          }
        }
      });
      return [goalArray,ontarget];
    },
    computeOnTarget: function(ontarget) {
      document.getElementById("ontarget").innerHTML = "<p>On Target</p>"+ontarget.toString();
    },
    newOnTarget: function(goalArray) {
      var ontarget = 0;
      for(i in goalArray) {
        try {
          ontarget += goalArray[i]["ontarget"];
        } catch(e) {
          ontarget += 0;
        }
      }
      return ontarget;
    },
    computeCount: function(goalArray) {
      document.getElementById("goals").innerHTML = "<p>Goals</p>"+goalArray.length.toString();
    },
    computeContent: function(goalInfo) {
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

      var tiles = "";
      for(var i in goalInfo) {
        var goalTile =
        `<div><div class="row"><div class="col-md-12"><div class="card"><div class="content">
          <h2 class="db">`+goalInfo[i]["dashboard"]+`</h2></div></div></div></div>
          <div class="row"><div class="col-md-12"><div class="card"><div class="content">
          <h3 class="cat">`+goalInfo[i]["category"]+`</h3></div></div></div></div>
            <div class="row">
                <div class="col-md-4">
                  <div class="card" id="measure-`+goalInfo[i]["ontarget"]+`">
                    <div class="header">
                      <h3 class="title">`+goalInfo[i]["name"]+`</h3>
                    </div>
                    <div class="content">
                      <div id="current_value"><h1 class="title">
                        `;
                        if(goalInfo[i]["unit"] == "percent") {
                          var value = addCommas(Math.round(goalInfo[i]["current_value"]).toString());
                          goalTile += value === 'N/A' ? value : value + "%";
                        }
                        else if(goalInfo[i]["unit"] == "dollars"){
                          var value = addCommas(Math.round(goalInfo[i]["current_value"]).toString());
                          goalTile += value === 'N/A' ? value : "$" + value;
                        }
                        else {
                          goalTile += addCommas(Math.round(goalInfo[i]["current_value"]));
                        }
          goalTile += `
                      </h1></div>
                      <div class="footer">
                          <div class="chart-legend">
                              <i class="fa fa-circle text-info"></i>`+goalInfo[i]["unit"]+`
                          </div>
                          <hr>
                          <div class="stats">
                              <i class="ti-calendar"></i>`+goalInfo[i]["updated"]+`
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-8">
                  <div class="card">
                    <div class="header">
                      <h3 class="title">` + goalInfo[i]["name"]+`</h3>
                      <p class="category">`+ goalInfo[i]["summary"]+`</p>
                    </div>
                    <div class="content">
                      <div class="chart" id="goal-`+goalInfo[i]['id']+`"></div>
                      <div class="footer">
                        <div class="chart-legend">
                            <i class="fa fa-circle text-info"></i> `+goalInfo[i]["unit"]+`
                            <i class="fa fa-circle text-warning"></i> Target
                        </div>
                        <hr>
                        <div class="stats">
                            <i class="ti-calendar"></i> `+goalInfo[i]["updated"]+`
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>`;

          tiles += goalTile;
        }
        document.getElementById("blocks").innerHTML = tiles;
    },
    selectionContent: function(r) {
      t = '<fieldset id="page" data-role="controlgroup">';
      var map = {}
      for(var i = 0; i < r.length; i++){
        var obj = r[i]
        if(!(obj.dashboard in map)){
          map[obj.dashboard] = {};
        }
        if(!(obj.category in map[obj.dashboard])) {
            map[obj.dashboard][obj.category] = []
          }
      }
      for(var i = 0; i < r.length; i++) {
        var obj = r[i];
        map[obj.dashboard][obj.category].push(obj);
      }
      for(k in map) {
        template = '<div data-role="collapsible" class="searchResults"><h1>'+k+'</h1><p><a href="#" class="category" name="'+ k.replace(/\W+/g,"-") +'" data-role="button">Select All Categories</a></p>';
        for(c in map[k]) {
            var cat = '<div data-role="collapsible" class="searchResults" data-role="listview" data-filter="true" data-input="#filterable"><h1>' + c + '</h1><div id="filtered" data-role="listview" data-filter="true" data-input="#filterable">';
            template += cat;
            for(g in map[k][c]) {
              goal = '<label><input id="'+map[k][c][g]["id"]+'" class="goalcheck '+k.replace(/\W+/g,"-")+'" type="checkbox" name="goal" value=\''+ JSON.stringify(map[k][c][g])+ '\'/>' + map[k][c][g]["name"] + "</label>" ;
              template += goal;
            }
            template += "</div></div>";
          }
        template += "</div>";
        t += template;
      }
      t += "</fieldset>";
      document.getElementById("blocks").innerHTML = t;
    },
    computeContentBoard: function(goalInfo) {
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

      var tiles = '<div class="row">';
      for(var i in goalInfo) {
        goalTile=
        `  <div class="col-sm-3">
                  <div class="card" id="measure-`+goalInfo[i]["ontarget"]+`" style="height:250px">
                    <div class="header">
                      <h3 class="title">`+goalInfo[i]["name"]+`</h3>
                    </div>
                    <div class="content">
                      <div id="current_value"><h1 class="title">
                      `;
                      if(goalInfo[i]["unit"] == "percent") {
                        var value = addCommas(Math.round(goalInfo[i]["current_value"]).toString());
                        goalTile += value === 'N/A' ? value : value + "%";
                      }
                      else if(goalInfo[i]["unit"] == "dollars"){
                        var value = addCommas(Math.round(goalInfo[i]["current_value"]).toString());
                        goalTile += value === 'N/A' ? value : "$" + value;
                      }
                      else {
                        goalTile += addCommas(Math.round(goalInfo[i]["current_value"]));
                      }
        goalTile += `
                      </h1></div>
                      <div class="footer">
                          <div class="chart-legend">
                              <i class="fa fa-circle text-info"></i>`+goalInfo[i]["unit"]+`
                          </div>
                          <hr>
                          <div class="stats">
                              <i class="ti-calendar"></i>`+goalInfo[i]["updated"]+`
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                `;
          tiles += goalTile;
        }
        tiles += '</div>'
        document.getElementById("blocks").innerHTML = tiles;
    }
  };
