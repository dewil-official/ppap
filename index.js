// Imports
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');
var deasync = require('deasync');
const Pokedex = require('pokeapi-js-wrapper');
const P = new Pokedex.Pokedex();
var ImgDex = require('pokedex'), imgdex = new ImgDex();

// Selfmade scripts
const storage = require('./server/storage.js');

/*storage.setUsers([{ name: "Alex", passwort: "ikd", team: [{name:"Glurak",id:6,typ:["Feuer","Flug"],level:45,img:"https://www.pokewiki.de/images/9/96/Sugimori_006.png",gender:"w",nature:12,attacks:[{name:"Schlitzer",typ:"Normal",url:"https://pokeapi.co/api/v2/move/163/",pp:20,ppMax:20},{name:"Funkenflug",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/481/",pp:15,ppMax:15},{name:"Feuerzahn",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/424/",pp:15,ppMax:15},{name:"Grimasse",typ:"Normal",url:"https://pokeapi.co/api/v2/move/184/",pp:10,ppMax:10}],stats:{hp:{base:78,iv:20,ev:0},atk:{base:84,iv:20,ev:0},def:{base:78,iv:20,ev:0},spAtk:{base:109,iv:20,ev:0},spDef:{base:85,iv:20,ev:0},speed:{base:100,iv:20,ev:0}},hp:185}]}, { name: "GameMaster", passwort: "Gu1tarre" }]);

var user = { name: "Alex", passwort: "ikd", team: [{name:"Glurak",id:6,typ:["Feuer","Flug"],level:45,img:"https://www.pokewiki.de/images/9/96/Sugimori_006.png",gender:"w",nature:12,attacks:[{name:"Schlitzer",typ:"Normal",url:"https://pokeapi.co/api/v2/move/163/",pp:20,ppMax:20},{name:"Funkenflug",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/481/",pp:15,ppMax:15},{name:"Feuerzahn",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/424/",pp:15,ppMax:15},{name:"Grimasse",typ:"Normal",url:"https://pokeapi.co/api/v2/move/184/",pp:10,ppMax:10}],stats:{hp:{base:78,iv:20,ev:0},atk:{base:84,iv:20,ev:0},def:{base:78,iv:20,ev:0},spAtk:{base:109,iv:20,ev:0},spDef:{base:85,iv:20,ev:0},speed:{base:100,iv:20,ev:0}},hp:185}]};
var user = { name: "GameMaster", passwort: "Gu1tarre" };*/

// Variables
var clients = [];

// Static Resources
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/icon')));

// Send HTML for Clients
app.get('/', function(req, res){            res.sendFile(__dirname + '/views' + '/login.html');});
app.get('/play', function(req, res){        res.sendFile(__dirname + '/views' + '/player/team.html');});
app.get('/beutel', function(req, res){      res.sendFile(__dirname + '/views' + '/player/beutel.html');});
app.get('/char', function(req, res){        res.sendFile(__dirname + '/views' + '/player/char.html');});
app.get('/gm/controls', function(req, res){ res.sendFile(__dirname + '/views' + '/gamemaster/controls.html');});
app.get('/gm/fight', function(req, res){    res.sendFile(__dirname + '/views' + '/gamemaster/fight.html');});
app.get('/gm/players', function(req, res){  res.sendFile(__dirname + '/views' + '/gamemaster/players.html');});
app.get('/battle', function(req, res){      res.sendFile(__dirname + '/views' + '/player/battle/spectate.html');});
app.get('/battle/play', function(req, res){ res.sendFile(__dirname + '/views' + '/player/battle/play.html');});

