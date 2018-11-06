const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./storage');

// Convert local storage to JSON
function getUsers(){
  return JSON.parse(localStorage.getItem('users'));
}

function setUsers(obj){
  localStorage.setItem('users', JSON.stringify(obj));
}

// Everthing this file is being used for
module.exports = {

  getUserByName: function(n) {
    var users = getUsers();
    for (u of users) {
      if (u.name == n) {
        return u;
      }
    }
  },

  getTeamByName: function(n) {
    return getUserByName(n).team;
  }

}
