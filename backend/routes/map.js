const express = require("express");

methods = require("../services/methods");

const router = express.Router();

router.post("/", async (req, res) => {
  let arrLon = [];

  let arrLat = [];
  let arrayOfResult = [];
  let depoKalan = req.body.depoKalan; //depoda kalan benzin
  const avrgConsumption = req.body.avrgConsumption; // ortalama gaz tuketimi
  const firstRange = depoKalan / avrgConsumption; // ilk benzinle gidebilecegi range
  const points = req.body.points;
  const destination = points.length; //toplam yol miktari distance
  const depoCapacity = req.body.depoCapacity; //deponun alabilecegi benzin
  let range = firstRange;
  for (let cn = 0; cn < points.length; cn++) {
    arrLat.push(points[cn].lat);
    arrLon.push(points[cn].lng);
  }
  let currentSt = 0;
  if (firstRange > destination) {
    //ilk range toplam mesafeden buyukse benzin almasina gerek yok
    console.log("co calculation!!");
    res.send("no calculation!!");
  } else {
    methods.gasArray(arrLon, arrLat, result => {
      // gasArray methodtan kordinata yakin benzinlikler donuyor mygasFeed api sayesinde
      // burdaki donen result  yol ustundeki tum benzinlikler
      while (range < destination) { //artik benzin almasi gerekmiyosa loop sona eriyo
        //Algoritmanin Baslangici, her bir while dongusunde iki benzinlik hesapliyoruz
        let rangeStations = [];
        const tamMil = parseInt(range, 10);
        let i = currentSt; 
        for (i; i < tamMil; i++) {      //kacinci istasyondaysa(currenSt) ondan sonra gidebilecegi benzinlikleri rangeStations arrayine pushluyoruz
          rangeStations.push(result[i]);
        }

        if (i == tamMil) {
          methods.getLowest(rangeStations, cheapestAtFirst => { // methods klosorundeki getLowest methoduyla rangeStation arrayindeki en ucuz benzinligi buluyoruz
            arrayOfResult.push(cheapestAtFirst); //cheapest at first durmamiz gereken benzinliklerden biri bu arrayOfResultta tutuyoruz
            const nextRange =
              depoCapacity / avrgConsumption + cheapestAtFirst.distance; // benzinlikten sonra gidebilecgi range
            let nextRangeStations = [];
            let nextTamMil = parseInt(nextRange, 10);
            if (nextTamMil > result.length + 1) {
              nextTamMil = result.length + 1;
            }
            range = cheapestAtFirst.distance + depoCapacity / avrgConsumption; //range tekrar hesaplaniyo
            if (range <= destination) { // benzin almasi gerekmyosa buraya girmiyo (son while dongusunde oluyo veya hic gerceklesmiyo)
              counterStationsHelper = 0;
              let i = cheapestAtFirst.distance;
              for (i; i < nextTamMil + 1; i++) {
                nextRangeStations.push(result[i]);
                ifegirdi = "IFE GIRDI";
              }
              //yukarida cheapestAtFirstten sonraki range ile gidebilecgi benzinlikler hesaplaniyor
              if (i == nextTamMil + 1) {
                methods.getLowest(nextRangeStations, cheapestAtNext => { //tekrar getLowestla() en ucuz benzinlik bulunuyo
                  arrayOfResult.push(cheapestAtNext);
                  range =
                    cheapestAtNext.distance + depoCapacity / avrgConsumption; //range ve currenST bastan hesaplaniyo 
                  currentSt = cheapestAtNext.distance;
                });
              }
            }
          });
        }
      }
      let arrayOfGasAmount = []; //hangi benzinlikten ne kadar yakit alacagini tutacak array
      let gasAmount;
      depoKalan = depoKalan - arrayOfResult[0].distance * avrgConsumption; //ilk benzinlige ulastiginda depoda kalan benzin miktari
      console.log(arrayOfResult.length);
      console.log("ARRAY OF RESUL UZUNLUGU");
      if (arrayOfResult.length > 1) {
        for (let i = 0; i < arrayOfResult.length - 1; i++) {
          if (arrayOfResult[i].reg_price > arrayOfResult[i + 1].reg_price) {
            gasAmount =
              (arrayOfResult[i + 1].distance - arrayOfResult[i].distance) *
                avrgConsumption -
              depoKalan; //eger gelecek durmasi gerekn benzin suankiden ucuzsa burda o benzinlige ulasicak kadar benzin aliyor
            arrayOfGasAmount.push(gasAmount);
            console.log(gasAmount + " 1.condition");
            depoKalan = 0; //bidahaki benzinlikte deposunda ne kadar kalcagini hesapliyoruz
          } else {
            gasAmount = depoCapacity - depoKalan; //eger full depoyla ulasabilecegi en ucuz benzinlik suankinden daha pahaliysa, suan oldugu yerde fullemesi gerekiyor
            arrayOfGasAmount.push(gasAmount);
            console.log(gasAmount + " 2.condition");
            depoKalan =
              depoCapacity -
              (arrayOfResult[i + 1].distance - arrayOfResult[i].distance) *
                avrgConsumption; // bidahaki benzinlikte deposunda ne kadar kalcagini hesapliyoruz
          }
        }
      }
      const last =
        (destination - arrayOfResult[arrayOfResult.length - 1].distance) *
          avrgConsumption -
        depoKalan; //son ebnzinlikte almasi gereken miktar  //eger tek benzinlik varsa yine sadece yolu bitiricek kadar benzin aliyo
      arrayOfGasAmount.push(last);
      console.log(arrayOfGasAmount);
      console.log(arrayOfResult);
      console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTt');
      res
        .status(201)
        .json({ result: arrayOfResult, gasAmount: arrayOfGasAmount })
        .end();
    });
  }
});

module.exports = router;