// Handle Data-Flow
io.on('connection', function(socket){
	// New Connection
	console.log('Connected client');
  clients.push({id: socket.id});

	// Disconnect Handling
	socket.on('disconnect', function(){
		console.log('Disconnected client');
    var ix = 0; // Counting index
    ixloop:
    for (i = 0; i < clients.length; i++) {
      if ( socket.id == clients[i].id ) { ix = i; break ixloop; }
    }
    clients.splice(ix, 1);
	});

	// --------------------------------------------------------------- //
  //                      LOGIN - DATA                               //
	// --------------------------------------------------------------- //

	// User List Request
	socket.on('requestUserList', function(){
    socket.emit('userList', storage.getUsers());
	});

	socket.on('registerUser', function(obj){

    var userList = storage.getUsers();
    if (userList == null || userList == 'undefined') { userList = []; }
    userList.push(obj);
    storage.setUsers(userList);

	});

	socket.on('login', function(obj){

    var user = storage.getUserByName(obj.name);
    if ( user.passwort == obj.passwort ) {
      socket.emit('login-success');
    } else {
      socket.emit('login-failure');
    }

    // Add username to sockety-users-object
    var ix = 0; // Counting index
    ixloop:
    for (i = 0; i < clients.length; i++) {
      if ( socket.id == clients[i].id ) { ix = i; break ixloop; }
    }
    clients[ix].name = obj.name;

	});

	// --------------------------------------------------------------- //
  //                    GENERAL DATA-REQUESTS                        //
	// --------------------------------------------------------------- //

	socket.on('initial-request', function(uname){

		console.log("uname: " + uname);
    // Set the user-name again for socket.id
    for (i = 0; i < clients.length; i++) {
      if ( socket.id == clients[i].id ) { clients[i].name = uname; }
    }

    if (uname == "GameMaster") {
      updateGm(socket);
    } else {
      updateUser(socket);
    }

	});

	socket.on('id-get-img', function(id){
    socket.emit('id-send-img', imgdex.pokemon(id).sprites.animated);
	});

	socket.on('encounter-pokemon', function(obj){
    encounterPokemon(obj);
	});

	socket.on('get-fight-update', function(){
    socket.emit('fight-update', currentFight);
	});

	socket.on('new-item', function(obj){
    newItem(obj);
	});

	// --------------------------------------------------------------- //
  //                        BATTLE NETWORKING                        //
	// --------------------------------------------------------------- //

	socket.on('pick-pkmn', function(obj){
    currentFight.pokemon.player = obj;
    socket.emit('fight-update', currentFight);
	});

	socket.on('flee', function(obj){
    flee();
	});

	socket.on('use-item', function(obj){
    battleUseItem(obj);
	});

	socket.on('gm-quest-answer', function(ans){
    gmQuest = ans;
	});

});

// --------------------------------------------------------------- //

http.listen(80, function(){
  console.log('listening on *:80');
});

/* --------------------------------------------------------------- //
                          USER MANAGEMENT:
// --------------------------------------------------------------- */

function updateAllUsers() {

  for (i = 0; i < clients.length; i++) {
    if ( clients[i].id !== 'undefined') {

      var userList = storage.getUsers();
      for (iu = 0; iu < userList.length; iu++) {
        if ( userList[iu].name == clients[i].name && userList[iu].name == "GameMaster") {

          io.to(clients[i].id).emit('user-update', { players: storage.getUsers() } );

        } else if ( userList[iu].name == clients[i].name) {

          // Don't send the plain-password every time
          var obj = userList[iu];
          delete obj.passwort;
          io.to(clients[i].id).emit('user-update', obj);
          io.to(clients[i].id).emit('in-fight', inFight);

        }
      }
    }
  }
}

function updateUser(socket) {

  ixloop:
  for (i = 0; i < clients.length; i++) {
    if ( socket.id == clients[i].id ) { // Get the user name by socket.id

			console.log("Getting User by Name: " + clients[i].name);
      var user = storage.getUserByName(clients[i].name);
			console.log("User: " + user);

      delete user.passwort;
      socket.emit('user-update', user);
      socket.emit('in-fight', inFight);
      break ixloop;

    }
  }

}

function updateGm(socket) {
  // Retrieve All Userdata from Database
  socket.emit('user-update', { players: storage.getUsers() });
}

/* --------------------------------------------------------------- //
                          SOCKET MANAGEMENT:
// --------------------------------------------------------------- */

function getTeamForSocket(socket) {

  // Get the username for the socket.id
  ixloop:
  for (ic = 0; ic < clients.length; ic++) {
    if ( socket.id == clients[ic].id ) {

      return storage.getTeamByName(clients[ic].name);

    }
  }

}

function newItem(obj){

  // For each player
  loop:
  for (ip = 0; ip < obj.players.length; ip++) {
    // Get matching user by name
    var user = storage.getUserByName(obj.players[ip]);
    // If the user has no items, create a new array for Insertion.
    if ( user.items == null || user.items == "" || user.items === 'undefined' ) {
      // Create an empty array
      user.items = [];
      var itemAlreadyThere = 0;
    } else {
      // Test if the item is already present in the item array.
      var itemAlreadyThere = 0;
      if (user.items.length >= 1) {
        for (k = 0; k < user.items.length; k++) {
          if (user.items[k] !== null) {
            if (user.items[k].id == obj.id) {
              itemAlreadyThere = 1;
            }
          }
        }
      }
    }
    // If the item isn't there already, create a new one.
    if (itemAlreadyThere == 0) {
      // Remove the "players" info from the item
      var insertObj = obj;
      delete insertObj.players;
      // Insert that item into the player's items
      user.items.push(insertObj);
      storage.setUser(user);
      break loop;
    // If the item is there already, raise it's count.
    } else {
      // Raise that item's count
      for (k = 0; k < user.items.length; k++) {
        if (user.items[k].id == obj.id) {
          user.items[k].count = parseInt(user.items[k].count) + parseInt(obj.count);
          storage.setUser(user);
          break loop;
        }
      }
    }
  }
  // Submit that change.
  updateAllUsers();

}

