// General Variables
var bank = []; // Object consisting of all other Pokemon

function populatePokemon(){
  // Clear old Data
  for (i = 0; i < 6; i++) {
    var cardno = i + 1;
    document.getElementById("card" + cardno).innerHTML = "";
  }
  // Insert new Data
  for (i = 0; i < team.length; i++) {
    var cardno = i + 1;
    var typstring = '<span class="tag is-danger">Missing</span>'; // Used because there can be either one or multiple types
    if (team[i].typ[1] == null) {
      typstring = '<span class="tag is-danger">'+team[i].typ[0]+'</span>';
    } else if (team[i].typ[1] !== null) {
      typstring = '<span class="tag is-danger" style="margin-right: 0.3em;">'+team[i].typ[0]+'</span>'+'<span class="tag is-danger">'+team[i].typ[1]+'</span>';
    }
    document.getElementById("card" + cardno).innerHTML = '<div class="card team-card"><div class="card-image"><figure class="image is-3by2"><img src="'+ team[i].img +'" alt="Loading Image..."></figure></div><div class="card-content"><progress class="progress is-danger" value="' + team[i].hp + '" max="100">' + team[i].hp + '%</progress><p class="title is-4">' + team[i].name + '</p><p class="subtitle is-6">Lv. ' + team[i].level + '</p>'+ typstring + '</div></div>';
  }
}

socket.on('in-fight', function(n) {

  // If a fight is running (as a user), redirect to that.
  if (n == 1) { // If a fight is running and the player is not already on one of those sites, switch to the right one!
    window.location.href = "/battle";
  }

});

// Helper Functions
function ObjectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
};

function updateView() {
  if (window.location.href == "/play") {

  } else if (window.location.href == "/beutel") {
    console.log(items);
  } else if (window.location.href == "/char") {

  }
}

function populateItems() {
  var view = document.getElementById("itemView");
  view.innerHTML = '';
  for (i = 0; i < items.length; i++) {
    view.innerHTML = view.innerHTML + '<a class="panel-block itemViewBlock" onclick="viewItem(' + items[i].id + ');"><span><img src="' + items[i].img + '"></span><b>' + items[i].name + '</b><i>x' + items[i].count + '</i>';
  }
}

function viewItem(id) {
  if (id == 419) {
    console.log("Map opened.");
  }
}
