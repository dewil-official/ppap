const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./permaData');

// Convert local storage to JSON
function getUsers(){
  return JSON.parse(localStorage.getItem('users'));
}

function setUsers(obj){
  localStorage.setItem('users', JSON.stringify(obj));
}

// Storage related Functions
function getUserByName(n) {
  var users = getUsers();
  for (u of users) {
    if (u.name == n) {
      return u;
    }
  }
}

function setUser(n) {
  var users = getUsers();
  for (i = 0; i < users.length; i++) {
    if (users[i].name == n.name) {
      users[i] = n;
    }
  }
  setUsers(users);
}

function newPokemon(u, pkmn) {
  var users = getUsers();
  for (i = 0; i < users.length; i++) {
    if (users[i].name == u) {
      // Check if team is full
      if (users[i].team.length >= 6) {
        users[i].bank.push(pkmn);
      } else {
        users[i].team.push(pkmn);
      }
    }
  }
  setUsers(users);
}

// External access to this functions
module.exports.getUsers = function() {
  return getUsers();
}

module.exports.getUserByName = function(n) {
  return getUserByName(n);
}

module.exports.getTeamByName = function(n) {
  return getUserByName(n).team;
}

module.exports.setUsers = function(u) {
  setUsers(u);
}

module.exports.setUser = function(u) {
  setUser(u);
}

module.exports.catchPokemon = function(uname, pkmn) {
  newPokemon(uname, pkmn);
}