function encounterPokemon(obj) {
  startWildBattle(obj.pokemon, obj.player);
}

/*
    BATTLE FUNCTIONS
*/

var inFight = 0;
var currentFight = {
  type: "",
  player: "",
  enemy: "",
  stage: 0, // 0: User is choosing turn , 1: Waiting for server
  choice: {
    player: "",
    enemy: "",
  },
  stats: {
    fleeCount: 0,
    rounds: 0,
  },
  pokemon: {
    player: {},
    enemy: {},
  }
}
var gmQuest = "";

function resetFight() {
  inFight = 0;
  currentFight.type = "";
  currentFight.player = "";
  currentFight.enemy = "";
  currentFight.stage = 0;
  currentFight.choice.player = "";
  currentFight.choice.enemy = "";
  currentFight.stats.fleeCount = 0;
  currentFight.stats.rounds = 0;
  currentFight.pokemon.player = {};
  currentFight.pokemon.enemy = {};
}

function startWildBattle(wildPkmn, playerName) {
  inFight = 1;
  currentFight.type = "wild";
  currentFight.player = playerName;
  currentFight.enemy = "wild";
  currentFight.pokemon.enemy = wildPkmn;
  io.sockets.emit('in-fight', inFight);
  setTimeout(function() {
    dialog("Ein wildes " + wildPkmn.name + " erscheint!");
  } , 3000);
}

function updateFight() {
  io.sockets.emit('fight-update', currentFight);
  updateAllUsers();
}

function flee() {
  var f = Math.floor(getStat(currentFight.pokemon.player, "speed")*128/getStat(currentFight.pokemon.enemy, "speed")+(30*currentFight.stats.fleeCount));
  var rd = Math.floor(Math.random() * 255);
  if (f >= 256 || rd < f) { // Successfully flee
    dialog('Flucht erfolgreich.');
    resetFight();
    setTimeout(function() {
      io.sockets.emit('in-fight', inFight);
    } ,3000);
  } else { // Don't flee
    dialog('Flucht gescheitert!');
  }
}

function getStat(pkmn, statName) {
  var n = 1; // TODO: nature modifier
  var stat = Math.floor(Math.floor((2 * pkmn.stats[statName].base + pkmn.stats[statName].iv + pkmn.stats[statName].ev) * pkmn.level / 100 + 5) * n);
  return stat;
}

function battleUseItem(obj) {
  // First, decrease item count
  var userList = storage.getUsers();
  loop:
  for (i = 0; i < userList.length; i++) {
    // Get user by name
    if (userList[i].name == obj.player) {
      // Then, get the selected item by id
      for (ix = 0; ix < userList[i].items.length; ix++) {
        // Decrease it's count when id is found
        if (userList[i].items[ix].id == obj.id) {
          var userName = userList[i].name;
          var itemName = obj.name;
          userList[i].items[ix].count = parseInt(userList[i].items[ix].count) - 1;
          if (userList[i].items[ix].count <= 0) { userList[i].items.splice(ix, 1); }
          storage.setUsers(userList);
          currentFight.stage = 1;
          updateFight();
          setTimeout(function(userName, itemName) { dialog(userName + ' verwendet ' + itemName + '!'); }, 2500, userName, itemName);
          if (obj.category.name == "special-balls" || obj.category.name == "standard-balls") {
            var ballBonus = getBallBonus(obj.id, currentFight.pokemon.enemy, 0);
            // Needs to be executed later, after the Gm answered the ballBonus
            setTimeout(function(){
              if (ballBonus == 0) { ballBonus = getBallBonus(obj.id, currentFight.pokemon.enemy, 1); }
              var statusBonus = getStatusBonus(currentFight.pokemon.enemy.status);
              var maxHp = Math.floor((2 * currentFight.pokemon.enemy.stats.hp.base + currentFight.pokemon.enemy.stats.hp.iv + currentFight.pokemon.enemy.stats.hp.ev) * currentFight.pokemon.enemy.level / 100 + currentFight.pokemon.enemy.level + 10);
              var catchRate = Math.round(((3*maxHp-2*currentFight.pokemon.enemy.hp)*currentFight.pokemon.enemy.captureRate*ballBonus)/(3*maxHp)*statusBonus);
              if (catchRate >= 255) { var catchCount = 4; } else {
                var b = (1048560/Math.sqrt(Math.sqrt(16711680/parseInt(catchRate))));
                var catchCount = 0;
                console.log("b: " + b);
                for (icx = 0; icx < 4; icx++) {
                  var r = Math.floor(Math.random()*65535);
                  console.log("r: " + r);
                  if (r < b) {
                    catchCount++;
                  }
                }
              }
              console.log("CatchCount: " + catchCount);
              if (catchCount == 4) { catchPokemon(); }
              doAnimation("catch", obj.img, "enemy", catchCount);
            }, 3500);
          }
          break loop;
        }

      }
    }
  }
}

