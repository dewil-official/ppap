// General Variables
var players = [];

socket.on('id-send-img', function(url){ sessionStorage.setItem('current-img',url) });

socket.on('gm-quest', function(quest){
  console.log("Question: " + quest);
  if (confirm(quest)) {
    socket.emit('gm-quest-answer', "true");
} else {
    socket.emit('gm-quest-answer', "false");
}
});

// Functions
function populatePlayerList(arr){
  document.getElementById("cplayer-list").innerHTML = ""; // Clear Div
  // For Each Player
  for (i = 0; i < arr.length; i++) {
    var pkmnTable = '<table class="table is-fullwidth is-bordered"><tbody>';
    // For Each Pokemon in Table
    for (c = 0; c < arr[i].team.length; c++) {
      if (c==0) {
        pkmnTable = pkmnTable + '<tr>';
      } else if (c==3) {
        pkmnTable = pkmnTable + '</tr><tr>';
      }
      pkmnTable = pkmnTable + '<td onclick="viewPokemon('+i+','+c+')">'+'<p class="title is-5">'+arr[i].team[c].name+'</p>'+'<span class="icon is-small live-span"><i class="fas fa-heart" aria-hidden="true"></i></span><span class="live-span">'+arr[i].team[c].hp+'%</span>'+'<span class="icon is-small level-span"><i class="fas fa-level-up-alt" aria-hidden="true"></i></span><span class="level-span">'+arr[i].team[c].level+'</span></td>';
      if (c==arr[i].team.length-1) {
        pkmnTable = pkmnTable + '</tr>';
      }
    }
    pkmnTable = pkmnTable + '</tbody></table>';

    var playerHtml = '<div class="card c-player-card"><div class="card-header"><p class="title is-3">'+arr[i].name+'</p></div><div class="card-content">'
    + pkmnTable + '</div><div class="card-footer"><a onclick="" class="card-footer-item">Aktionen</a><a onclick="" class="card-footer-item">Beutel</a><a onclick="" class="card-footer-item">Character</a><a onclick="" class="card-footer-item">Geld</a></div></div>';

    document.getElementById("cplayer-list").innerHTML = document.getElementById("cplayer-list").innerHTML + playerHtml;
  }
}

/*async function buildLocationList() {
  const sinnoh = await P.getRegionByName("sinnoh");
  console.log(sinnoh);

  var locations = [];

  for (i = 0; i < sinnoh.locations.length; i++) {
    var l = await P.resource(sinnoh.locations[i].url);
    console.log('l.names[5]: '+l.names[5]);
    console.log('l.names[0]: '+l.names[0]);
    console.log('l.name: '+l.name);

    // Preferrably use the German Name
    if (typeof l.names[5] !== 'undefined') {
      var n = l.names[5].name;
    } else if (typeof l.names[0] !== 'undefined') {
      var n = l.names[0].name;
    } else { var n = l.name; }

    locations.push({ name: n, url: sinnoh.locations[i].url });
    console.log('Currently at: '+i);
  }

  console.log(locations);
}*/

function viewPokemon(playernum, pokemonnum) {

}

/*
      New Pokemon Step 1: Select Location
*/

// Open the Dialog Box
function openNewPokemonModal() {
  // Populate Modal Location List
  document.getElementById("newPokemonModal").getElementsByClassName("dropdown-content").item(0).innerHTML = "";
  for (i = 0; i < locations.length; i++) {
    document.getElementById("newPokemonModal").getElementsByClassName("dropdown-content").item(0).innerHTML = document.getElementById("newPokemonModal").getElementsByClassName("dropdown-content").item(0).innerHTML + '<a class="dropdown-item" onclick="chooseLocation('+i+')">'+locations[i].name+'</a>';
  }

  // Check the previously selected item
  if (sessionStorage.getItem("lastLocation")!==null) {
    document.getElementById("selected-location").innerHTML = sessionStorage.getItem("lastLocation");
  }

  // Open Modal
  var modal = document.getElementById("newPokemonModal");
  modal.classList.add('is-active');
}

