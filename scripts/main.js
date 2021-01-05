var cLatitude;
var cLongitude;
var varWaterLog = $.parseJSON('[]');
var varTodoList = $.parseJSON('[]');

function main() {
  updateWaterProgress();
  getCurrentWeather();

  // Inicializa o JSON do log de água
  if (localStorage.getItem('waterLog') == null) {
    localStorage.setItem('waterLog', JSON.stringify(varWaterLog));
  } else {
    varWaterLog = $.parseJSON(localStorage.getItem('waterLog'));
  }

  // Inicializa o JSON da ToDo List
  if (localStorage.getItem('TodoList') == null) {
    localStorage.setItem('TodoList', JSON.stringify(varTodoList));
  } else {
    varTodoList = $.parseJSON(localStorage.getItem('TodoList'));
  }

  if (Cookies.get('MyDailyWater') == "NaN") {
    setDailyGoal();
  }

  fullyUpdateLog();
  fullyUpdateTodo();
  var intervalID = setInterval(function(){getCurrentWeather();}, 300000);

  var now = new Date();
  var millisTillReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0, 0) - now;
  if (millisTillReset < 0) {
      millisTillReset += 86400000; // it's after 10am, try 10am tomorrow.
  }
  setTimeout(function(){
    resetConsumedWater(true);
  }, millisTillReset);
}

function writeConsumedWaterLog(am) {
  var time = getCurrentTime();
  
  varWaterLog.push({timestamp: time, amount: am});
  localStorage.setItem('waterLog', JSON.stringify(varWaterLog));
}

function fullyUpdateTodo() {
  for (var i = 0; i < varTodoList.length; i++) {
    addTodoItem(i, varTodoList[i].todo, varTodoList[i].done); 
  }
}

function fullyUpdateLog() {
  var typeConsumed;

  // Clear log first.
  var logList = $("#logList")[0];
  while (logList.firstChild) {
      logList.removeChild(logList.firstChild);
  }

  for (var i = varWaterLog.length - 1; i >= 0; i--) {
    const x = varWaterLog[i].amount;
    switch (true) {
      case (x == 240):
        typeConsumed = "tea";
        break;
      case (x == 330):
        typeConsumed = "lata";
      case (x == 350):
        typeConsumed = "lata";
        break;
      case (x > 350 && x < 600):
        typeConsumed = "glass";
        break;
      default:
        typeConsumed = "bottle";
        break;
    }
    // typeConsumed = ((varWaterLog[i].amount >= 500) ? "bottle" : "tea" ); 
    var listItem = document.createElement("li");
    listItem.className = ("list-group-item px-0 pl-4 py-2 " + typeConsumed);
    listItem.innerHTML = (
      "<span>"+ varWaterLog[i].amount + "ml" +"</span>" +
      "<span class='float-right'>"+ varWaterLog[i].timestamp +"</span>"
    );
    $("#logList").append(listItem);
  }

  updateLastLabel();
}

function addNewTodo() {
  if ($('#txtNewTodoItem').val() != "") {
    var newID = varTodoList.length;
    varTodoList.push({id: newID, todo: $('#txtNewTodoItem').val(), done: "0"});
    localStorage.setItem('TodoList', JSON.stringify(varTodoList));

    addTodoItem(newID, $('#txtNewTodoItem').val());

    $('#txtNewTodoItem').val("");
  }
}

function addTodoItem(id, todo, done) {
  done = ((done == 1) ? "checked" : "" ); 

  var newTodoListItem = document.createElement("li");
  newTodoListItem.className = ("list-group-item px-0 py-2 ");
  newTodoListItem.innerHTML = (
    "<div class='form-check'>" +
    "<input class='form-check-input' type='hidden' value='' id='listItemN"+ id +"'>" +
    "<input class='form-check-input' type='checkbox' value='' id='listItem"+ id +"' "+done+" onclick='taskDone(this);'>" +
    "<label class='form-check-label' for='listItem"+ id +"'>" + todo +
    "</label></div>"
  );
  $("#todoList").append(newTodoListItem);
}

function taskDone(t) {
  // console.log($(t).prop('checked'));
  var taskID = $(t).attr('id').slice(8);
  varTodoList[taskID].done = $(t).prop('checked') ? 1 : 0;
  localStorage.setItem('TodoList', JSON.stringify(varTodoList));
}

function addConsumedWater(water) {
  if (Cookies.get('MyConsumedWater') == "NaN") {
    Cookies.set('MyConsumedWater', 0)
  }
  Cookies.set('MyConsumedWater', parseInt(Cookies.get('MyConsumedWater')) + parseInt(water));
  updateWaterProgress();
  writeConsumedWaterLog(water);
  fullyUpdateLog();
}

function resetConsumedWater(silent) {
  if (silent) {
    _resetConsumedWater();
  } else {
    if (confirm("Deseja resetar o progresso do dia?")) {
      _resetConsumedWater();
    }
  }
  fullyUpdateLog();
}

function _resetConsumedWater() {
  Cookies.set('MyConsumedWater', 0);
  updateWaterProgress();
  varWaterLog = $.parseJSON('[]');
  localStorage.setItem('waterLog', JSON.stringify(varWaterLog));
}

function updateWaterProgress() {
  // Atualiza o progresso
  var newProgress = parseInt(Cookies.get('MyConsumedWater')) * 100 / Cookies.get('MyDailyWater');

  $('#water_progress').css('width', newProgress + "%");
  
  $('#water_consumed').html(parseInt(Cookies.get('MyConsumedWater')) + "ml");

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
    $('#w_temperature').html(data.main.temp.toFixed(1) + "°C");
    $('#w_condition').html(data.weather[0].description.substr(0,1).toUpperCase()+data.weather[0].description.substr(1));
    $('#w_updated').html(getCurrentTime());
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });
}

function getCurrentTime() {
  const options = {
    timeZone:"America/Sao_Paulo",
    hour12 : false,
    hour:  "2-digit",
    minute: "2-digit",
    // second: "numeric"
  }

  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes(); // + ":" + today.getSeconds();

  return today.toLocaleTimeString("en-US", options);
}

function updateLastLabel() {
  var lastLog = varWaterLog[varWaterLog.length - 1];
  $('#lastWaterLogEntry').html("Último registro às " + lastLog.timestamp + " - " + lastLog.amount + "ml");
}

// Eventos do Bootstrap

$('#collapseWaterLog').on('show.bs.collapse', function() {
  $('#btnLogMore').html('Ver menos');
})

$('#collapseWaterLog').on('hide.bs.collapse', function() {
  $('#btnLogMore').html('Ver mais');
})