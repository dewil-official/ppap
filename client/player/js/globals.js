// Imports
var socket = io();
var team = [];
var items = []; // Object consisting of Items inkl. Map
var char = {}; // Character Sheet + Money

// Initial Function
function loaded(){
  // FIRST, check if the player has been logged in and if he's on the right page.
  checkUrl();

  // Get Server Information after Loading
  socket.emit('initial-request', sessionStorage.getItem("name"));
  if (window.location.href.includes("/battle")) { socket.emit('get-fight-update'); }

}

socket.on('in-fight', function(n) {

  // If a fight is running (as a user), redirect to that.
  if (n == 1 && !window.location.href.includes("battle") && sessionStorage.getItem('name') !== "GameMaster") { // If a fight is running and the player is not already on one of those sites, switch to the right one!
    window.location.href = "/battle";

  } else if (n == 0 && window.location.href.includes("battle") && sessionStorage.getItem('name') !== "GameMaster") { // And the other way round.
    window.location.href = "/play";
  }

});

socket.on('user-update', function(obj) {

      // Switch away from wrong url locations
      checkUrl();

      // Set the received data.
      team = obj.team;
      items = obj.items;

      // GameMaster Data
      if ( sessionStorage.getItem('name') == "GameMaster" ) { players = obj.players; }

      // Run functions on that data.
      try { populatePokemon(); } catch (err) { };
      try { populateItems(); } catch (err) { };
      try { updateView(); } catch (err) { };

      console.log("User updated.")

});

function checkUrl() {

  // NOT Logged In
  if ( sessionStorage.getItem('name') == "" || sessionStorage.getItem('name') == null || sessionStorage.getItem('name') === 'undefined' ) {
      window.location.href = "/";

  // Logged In as GameMaster
  } else if ( sessionStorage.getItem('name') == "GameMaster" ) {
    if (window.location.href.includes("/play") || window.location.href.includes("/beutel") || window.location.href.includes("/char")) {
      window.location.href = "/gm/controls";
    }

  // Logged In as a User
  } else {

    // Switch the User away from GameMaster's Sites.
    if (window.location.href.includes("/gm")) {
      window.location.href = "/play";
    }

  }

}