function dialog(msg, sub) {
  if ( sub == "" || sub == null || sub === 'undefined' ) {
    io.sockets.emit('fight-dialog', { msg: msg });
  } else {
    io.sockets.emit('fight-dialog', { msg: msg, sub: sub });
  }

}

function doAnimation(type, img, target, nr) {
  io.sockets.emit('do-animation', { type: type, img: img, target: target, nr: nr });
}

function getBallBonus(id, target, gm) { // gm means, the function may get called a second time after the gm answered.
  if (gm == 0) {
    if (id == 1) { // Master Ball
      return 99999;
    } else if (id == 2) { // Ultraball
      return 2;
    } else if (id == 3) { // Superball
      return 1.5;
    } else if (id == 4) { // Pokeball
      return 1;
    } else if (id == 6) { // Netzball
      if (target.typ[0] == "Käfer" || target.typ[0] == "Wasser" || target.typ[1] == "Käfer" || target.typ[1] == "Wasser") {
        return 3;
      } else {
        return 1;
      }
    } else if (id == 7) { // Tauchball
      askGm("Surft oder Angelt der Trainer?");
      return 0;
    } else if (id == 8) { // Nestball
      var x = Math.round((40 - parseInt(target.level)) / 10);
      if (x<=1) { x = 1; };
      return x;
    } else if (id == 9) { // Wiederball
      askGm("Hat der Trainer das Pokemon bereits?");
      return 0;
    } else if (id == 10) { // Timerball
      var x = Math.round((currentFight.stats.rounds + 10) / 10);
      if (x > 4) { x = 4 };
      return x;
    } else if (id == 11) { // Luxusball
      return 1;
    } else if (id == 12) { // Premierball
      return 1;
    } else if (id == 13) { // Finsterball
      askGm("Ist es Nacht oder in einer Cave?");
      return 0;
    } else if (id == 14) { // Heilball
      return 1;
    } else if (id == 15) { // Flottball
      if (currentFight.stats.rounds == 0) {
        return 4;
      } else {
        return 1;
      }
    } else if (id == 16) { // Jubelball
      return 1;
    } else {
      return 1;
    }
  } else {
    if (id == 7) { // Tauchball
      if (gmQuest == "true") {
        return 3.5;
      } else {
        return 1;
      }
    } else if (id == 9) { // Wiederball
      console.log(gmQuest);
      if (gmQuest == "true") {
        return 3;
      } else {
        return 1;
      }
    } else if (id == 13) { // Finsterball
      if (gmQuest == "true") {
        return 3.5;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  }
}

function askGm(quest) {
  userloop:
  for (iu = 0; iu < clients.length; iu++) {
    if (clients[iu].name == "GameMaster") {
      io.to(clients[iu].id).emit('gm-quest', quest);
      break userloop;
    }
  }
  gmQuest = "";
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function getStatusBonus(status) {
  if (status == null || status == "" || status === 'undefined') {
    return 1;
  } else if (status == "sleep" || status == "freeze") {
    return 2;
  } else if (status == "paralyze" || status == "poison" || status == "burn") {
    return 1.5;
  } else {
    return 1;
  }
}

function catchPokemon() {
  console.log("Catched Pokemon.");
  // Add that pokemon into perma storage
  storage.catchPokemon(currentFight.player, currentFight.pokemon.enemy);
  // Then, end the battle
	setTimeout( function() {
		resetFight();
		updateFight();
	}, 10000);
}
