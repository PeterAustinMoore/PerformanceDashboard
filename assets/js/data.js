t = "";
data = {
  initData: function(base, b_url) {
    function getGoalInfo(base, g_id, dashboard, category, d_id, c_id) {
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
            goalInfo["api_url"] = g_url;
            goalInfo["url"] = base + "/stat/goals/" + d_id + "/" + c_id + "/" + g_id;

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
            if(data.hasOwnProperty("prevailing_measure")){
              if(data["prevailing_measure"].hasOwnProperty("comparison")) {
                var compare = data["prevailing_measure"]["comparison"]["comparison_function"] == ">" ? "More than " : "Less than ";
              } else {
                var compare = null;
              }

              if(data["prevailing_measure"].hasOwnProperty("baseline")) {
                goalInfo["target"] = [compare, data["prevailing_measure"]["baseline"]]
              }
              else if(data["prevailing_measure"].hasOwnProperty("target")) {
                goalInfo["target"] = [compare, data["prevailing_measure"]["target"]];
              }
              else {
                goalInfo["target"] = null;
              }
            }
            // Get Measure Data
            try {
              var measure = data["prevailing_measure"]["computed_values"]["progress"]["progress"];
              if(measure == "good" || measure == "within_tolerance") {
                goalInfo["ontarget"] = 1;
              }
              if(measure == "no_judgement" || measure == "needs_more_data") {
                goalInfo["ontarget"] = 2;
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
            try{
              var len = data["prevailing_measure"]["computed_values"]["metric"]["date_values"].length;
              goalInfo["dateValues"] = data["prevailing_measure"]["computed_values"]["metric"]["date_values"];
              if(len > 1) {
                for(var m in data["prevailing_measure"]["computed_values"]["metric"]["date_values"]) {
                  var t = goalInfo["target"] == null ? {y:null, x: Date.now()} : {y: goalInfo["target"][1], x: Date.parse(data["prevailing_measure"]["computed_values"]["metric"]["date_values"][m])};
                  var d = {y: data["prevailing_measure"]["computed_values"]["metric"]["values"][m],
                           x: Date.parse(data["prevailing_measure"]["computed_values"]["metric"]["date_values"][m])
                         };
                  goalInfo["data"].push(d);
                  goalInfo["target_data"].push(t);
                }

              } else {
                var t = goalInfo["target"] == null ? [{y:null, x: Date.now()}] : [{y: goalInfo["target"][1], x:Date.parse(goalInfo["updated"])},{y: goalInfo["target"][1], x:Date.now()}];
                var d = [{y:null, x: Date.parse(goalInfo["updated"]) - 15770000000}]
                if(data["prevailing_measure"]["computed_values"]["metric"]["values"][0] !== null){
                        d.push({y: data["prevailing_measure"]["computed_values"]["metric"]["values"][0],
                         x: Date.parse(goalInfo["updated"])
                       });
                  } else {
                    d.push({y:null, x:Date.parse(goalInfo["updated"])})
                  }
                goalInfo["data"] = d;
                goalInfo["target_data"] = t;
              }
            } catch(e) {
              goalInfo["data"] = [{y:null, x: Date.now()}];
              goalInfo["target_data"] = [{y:null, x: Date.now()}];
            }
          }
        });
      return goalInfo;
    }
    function getGoals(base, d_id, dashboard) {
      var d_url = base + "/api/stat/v1/dashboards/" + d_id + ".json";
      var ontarget = 0;
      var offtarget = 0;
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
                var goalInfo = getGoalInfo(base, goals[k]['id'],dashboard, categories[j]["name"], d_id, categories[j]["id"])
                goalArray.push(goalInfo);
                if(goalInfo["ontarget"] === 1) {
                  ontarget += goalInfo["ontarget"];
                }
                if(goalInfo["ontarget"] === 0) {
                  offtarget += 1;
                }
              }
            }
          }
      });
      return [goalArray,ontarget,offtarget];
    }
    function getExpenseAmount(url) {
      var e_url = url;
      var budget = {};
      $.ajax({
          url: e_url,
          async: false,
          dataType: 'json',
          success: function(data) {
            budget = data
          }
        });
        return budget;
    }
    var goal_url = base + "/api/stat/v1/dashboards.json";
    var goalArray = Array();
    var count = 0;
    var ontarget = 0;
    var offtarget = 0;
    var car = "";
    var txt = "";

    $.ajax({
        url: goal_url,
        async: false,
        dataType: 'json',
        success: function(data) {
          for(var i in data) {
            d_id = data[i]['id'];
            dashboard = data[i]["name"];
            values = getGoals(base, d_id, dashboard);
            goalArray.push.apply(goalArray,values[0]);
            ontarget += values[1];
            offtarget += values[2]
          }
        }
      });
      var budget = getExpenseAmount(b_url);
      return [goalArray,ontarget, offtarget, budget];
    },
    computeOnTarget: function(ontarget) {
      document.getElementById("ontarget").innerHTML = "<p>On Target</p>"+ontarget.toString();
    },
    computeOffTarget: function(offtarget) {
      document.getElementById("offtarget").innerHTML = "<p>Off Target</p>"+offtarget.toString();
    },
    computeMeasuring: function(measuring) {
      document.getElementById("measuring").innerHTML = "<p>Measuring</p>"+measuring.toString();
    },
    newOnTarget: function(goalArray) {
      var ontarget = 0;
      for(i in goalArray) {
        try {
          if(goalArray[i]["ontarget"] === 1){
            ontarget += goalArray[i]["ontarget"];
          }
        } catch(e) {
          ontarget += 0;
        }
      }
      return ontarget;
    },
    newOffTarget: function(goalArray) {
      var offtarget = 0;
      for(i in goalArray) {
        try {
          if(goalArray[i]["ontarget"] === 0) {
            offtarget += 1;
          }
        } catch(e) {
          offtarget += 0;
        }
      }
      return offtarget;
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
          if(nStr === null){
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
        '<div><div class="row"><div class="col-md-12"><div class="card"><div class="content"> \
          <h2 class="db">'+goalInfo[i]["dashboard"]+'</h2></div></div></div></div> \
          <div class="row"><div class="col-md-12"><div class="card"><div class="content"> \
          <h3 class="cat">'+goalInfo[i]["category"]+'</h3></div></div></div></div> \
            <div class="row"> \
                <div class="col-md-4"> \
                  <div class="card" id="measure-'+goalInfo[i]["ontarget"]+'"> \
                    <a href="'+goalInfo[i]["url"]+'" target="_blank"> \
                      <div class="header"> \
                          <h3 class="title">'+goalInfo[i]["name"]+'</h3> \
                      </div> \
                    </a> \
                    <div class="content"> \
                      <div id="current_value"><h1 class="title">';
                        if("current_value" in goalInfo[i]) {
                          if(goalInfo[i]["unit"] == "percent") {
                            var value = addCommas(goalInfo[i]["current_value"]);
                            goalTile += value === 'N/A' ? value : value + "%";
                          }
                          else if(goalInfo[i]["unit"] == "dollars"){
                            var value = addCommas(goalInfo[i]["current_value"].toString());
                            goalTile += value === 'N/A' ? value : "$" + value;
                          }
                          else {
                            goalTile += addCommas(goalInfo[i]["current_value"]);
                          }
                        } else {
                          goalTile += "N/A";
                        }
          goalTile += '</h1><p>';

                      if(goalInfo[i]["unit"] == "percent") {
                        goalTile += goalInfo[i]["target"] == null ? "Measuring" : "Target: " + goalInfo[i]["target"][0]+ goalInfo[i]["target"][1] + "%";
                      }
                      else if(goalInfo[i]["unit"] == "dollars"){
                        goalTile += goalInfo[i]["target"] == null ? "Measuring" : "Target: " + goalInfo[i]["target"][0]+ " $" + goalInfo[i]["target"][1];
                      }
                      else {
                        goalTile += goalInfo[i]["target"] == null ? "Measuring" : "Target: " + goalInfo[i]["target"][0] + goalInfo[i]["target"][1];
                      }

                      goalTile += '</p></div> \
                      <div class="footer"> \
                          <div class="chart-legend"> \
                              <i class="fa fa-circle text-info"></i>'+goalInfo[i]["unit"]+' \
                          </div> \
                          <hr> \
                          <div class="stats"> \
                              <i class="ti-new-window"></i><a href="'+goalInfo[i]["url"]+'" target="_blank">Link to goal</a> \
                          </div> \
                      </div> \
                    </div> \
                  </div> \
                </div> \
                <div class="col-md-8"> \
                  <div class="card" id="visual"> \
                    <div class="header"> \
                      <h3 class="title">' + goalInfo[i]["name"]+'</h3> \
                      <p class="category">'+ goalInfo[i]["summary"]+'</p> \
                    </div> \
                    <div class="content"> \
                      <div class="chart" id="goal-'+goalInfo[i]['id']+'"></div> \
                      <div class="footer"> \
                        <div class="chart-legend"> \
                            <i class="fa fa-circle text-info"></i> '+goalInfo[i]["unit"]+' \
                            <i class="fa fa-circle text-warning"></i> Target \
                        </div> \
                        <hr> \
                        <div class="stats"> \
                            <i class="ti-calendar"></i>'+goalInfo[i]["updated"]+' \
                        </div> \
                      </div> \
                    </div> \
                  </div> \
                </div> \
              </div> \
              </div>';

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
              goal = '<label><input id="'+map[k][c][g]["id"]+'" class="goalcheck '+k.replace(/\W+/g,"-")+"\" type=\"checkbox\" name=\"goal\" value=\""+ encodeURIComponent(JSON.stringify(map[k][c][g]))+ "\"/>" + map[k][c][g]["name"] + "</label>" ;
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
        '<div class="col-sm-3"> \
                  <div class="card" id="measure-'+goalInfo[i]["ontarget"]+'"> \
                    <div class="header"> \
                      <h4 class="title">'+goalInfo[i]["name"]+'</h4> \
                    </div> \
                    <div class="content"> \
                      <div id="current_value"><h1 class="title">';
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
        goalTile += '</h1><p>';
                      if(goalInfo[i]["unit"] == "percent") {
                        goalTile += goalInfo[i]["target"] == null ? "Measuring" : "Target: " + goalInfo[i]["target"][0]+ goalInfo[i]["target"][1] + "%";
                      }
                      else if(goalInfo[i]["unit"] == "dollars"){
                        goalTile += goalInfo[i]["target"] == null ? "Measuring" : "Target: " + goalInfo[i]["target"][0]+ " $" + addCommas(goalInfo[i]["target"][1]);
                      }
                      else {
                        goalTile += goalInfo[i]["target"] == null ? "Measuring" : "Target: " + goalInfo[i]["target"][0] + addCommas(goalInfo[i]["target"][1]);
                      }
                      goalTile += '</p></div> \
                      <div class="footer"> \
                          <div class="chart-legend"> \
                              <i class="fa fa-circle text-info"></i>'+goalInfo[i]["unit"]+' \
                          </div> \
                          <hr> \
                          <div class="stats"> \
                              <i class="ti-new-window"></i><a href="'+goalInfo[i]["url"]+'" target="_blank">Link to Goal</a> \
                          </div> \
                      </div> \
                  </div> \
                </div>';
          tiles += goalTile;
        }
        tiles += '</div>'
        document.getElementById("blocks").innerHTML = tiles;
    }
  };
