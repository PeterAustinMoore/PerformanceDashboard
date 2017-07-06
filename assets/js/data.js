t = "";
data = {
  initData: function() {
    var base = "https://performance.fultoncountyga.gov";

    function getGoalInfo(base, g_id, dashboard, category) {
      var g_url = base + "/api/stat/v1/goals/" + g_id + ".json";
      var goalInfo = {"ontarget":0};
      $.ajax({
          url: g_url,
          async: false,
          dataType: 'json',
          success: function(data) {
            console.log(data);
            goalInfo["id"] = data["id"];
            goalInfo["name"] = data["name"];
            goalInfo["category"] = category;
            goalInfo["dashboard"] = dashboard;
            try{
              goalInfo["summary"] = data["prevailing_measure"]["name"];
              goalInfo["target"] = data["prevailing_measure"]["target"];
              goalInfo["unit"] = data["prevailing_measure"]["unit"];
              goalInfo["updated"] = data["prevailing_measure"]["computed_values"]["metric"]["as_of"].substring(0,10);
              goalInfo["current_value"] = data["prevailing_measure"]["computed_values"]["metric"]["current_value"];
              var measure = data["prevailing_measure"]["computed_values"]["progress"]["progress"];
              if(measure == "good" || measure == "within_tolerance") {
                goalInfo["ontarget"] = 1;
              }
              goalInfo["Y_Est"] = data["prevailing_measure"]["computed_values"]["progress"]["prediction"]["estimated"];
              goalInfo["Y_High_Pred"] = data["prevailing_measure"]["computed_values"]["progress"]["prediction"]["pred_conf_int_high"]
              goalInfo["Y_Low_Pred"] = data["prevailing_measure"]["computed_values"]["progress"]["prediction"]["pred_conf_int_low"]
              goalInfo["X_Est"] = Date.parse(data["prevailing_measure"]["end"])

              goalInfo["Y"] = data["prevailing_measure"]["computed_values"]["metric"]["values"]
              goalInfo["X"] = data["prevailing_measure"]["computed_values"]["metric"]["date_values"]
              try{
                goalInfo["target"] = data["prevailing_measure"]["target"]
              } catch(e) {
                goalInfo["target"] = 0
              }

            } catch (err) {
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth()+1; //January is 0!
              var yyyy = today.getFullYear();
              goalInfo["ontarget"] = 0;
              goalInfo["current_value"] = "N/A";
              goalInfo["updated"] = yyyy+"-"+mm+"-"+dd;
              goalInfo["target"] = "";
              goalInfo["unit"] = "";
              goalInfo["summary"] = "";
              goalInfo["Y_Est"] = 0;
              goalInfo["Y_High_Pred"] = 0
              goalInfo["Y_Low_Pred"] = 0
              goalInfo["X_Est"] = Date.parse(goalInfo["updated"])

              goalInfo["Y"] = 0
              goalInfo["X"] = Date.parse(data["created_at"])

              goalInfo["target"] = 0
            }
          }
        });
        return goalInfo;
    }
    function getGoals(base, d_id, dashboard) {
      var d_url = base + "/api/stat/v1/dashboards/" + d_id + ".json";
      var ontarget = 0;
      var goalArray = Array()
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
    computeCount: function(goalArray) {
      document.getElementById("goals").innerHTML = "<p>Goals</p>"+goalArray.length.toString();
    },
    computeContent: function(goalInfo) {
      function addCommas(nStr) {
          nStr += '';
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
      console.log(goalInfo);
      for(var i in goalInfo) {
        var goalTile = i == 0 ?
          '<div class="item active">' :
          '<div class="item">'
        goalTile+=
        `<div class="row"><div class="col-md-12"><div class="card"><div class="content">
          <h2>`+goalInfo[i]["dashboard"]+`</h2></div></div></div></div>
          <div class="row"><div class="col-md-12"><div class="card"><div class="content">
          <h3>`+goalInfo[i]["category"]+`</h3></div></div></div></div>
            <div class="row">
                <div class="col-md-4">
                  <div class="card" id="measure-`+goalInfo[i]["ontarget"]+`">
                    <div class="header">
                      <h3 class="title">`+goalInfo[i]["name"]+`</h3>
                    </div>
                    <div class="content">
                      <div>
                        <h1 id="current_value">`;
                        if(goalInfo[i]["unit"] == "percent") {
                          goalTile += addCommas(Math.round(goalInfo[i]["current_value"]).toString()) + "%";
                        }
                        else {
                          goalTile += addCommas(Math.round(goalInfo[i]["current_value"]));
                        }
          goalTile += `</h1>
                      </div>
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
                            <i class="fa fa-circle" style="color:#7A9E9F"></i> Projected
                            <i class="fa fa-circle" style="color:#7AC29A"></i> Confidence Interval +
                            <i class="fa fa-circle" style="color:#EB5E28"></i> Confidence Interval -
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
    }
  };
