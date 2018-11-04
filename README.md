# Pokemon Pen And Paper App

## 💡 The Idea

About 3 weeks before starting this project I started a **pen & paper adventure** with my friends, where I tried to mimic the **original Pokemon Game experience** with some more creativeness and of course, the live multiplayer. This turned out to be a great idea, however, I had to go through the Pokemon wiki every time a player meets a pokemon.

Then this idea was born: Create a **simple app** that goes trough the **wiki** for me and **automates** the battles as well. Every player has his pokemon and his items on his phone. This adds a big layer of simplicity, especially for those players that aren't familiar with the original Pokemon Games. Of course this would take away the "Pen And Paper" aspect, but I still love the idea.

## 🎩 The Concept

This app relies on the following:
* [NodeJS](https://nodejs.org/en/)
* [Express](https://expressjs.com/) for easy Website delivery
* [SocketIO](https://socket.io/) for all further Communication
* [Pokeapi JS Wrapper](https://github.com/PokeAPI/pokeapi-js-wrapper) for all Game Information
* [Pokedex](https://github.com/contolini/pokedex) for GIF Images
* [LocalStorage](https://github.com/lmaccherone/node-localstorage) as an easy, synchronous permanent storage (MongoDB and anything else I tried wasn't synchronous, which does not work together with Socket.IO function calls)

## 💣 Goals

* **Learn** the basic JS/Node principles of a Server
* Simple automatic **information acquisition**
* A **clean UI**
* Putting all of this on a small Raspberry Pi as a portable server

## 💌 Contribute

This is primarly a personal project of mine, but if you want to review, test and maybe improve my code, I appreciate any help! I am open to any critics because I'm still learning and my code isn't perfect. It probably isn't formatted very well too, but that is something I'll want to improve once it is all working. 😉
