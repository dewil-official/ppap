/*
  This file is using the storage.js functionality
  in order to create some userData for Testing
*/

// Import the storage.js dependency
const storage = require('../server/storage.js');

// Generate the data

storage.setUsers([{ name: "Alex", passwort: "ikd", team: [{name:"Glurak",id:6,typ:["Feuer","Flug"],level:45,img:"https://www.pokewiki.de/images/9/96/Sugimori_006.png",gender:"w",nature:12,attacks:[{name:"Schlitzer",typ:"Normal",url:"https://pokeapi.co/api/v2/move/163/",pp:20,ppMax:20},{name:"Funkenflug",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/481/",pp:15,ppMax:15},{name:"Feuerzahn",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/424/",pp:15,ppMax:15},{name:"Grimasse",typ:"Normal",url:"https://pokeapi.co/api/v2/move/184/",pp:10,ppMax:10}],stats:{hp:{base:78,iv:20,ev:0},atk:{base:84,iv:20,ev:0},def:{base:78,iv:20,ev:0},spAtk:{base:109,iv:20,ev:0},spDef:{base:85,iv:20,ev:0},speed:{base:100,iv:20,ev:0}},hp:185}]}, { name: "GameMaster", passwort: "Gu1tarre" }]);

var user = { name: "Alex", passwort: "ikd", team: [{name:"Glurak",id:6,typ:["Feuer","Flug"],level:45,img:"https://www.pokewiki.de/images/9/96/Sugimori_006.png",gender:"w",nature:12,attacks:[{name:"Schlitzer",typ:"Normal",url:"https://pokeapi.co/api/v2/move/163/",pp:20,ppMax:20},{name:"Funkenflug",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/481/",pp:15,ppMax:15},{name:"Feuerzahn",typ:"Feuer",url:"https://pokeapi.co/api/v2/move/424/",pp:15,ppMax:15},{name:"Grimasse",typ:"Normal",url:"https://pokeapi.co/api/v2/move/184/",pp:10,ppMax:10}],stats:{hp:{base:78,iv:20,ev:0},atk:{base:84,iv:20,ev:0},def:{base:78,iv:20,ev:0},spAtk:{base:109,iv:20,ev:0},spDef:{base:85,iv:20,ev:0},speed:{base:100,iv:20,ev:0}},hp:185}]};

var user = { name: "GameMaster", passwort: "Gu1tarre" };
