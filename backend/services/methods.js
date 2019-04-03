const request = require("request");
const methods = {
  gasArray: async (arrLon, arrLat, callback) => {
    let arrayProm = [];
    let r = 0;
    var cc = 0;
    for (let i = 0; i < arrLat.length; i++) {
      cc++;
      r++;
      // console.log(r++);
      (function(i) {
        setTimeout(function() {
          console.log(i);

          let gasStationUrl =
            "http://api.mygasfeed.com/stations/radius/" +
            arrLat[i] +
            "/" +
            arrLon[i] + 
            "/20/reg/distance/API KEY.json?callback=?";
          request(gasStationUrl, (err, response, body) => {
            // console.log('===================================');
            console.log(body);
            if (body == undefined) {
              body = '/({{"stations":{"distance":"100 miles"} })'; 
            }
            console.log(
              "----------------------------------------------------------------"
            );
            const result = body.substring(
              body.lastIndexOf("/(") + 3,
              body.lastIndexOf(")")
            );
            const stationsForLook = [];
            const json = JSON.parse(result);
            // console.log(json);
            const gasStationsArray = json.stations;
            for (let i = 0; i < gasStationsArray.length; i++) {
              const distance = gasStationsArray[i].distance;
              const spaceNum = distance.indexOf(" ");
              const distanceNum = distance.substring(0, spaceNum);
              if (distanceNum < 0.5) {
                stationsForLook.push(gasStationsArray[i]);
              }
            }
            r = r - 1;
            arrayProm.push(stationsForLook);
            if (r == 0) {
              done();
            }
          });
        }, 1000 * i);
      })(i);
    }

    function done() {
      for (let i = 0; i < arrayProm.length; i++) {
        for (let c = 0; c < arrayProm[i].length; c++) {
          arrayProm[i][c].distance = i + 1;
        }
      }
      callback(arrayProm);
    }
  },
  getLowest: (array, callback) => {
    let lowest = 9999999999999999999999;
    let lowestGasS;
    for (let i = 0; i < array.length; i++) {
      for (let c = 0; c < array[i].length; c++) {
        if (array[i][c].reg_price < lowest) {
          lowest = array[i][c].reg_price;
          lowestGasS = array[i][c];
          distance = i;
        }
      }
    }
    callback(lowestGasS);
  }
};

module.exports = methods;