function closeNewPokemonModal() { // Close the Dialog Box
  var modal = document.getElementById("newPokemonModal");
  modal.classList.remove('is-active');
  document.getElementById("newPokemonModal").innerHTML = '<div class="modal-background"></div><div class="modal-card"> <header class="modal-card-head"><p class="modal-card-title">New Pokemon</p> <button class="delete" aria-label="close" onclick="closeNewPokemonModal();"></button> </header><section class="modal-card-body"><p class="title is-3">Location</p><div class="dropdown" onclick="openNewPokemonModalDropdown();"><div class="dropdown-trigger"> <button class="button" aria-haspopup="true" aria-controls="dropdown-menu"> <span id="selected-location">Select Location</span> <span class="icon is-small"> <i class="fas fa-angle-down" aria-hidden="true"></i> </span> </button></div><div class="dropdown-menu" role="menu"><div class="dropdown-content"> <a class="dropdown-item"> Dropdown item </a></div></div></div> </section><footer class="modal-card-foot"> <button class="button is-success" onclick="submitLocation();">Select</button> </footer></div>';
}

// Open & Close the Location Dropdown
function openNewPokemonModalDropdown() {
  if (document.getElementById("newPokemonModal").getElementsByClassName("dropdown").item(0).classList.contains("is-active")) {
    // Deactive Dropdown
    document.getElementById("newPokemonModal").getElementsByClassName("dropdown").item(0).classList.remove('is-active');
  } else {
    // Activate Dropdown
    document.getElementById("newPokemonModal").getElementsByClassName("dropdown").item(0).classList.add('is-active');
  }
}

// Pick one item in the Dropdown list
function chooseLocation(id) {
  sessionStorage.setItem("lastLocation", locations[id].name);
  document.getElementById("selected-location").innerHTML = sessionStorage.getItem("lastLocation");
}

// Finally continue the Selection
function submitLocation() {
  if (sessionStorage.getItem("lastLocation")!==null) {
    // Proceed: Get Spawnable Areas from location
    getAreas();
  }
}

/*
      New Pokemon Step 2: Get Spawnable Area from Location
*/

async function getAreas(){
  var locIx = 0;
  for (i = 0; i < locations.length; i++) {
    if ( sessionStorage.getItem("lastLocation") == locations[i].name ) { locIx = i; }
  }
  var r = await P.resource(locations[locIx].url);
  if (r.areas == null) {
    console.log("No Areas Found.");
    closeNewPokemonModal();
  } else {
    if (r.areas.length == 1) { // If only one Area is found in the selected Location, continue seemlessly.
      openPokemonConfiguration(r.areas[0].url);
    } else { // If more than one Area was found in the selected Location, let the user choose between them.
      document.getElementById("newPokemonModal").getElementsByClassName("modal-card-foot").item(0).innerHTML = "";
      var insert = "";
      for (i = 0; i < r.areas.length; i++) {
        insert = insert + '<a class="panel-block" onclick=openPokemonConfiguration("'+r.areas[i].url+'")>' + r.areas[i].name + '</a>';
      }
      document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = '<p class="title is-3">Area Selection</p><nav class="panel">'+insert+'</nav>'; // Clear the InnerHTML
    }
  }
}

/*
      New Pokemon Step 3: Configure everthing before Spawning the Pokemon
*/

