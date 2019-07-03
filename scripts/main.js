var cLatitude;
var cLongitude;
var varWaterLog = $.parseJSON('[]');

function main() {
  updateWaterProgress();
  getCurrentWeather();

  if (localStorage.getItem('waterLog') == null) {
    localStorage.setItem('waterLog', JSON.stringify(varWaterLog));
  } else {
    varWaterLog = $.parseJSON(localStorage.getItem('waterLog'));
  }

  if (Cookies.get('MyDailyWater') == "NaN") {
    setDailyGoal();
  }

  fullyUpdateLog();

}

function writeConsumedWaterLog(am) {
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes(); // + ":" + today.getSeconds();
  
  varWaterLog.push({timestamp: time, amount: am});
  localStorage.setItem('waterLog', JSON.stringify(varWaterLog));
}

function fullyUpdateLog() {
  for (var i = varWaterLog.length - 1; i >= 0; i--) {
    var listItem = document.createElement("li");
    listItem.className = ("list-group-item border-0");
    listItem.innerHTML = (varWaterLog[i].timestamp + " - " + varWaterLog[i].amount + "ml");
    $("#logList").append(listItem);
  }
}

function addConsumedWater(water) {
  if (Cookies.get('MyConsumedWater') == "NaN") {
    Cookies.set('MyConsumedWater', 0)
  }
  Cookies.set('MyConsumedWater', parseInt(Cookies.get('MyConsumedWater')) + parseInt(water));
  updateWaterProgress();
  writeConsumedWaterLog(water);
}

function resetConsumedWater() {
  if (confirm("Deseja resetar o progresso do dia?")) {
    Cookies.set('MyConsumedWater', 0);
    updateWaterProgress();
  }
}

function updateWaterProgress() {
  // Atualiza o progresso
  var newProgress = parseInt(Cookies.get('MyConsumedWater')) * 100 / Cookies.get('MyDailyWater');

  $('#water_progress').css('width', newProgress + "%");
  if (parseInt(Cookies.get('MyDailyWater')) > parseInt(Cookies.get('MyConsumedWater'))) {
    $('#water_progress').html(parseInt(Cookies.get('MyDailyWater')) - parseInt(Cookies.get('MyConsumedWater')) + "ml para " + Cookies.get('MyDailyWater') + "ml");
  } else {
    $('#water_progress').html(parseInt(Cookies.get('MyConsumedWater')) - parseInt(Cookies.get('MyDailyWater')) + "ml além dos " + Cookies.get('MyDailyWater') + "ml");
  }
}

function setDailyGoal() {
  Cookies.set('MyDailyWater', prompt("Informe o seu objetivo de consumo diário de água", 6000))

  updateWaterProgress();
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getCurrentWeather);
  } else { 
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  cLatitude = position.coords.latitude;
  cLongitude = position.coords.longitude;
}

function getCurrentWeather(position) {
  // getLocation();

  $('#w_city_name').html("");
  $('#w_temperature').html("");
  $('#w_condition').html("");

  $.getJSON("http://api.openweathermap.org/data/2.5/weather?q=Juiz%20de%20Fora,br&units=metric&lang=pt&appid=7e01f095d76cf844258dbdb57cef6073", function() {
  // $.getJSON("http://api.openweathermap.org/data/2.5/weather?lat="+cLatitude+"&lon="+cLongitude+"&units=metric&lang=pt&appid=7e01f095d76cf844258dbdb57cef6073", function() {
    console.log("success");
  })
  .done(function(data) {
    console.log( "second success" );
    console.log(data.name + ": " + data.main.temp + "°C");
    $('#w_city_name').html(data.name);
    $('#w_temperature').html(data.main.temp + "°C");
    $('#w_condition').html(data.weather[0].description.substr(0,1).toUpperCase()+data.weather[0].description.substr(1));
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });
}