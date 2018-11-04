// Imports
var socket = io();

/* ---------------------------------------------
|                 Pre-Login Page                |
--------------------------------------------- */

// Started after loading the page; If user is logged in already, skip to play-html
function loaded(){
  if (sessionStorage.getItem("name") == null || sessionStorage.getItem("name") == "") {
    // If the user hasn't been logged in, start the login process
    socket.emit('requestUserList');
  } else {
    // Else, skip the login
    window.location.href = "/play";
  }
}

// Network Stuff
socket.on('userList', function(arr){ // Answer to the requested User List
  populateUserList(arr);
});
socket.on('login-success', function(){ // Answer to the requested User List
  sessionStorage.setItem("name", document.querySelector('#name-field').innerHTML);
  window.location.href = "/play";
});
socket.on('login-failure', function(){ // Answer to the requested User List
  if (sessionStorage.getItem("name") == null || sessionStorage.getItem("name") == "") {sessionStorage.removeItem("name");}
  location.reload();
});

// Login-Mechanics
  // Initial User List Update
  function populateUserList(arr){
    // Clear List
    document.getElementById("user-login-dropdown").innerHTML = null;

    // Add Options
    for (i = 0; i < arr.length; ) {
      document.getElementById("user-login-dropdown").innerHTML = document.getElementById("user-login-dropdown").innerHTML
      + "<option>" + arr[i].name + "</option>"
      i++;
    }
  }

  function login() {
    if (document.getElementById("reg-passwort").value !== "") {
      if (document.querySelector('#reg-passwort').classList.contains('is-danger')) {document.querySelector('#reg-passwort').classList.remove('is-danger');}
      document.querySelector('#search-button').classList.add('is-loading');
      req = {
        name: document.querySelector('#name-field').innerHTML,
        passwort: document.querySelector('#reg-passwort').value
      }
      socket.emit('login', req)
    } else { document.querySelector('#reg-passwort').classList.add('is-danger'); }
  }

  function register(){
    // Clear Red Box Borders
    if (document.querySelector('#reg-name').classList.contains('is-danger')) {document.querySelector('#reg-name').classList.remove('is-danger');}
    if (document.querySelector('#reg-herkunft').classList.contains('is-danger')) {document.querySelector('#reg-herkunft').classList.remove('is-danger');}
    if (document.querySelector('#reg-klasse').classList.contains('is-danger')) {document.querySelector('#reg-klasse').classList.remove('is-danger');}
    if (document.querySelector('#reg-alter').classList.contains('is-danger')) {document.querySelector('#reg-alter').classList.remove('is-danger');}
    if (document.querySelector('#reg-passwort').classList.contains('is-danger')) {document.querySelector('#reg-passwort').classList.remove('is-danger');}

    // Check if all Boxes are filled with something
    if (document.getElementById("reg-name").value == "") { document.querySelector('#reg-name').classList.add('is-danger'); }
    else if (document.getElementById("reg-herkunft").value == "") { document.querySelector('#reg-herkunft').classList.add('is-danger'); }
    else if (document.getElementById("reg-klasse").value == "") { document.querySelector('#reg-klasse').classList.add('is-danger'); }
    else if (document.getElementById("reg-alter").value == "") { document.querySelector('#reg-alter').classList.add('is-danger'); }
    else if (document.getElementById("reg-passwort").value == "") { document.querySelector('#reg-passwort').classList.add('is-danger'); }
    else {
      // Get Form Data
      var obj = {
        name: document.getElementById("reg-name").value,
        herkunft: document.getElementById("reg-herkunft").value,
        trainerklasse: document.getElementById("reg-klasse").value,
        alter: document.getElementById("reg-alter").value,
        passwort: document.getElementById("reg-passwort").value
      }
      console.log(obj);
      socket.emit('registerUser', obj);
      document.querySelector('#search-button').classList.add('is-loading');
    }
  }

  // Load the "new user" Page
  function registerPage() {
    document.getElementById("bottom-section").innerHTML = '<div class="container"><p class="subtitle"><strong>Login</strong></p>Name:  <input class="input" type="text" placeholder="Name" id="reg-name">Herkunft: <input class="input" type="text" placeholder="Herkunft" id="reg-herkunft">Trainerklasse: <input class="input" type="text" placeholder="Trainerklasse" id="reg-klasse">Alter: <input class="input" type="text" placeholder="Alter" id="reg-alter">Passwort: <input class="input" type="text" placeholder="Passwort" id="reg-passwort"><a class="button is-warning" id="search-button" style="margin-top:0.5em" onclick="register();">Registrieren</a></div>';
    /*  <div class="container">
        <p class="subtitle">
          <strong>Login</strong>
        </p>
        Name:  <input class="input" type="text" placeholder="Name" id="reg-name">
        Herkunft: <input class="input" type="text" placeholder="Herkunft" id="reg-herkunft">
        Trainerklasse: <input class="input" type="text" placeholder="Trainerklasse" id="reg-klasse">
        Alter: <input class="input" type="text" placeholder="Alter" id="reg-alter">
        Passwort: <input class="input" type="text" placeholder="Passwort" id="reg-passwort">
        <a class="button is-warning" id="search-button" style="margin-top:0.5em" onclick="register();">Registrieren</a>
      </div>*/
  }

  // Load the "login" page
  function loginPage() {
    document.getElementById("bottom-section").innerHTML = '<div class="container"><p class="subtitle"><strong>Login</strong></p>Name:  <h2><strong id="name-field">' + document.getElementById("user-login-dropdown").value + '</strong></h2>Passwort: <input class="input" type="text" placeholder="Passwort" id="reg-passwort"><a class="button is-warning" id="search-button" style="margin-top:0.5em" onclick="login();">Login</a></div>';
    document.getElementById("reg-passwort").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("search-button").click();
        }
    });
    /*  <div class="container">
        <p class="subtitle">
          <strong>Login</strong>
        </p>
        Name:  <input class="input" type="text" placeholder="Name" id="reg-name">
        Passwort: <input class="input is-warning" type="text" placeholder="Passwort" id="reg-passwort">
        <a class="button is-warning" id="search-button" style="margin-top:0.5em" onclick="login();">Login</a>
      </div>*/
  }