async function openPokemonConfiguration(areaUrl){
  // STEP 0: Clear Modal.
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = '';
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-foot").item(0).innerHTML = "";
  // STEP 1: Get Area Information
  const area = await P.resource(areaUrl);
  sessionStorage.setItem("areaUrl", areaUrl);
  // Add loading bar
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = '<progress class="progress" value="0" max="1"></progress>';
  document.getElementById("newPokemonModal").getElementsByClassName("progress").item(0).max = area.pokemon_encounters.length;
  // STEP 2: Get Pokemon Information
  var areaPokemon = [];
  for (a = 0; a < area.pokemon_encounters.length; a++) {
    var pkmn = await P.resource(area.pokemon_encounters[a].pokemon.url);
    var species = await P.resource(pkmn.species.url);
    var name = "";
    // Preferrably use the German Name
    if (typeof species.names[5] !== 'undefined') {
      var n = species.names[5].name;
    } else if (typeof species.names[2] !== 'undefined') {
      var n = species.names[2].name;
    } else { var n = species.name; }
    areaPokemon.push({ name: n, url: area.pokemon_encounters[a].pokemon.url, img: pkmn.sprites.front_default, chance: area.pokemon_encounters[a].version_details[0].max_chance });
    document.getElementById("newPokemonModal").getElementsByClassName("progress").item(0).value = document.getElementById("newPokemonModal").getElementsByClassName("progress").item(0).value + 1;
  }
  // STEP 3: Populate Selection List
  areaPokemon.sort(function(a, b){return parseFloat(b.chance) - parseFloat(a.chance);});
  var insert = "";
  for (i = 0; i < areaPokemon.length; i++) {
    insert = insert + '<a class="panel-block" onclick=choosePokemon("'+areaPokemon[i].url+'")><span><figure class="image is-32x32"><img src="'+areaPokemon[i].img+'"></figure></span><span>' + areaPokemon[i].name + '</span><span class="chance-span">' + areaPokemon[i].chance + '%</span></a>';
  }
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = '<p class="title is-3">Pokemon Selection</p><nav class="panel">'+insert+'</nav>'; // Clear the InnerHTML
}

async function choosePokemon(pkmnUrl) {
  // STEP 4: After selecting the Pokemon, decide what Player the Pokemon appears for.
  var pkmn = await P.resource(pkmnUrl);
  socket.emit('id-get-img', pkmn.id);
  var insert = "";
  for (i = 0; i < players.length; i++) {
    if (players[i].name !== "GameMaster") {
      insert = insert + '<a class="panel-block" onclick=choosePlayer("'+pkmnUrl+'","'+players[i].name+'")>'+players[i].name+'</a>';
    }
  }
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = '<p class="title is-3">Player Selection</p><nav class="panel">'+insert+'</nav>';
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-foot").item(0).innerHTML = '';
}

function choosePlayer(pkmnUrl, playerName) {
  // STEP 5: Optionally Randomize some other stats by dice
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = '<input class="input" type="text" placeholder="Würfel-Zahl">';
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-foot").item(0).innerHTML = '<a class="button" onclick=generatePokemon("'+pkmnUrl+'","'+playerName+'",0)>Select</a><a class="button" onclick=generatePokemon("'+pkmnUrl+'","'+playerName+'",1)>Randomize</a>';
}

async function generatePokemon(pkmnUrl,playerName,r) {
  // Result: r can either be 0 and therefore the values are randomized as in the original Game
  // But if r > 0, the randomized values are determined by dice.
  if (r == 0 && document.getElementById("newPokemonModal").getElementsByClassName("input").item(0).value == null) {
    choosePlayer(pkmnUrl, playerName);
  } else if (r == 0) {
    r = document.getElementById("newPokemonModal").getElementsByClassName("input").item(0).value;
  } else {
    r = 0;
  }

  // STEP 6: Start the actual Creation
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-body").item(0).innerHTML = "Loading...";
  document.getElementById("newPokemonModal").getElementsByClassName("modal-card-foot").item(0).innerHTML = "";

  const pkmn = await P.resource(pkmnUrl);
  const species = await P.resource(pkmn.species.url);

  var level = await getLevel(pkmnUrl, r); // Other functions do need this value, so aquire it already.
  var stats = await getStats(pkmn, level);

  // Create the final object
  var createdPokemon = {
    name: getGermanName(species.names),
    id: species.id,
    typ: await getTypes(pkmn),
    level: level,
    img: sessionStorage.getItem('current-img'),
    status: "",
    gender: getGender(species),
    nature: Math.floor(Math.random() * 25), // Generate Nature (IDs 0-24)
    attacks: await getAttacks(pkmn, level),
    stats: stats,
    hp: Math.floor((2 * stats.hp.base + stats.hp.iv + stats.hp.ev) * level / 100 + level + 10),
    captureRate: species.capture_rate,
  }
  socket.emit('encounter-pokemon', { player: playerName, pokemon: createdPokemon });
  closeNewPokemonModal();
}

/*
      NEW ITEM MODAL
*/

function closeNewItemModal() {
  location.reload();
}
function openNewItemModal() {
  document.getElementById("newItemModal").classList.add('is-active');
}

async function pokeballSelection() {
  const normPbs = await P.resource("https://pokeapi.co/api/v2/item-category/34/");
  const specPbs = await P.resource("https://pokeapi.co/api/v2/item-category/33/");
  var balls = [];
  for (i = 0; i < (normPbs.items.length - 3) /* Excluding sport-/safari-/park-ball */; i++) {
    var data = await P.resource(normPbs.items[i].url);
    balls.push({
      name: getGermanName(data.names),
      id: data.id,
      img: data.sprites.default,
    });
  }
  for (i = 0; i < (specPbs.items.length - 2) /* Excluding dream-/beast-ball*/; i++) {
    var data = await P.resource(specPbs.items[i].url);
    balls.push({
      name: getGermanName(data.names),
      id: data.id,
      img: data.sprites.default,
    });
  }
  var inBody = '<nav class="panel">';
  for (i = 0; i < balls.length; i++) {
    inBody = inBody + '<a class="panel-block" onclick="openItemCreation('+balls[i].id+');"><span><figure class="image is-32x32"><img src="'+balls[i].img+'"></figure></span><span>' + balls[i].name + '</span></a>';
  };
  inBody = inBody + '</nav>';
  document.getElementById("newItemModal").getElementsByClassName("modal-card-body").item(0).innerHTML = inBody;
}

function openItemCreation(id){
  var inHtml = document.getElementById("newItemModal").getElementsByClassName("modal-card-body").item(0);
  inHtml.innerHTML = '<span><h4 class="title is-4" style="display:inline">Item ID: </h4></span>' + '<span class="tag is-dark" id="idBadge">' + id + '</span><br>' + '<span><h4 class="title is-4" style="display:inline">Anzahl: </h4></span>' + '<span><input class="input" type="text" id="itemCount" placeholder="1"></span>' + '<h4 class="title is-4">Spieler: </h4>';
  for (i = 0; i < players.length; i++) {
    if ( players[i].name !== "GameMaster" ) {
      inHtml.innerHTML = inHtml.innerHTML + '<label class="checkbox"><input type="checkbox" id="check' + players[i].name + '"> ' + players[i].name + '</label><br>';
    }
  }
  document.getElementById("newItemModal").getElementsByClassName("modal-card-foot").item(0).innerHTML = '<a class="button is-success" onclick="finishPball();">Senden</a>';
}

async function finishPball(){
  var item = await P.getItemByName(parseInt(document.getElementById("idBadge").innerHTML));
  var playersChecked = []; // TODO: Get checkboxed-players
  for (i = 0; i < players.length; i++) {
    if (document.getElementById("check"+players[i].name) !== null) {
      if (document.getElementById("check"+players[i].name).checked) {
        playersChecked.push(players[i].name);
      }
    }
  }
  var anzahl = document.getElementById("itemCount").value;
  if (anzahl == "") { anzahl = 1; }
  socket.emit('new-item', {
    id: item.id,
    count: anzahl,
    name: getGermanName(item.names),
    img: item.sprites.default,
    players: playersChecked,
    category: item.category,
    cost: item.cost,
    desc: getGermanFlavorText(item.flavor_text_entries),
  });
  closeNewItemModal();
}
