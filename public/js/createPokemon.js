/*
    Imports
*/

const options = {  cache: true,  timeout: 5 * 1000 /* 5s */, protocol: 'https'  }
const P = new Pokedex.Pokedex(options);

/*
    MAIN FUNCTIONS
*/

async function generatePokemon(pkmnUrl, r) {
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
    gender: getGender(species),
    nature: Math.floor(Math.random() * 25), // Generate Nature (IDs 0-24)
    attacks: await getAttacks(pkmn, level),
    stats: stats,
    hp: Math.floor((2 * stats.hp.base + stats.hp.iv + stats.hp.ev) * level / 100 + level + 10),
  }
  return createdPokemon;
}

async function getTypes(pkmn){
  var t = [];
  for (k = 0; k < pkmn.types.length; k++) {
    var typInfo = await P.resource(pkmn.types[k].type.url);
    t.push(getGermanName(typInfo.names));
  }
  return t;
}

function getGender(species) { // Can either be "m", "w", or "n", depends on the species and some randomness
  var gn = "n";
  if (species.gender_rate >= 0) {
    var random = Math.floor((Math.random() * 8) + 1); // The "gender_rate" determines, how many girls there are out of 8 pokemon. -1 means neutral.
    random = random - species.gender_rate;
    if (random<=0) {
      gn = "w";
    } else { gn = "m"; }
  }
  return gn;
}

async function getLevel(pkmnUrl, r) {
  const area = await P.resource(sessionStorage.getItem("areaUrl"));
    // Get access to the area-data of that pokemon
    var encounterIndex = 0; // Goes through all the possible pokemons in the area
    for (i = 0; i < area.pokemon_encounters.length; i++) {
      if (area.pokemon_encounters[i].pokemon.url == pkmnUrl) { encounterIndex = i; }
    }

    lvlSpan = 0;
    if ( r == 0 ) {
      // Generate a random value in between the levels.
      lvlSpan = Math.floor((Math.random() * area.pokemon_encounters[encounterIndex].version_details[0].max_chance) + 1);
    } else {
      lvlSpan = Math.floor((r/10) * area.pokemon_encounters[encounterIndex].version_details[0].max_chance);
    } // Now use that Value to decide what Level span to choose.
    var minLevel = 0;
    var maxLevel = 0;
    var ix = area.pokemon_encounters[encounterIndex].version_details[0].max_chance; // Initially use the max-level and substract one chance after another from that
    for (i = 0; i < area.pokemon_encounters[encounterIndex].version_details[0].encounter_details.length; i++) {
      ix = ix - area.pokemon_encounters[encounterIndex].version_details[0].encounter_details[i].chance;
      if (ix<=0) {
        minLevel = area.pokemon_encounters[encounterIndex].version_details[0].encounter_details[i].min_level;
        maxLevel = area.pokemon_encounters[encounterIndex].version_details[0].encounter_details[i].max_level;
      }
    }
    // Now, get a random level in that span.
    var level = Math.floor((Math.random() * (maxLevel-minLevel)) + 1) + minLevel;
    if (r !== 0) { level = parseInt(level)-5+parseInt(r); } // Get some more randomness into, whenever the dice rolled.
    if (level <= 0) { level = 1; } else if (level>=100) { level = 100; } // Level cap
    return level;
}

async function getAttacks(pkmn, level) {
  // Count back from the max level through the pokemon's moves, a wild pokemon is automatically learning the last 4 moves that it can learn by level-up.
  var collectingAttacks = 1; var i = pkmn.moves.length - 1; var attacks = [];
  while (collectingAttacks == 1) { // Search as long as the level allows it.
    var dp = ""; // The version_group_details - index number of diamond-pearl
    for (dpi = 0; dpi < pkmn.moves[i].version_group_details.length; dpi++) { // Search for diamond-pearl-index
      if (pkmn.moves[i].version_group_details[dpi].version_group.name == "platinum") { dp = dpi; }
    }
    if (dp == "") { // Try again for platinum
      for (dpi = 0; dpi < pkmn.moves[i].version_group_details.length; dpi++) { // Search for diamond-pearl-index
        if (pkmn.moves[i].version_group_details[dpi].version_group.name == "diamond-pearl") { dp = dpi; }
      }
    }

    // Use dp-index to access the attack data
    if (dp !== "" && pkmn.moves[i].version_group_details[dp].move_learn_method.name == "level-up" && pkmn.moves[i].version_group_details[dp].level_learned_at <= level) { // Attack needs to be learnable in a natural (level-up) way, also the required level needs to be met.
      // Add attack to attacks-array
      var att = await P.resource(pkmn.moves[i].move.url);

      // Get type
      var typGet = await P.resource(att.type.url);

      attacks.push({
        name: getGermanName(att.names),
        typ: getGermanName(typGet.names),
        url: pkmn.moves[i].move.url,
        pp: att.pp,
        ppMax: att.pp,
      });
      // console.log(att);
    }
    i--;
    if (i < 0 || attacks.length == 4) { collectingAttacks = 0; } // Finish searching
  }
  return attacks;
}

async function getStats(pkmn, level) {

  // Generate Stats-Object and return it.
  var stats = {
    hp: {
      base: pkmn.stats[5].base_stat,
      iv: Math.floor(Math.random() * 32),
      ev: 0,
    },
    atk: {
      base: pkmn.stats[4].base_stat,
      iv: Math.floor(Math.random() * 32),
      ev: 0,
    },
    def: {
      base: pkmn.stats[3].base_stat,
      iv: Math.floor(Math.random() * 32),
      ev: 0,
    },
    spAtk: {
      base: pkmn.stats[2].base_stat,
      iv: Math.floor(Math.random() * 32),
      ev: 0,
    },
    spDef: {
      base: pkmn.stats[1].base_stat,
      iv: Math.floor(Math.random() * 32),
      ev: 0,
    },
    speed: {
      base: pkmn.stats[0].base_stat,
      iv: Math.floor(Math.random() * 32),
      ev: 0,
    }
  }; return stats;
}

/*
    HELPER FUNCTIONS
*/

function getGermanName(names){
  var n = "";
  for (l = 0; l < names.length; l++) {
    if (names[l].language.name == "de") {
      n = names[l].name;
    }
  } if (n == "") {
    for (l = 0; l < names.length; l++) {
      if (names[l].language.name == "en") {
        n = names[l].name;
      }
    }
  } if (n == "") {
    n = species.name;
    n = n.charAt(0).toUpperCase() + n.slice(1);
  }
  return n;
}

function getGermanFlavorText(names){
  var n = "";
  for (l = 0; l < names.length; l++) {
    if (names[l].language.name == "de") {
      n = names[l].text;
    }
  } if (n == "") {
    for (l = 0; l < names.length; l++) {
      if (names[l].language.name == "en") {
        n = names[l].text;
      }
    }
  }
  return n;
}

function httpsIfy(url) {
  if (!url.contains("https:") && url.contains("http:")) {
    url.replace("http:", "https:");
  }
  return url;
}

/*
    STATIC VARIABLES
*/

// CONSTANT DATA
const locations = [{"name":"Canalave City","url":"https://pokeapi.co/api/v2/location/1/"},{"name":"Eterna City","url":"https://pokeapi.co/api/v2/location/2/"},{"name":"Pastoria City","url":"https://pokeapi.co/api/v2/location/3/"},{"name":"Sunyshore City","url":"https://pokeapi.co/api/v2/location/4/"},{"name":"Pokémon League","url":"https://pokeapi.co/api/v2/location/5/"},{"name":"Oreburgh Mine","url":"https://pokeapi.co/api/v2/location/6/"},{"name":"Valley Windworks","url":"https://pokeapi.co/api/v2/location/7/"},{"name":"Eterna Forest","url":"https://pokeapi.co/api/v2/location/8/"},{"name":"Fuego Ironworks","url":"https://pokeapi.co/api/v2/location/9/"},{"name":"Mt. Coronet","url":"https://pokeapi.co/api/v2/location/10/"},{"name":"Great Marsh","url":"https://pokeapi.co/api/v2/location/11/"},{"name":"Solaceon Ruins","url":"https://pokeapi.co/api/v2/location/12/"},{"name":"Victory Road","url":"https://pokeapi.co/api/v2/location/13/"},{"name":"Ravaged Path","url":"https://pokeapi.co/api/v2/location/14/"},{"name":"Oreburgh Gate","url":"https://pokeapi.co/api/v2/location/15/"},{"name":"Stark Mountain","url":"https://pokeapi.co/api/v2/location/16/"},{"name":"Spring Path","url":"https://pokeapi.co/api/v2/location/17/"},{"name":"Turnback Cave","url":"https://pokeapi.co/api/v2/location/18/"},{"name":"Snowpoint Temple","url":"https://pokeapi.co/api/v2/location/19/"},{"name":"Wayward Cave","url":"https://pokeapi.co/api/v2/location/20/"},{"name":"Ruin Maniac Cave","url":"https://pokeapi.co/api/v2/location/22/"},{"name":"Trophy Garden","url":"https://pokeapi.co/api/v2/location/23/"},{"name":"Iron Island","url":"https://pokeapi.co/api/v2/location/24/"},{"name":"Old Chateau","url":"https://pokeapi.co/api/v2/location/25/"},{"name":"Lake Verity","url":"https://pokeapi.co/api/v2/location/26/"},{"name":"Lake Valor","url":"https://pokeapi.co/api/v2/location/27/"},{"name":"Lake Acuity","url":"https://pokeapi.co/api/v2/location/28/"},{"name":"Valor Lakefront","url":"https://pokeapi.co/api/v2/location/29/"},{"name":"Acuity Lakefront","url":"https://pokeapi.co/api/v2/location/30/"},{"name":"Route 201","url":"https://pokeapi.co/api/v2/location/31/"},{"name":"Route 202","url":"https://pokeapi.co/api/v2/location/32/"},{"name":"Route 203","url":"https://pokeapi.co/api/v2/location/33/"},{"name":"Route 204","url":"https://pokeapi.co/api/v2/location/34/"},{"name":"Route 205","url":"https://pokeapi.co/api/v2/location/35/"},{"name":"Route 206","url":"https://pokeapi.co/api/v2/location/36/"},{"name":"Route 207","url":"https://pokeapi.co/api/v2/location/37/"},{"name":"Route 208","url":"https://pokeapi.co/api/v2/location/38/"},{"name":"Route 209","url":"https://pokeapi.co/api/v2/location/39/"},{"name":"Lost Tower","url":"https://pokeapi.co/api/v2/location/40/"},{"name":"Route 210","url":"https://pokeapi.co/api/v2/location/41/"},{"name":"Route 211","url":"https://pokeapi.co/api/v2/location/42/"},{"name":"Route 212","url":"https://pokeapi.co/api/v2/location/43/"},{"name":"Route 213","url":"https://pokeapi.co/api/v2/location/44/"},{"name":"Route 214","url":"https://pokeapi.co/api/v2/location/45/"},{"name":"Route 215","url":"https://pokeapi.co/api/v2/location/46/"},{"name":"Route 216","url":"https://pokeapi.co/api/v2/location/47/"},{"name":"Route 217","url":"https://pokeapi.co/api/v2/location/48/"},{"name":"Route 218","url":"https://pokeapi.co/api/v2/location/49/"},{"name":"Route 219","url":"https://pokeapi.co/api/v2/location/50/"},{"name":"Route 221","url":"https://pokeapi.co/api/v2/location/51/"},{"name":"Route 222","url":"https://pokeapi.co/api/v2/location/52/"},{"name":"Route 224","url":"https://pokeapi.co/api/v2/location/53/"},{"name":"Route 225","url":"https://pokeapi.co/api/v2/location/54/"},{"name":"Route 227","url":"https://pokeapi.co/api/v2/location/55/"},{"name":"Route 228","url":"https://pokeapi.co/api/v2/location/56/"},{"name":"Route 229","url":"https://pokeapi.co/api/v2/location/57/"},{"name":"Twinleaf Town","url":"https://pokeapi.co/api/v2/location/58/"},{"name":"Celestic Town","url":"https://pokeapi.co/api/v2/location/59/"},{"name":"Resort Area","url":"https://pokeapi.co/api/v2/location/60/"},{"name":"Sea Route 220","url":"https://pokeapi.co/api/v2/location/61/"},{"name":"Sea Route 223","url":"https://pokeapi.co/api/v2/location/62/"},{"name":"Sea Route 226","url":"https://pokeapi.co/api/v2/location/63/"},{"name":"Sea Route 230","url":"https://pokeapi.co/api/v2/location/64/"},{"name":"Sandgem Town","url":"https://pokeapi.co/api/v2/location/163/"},{"name":"Floaroma Town","url":"https://pokeapi.co/api/v2/location/164/"},{"name":"Solaceon Town","url":"https://pokeapi.co/api/v2/location/165/"},{"name":"Jubilife City","url":"https://pokeapi.co/api/v2/location/167/"},{"name":"Oreburgh City","url":"https://pokeapi.co/api/v2/location/168/"},{"name":"Hearthome City","url":"https://pokeapi.co/api/v2/location/169/"},{"name":"Veilstone City","url":"https://pokeapi.co/api/v2/location/170/"},{"name":"Snowpoint City","url":"https://pokeapi.co/api/v2/location/171/"},{"name":"Spear Pillar","url":"https://pokeapi.co/api/v2/location/172/"},{"name":"Pal Park","url":"https://pokeapi.co/api/v2/location/173/"},{"name":"Amity Square","url":"https://pokeapi.co/api/v2/location/174/"},{"name":"Floaroma Meadow","url":"https://pokeapi.co/api/v2/location/175/"},{"name":"Fullmoon Island","url":"https://pokeapi.co/api/v2/location/177/"},{"name":"Sendoff Spring","url":"https://pokeapi.co/api/v2/location/178/"},{"name":"Flower Paradise","url":"https://pokeapi.co/api/v2/location/179/"},{"name":"Maniac Tunnel","url":"https://pokeapi.co/api/v2/location/180/"},{"name":"Galactic HQ","url":"https://pokeapi.co/api/v2/location/181/"},{"name":"Verity Lakefront","url":"https://pokeapi.co/api/v2/location/182/"},{"name":"Newmoon Island","url":"https://pokeapi.co/api/v2/location/183/"},{"name":"Battle Tower","url":"https://pokeapi.co/api/v2/location/184/"},{"name":"Fight Area","url":"https://pokeapi.co/api/v2/location/185/"},{"name":"Survival Area","url":"https://pokeapi.co/api/v2/location/186/"},{"name":"Seabreak Path","url":"https://pokeapi.co/api/v2/location/187/"},{"name":"Hall of Origin","url":"https://pokeapi.co/api/v2/location/188/"},{"name":"Hall of Origin","url":"https://pokeapi.co/api/v2/location/189/"},{"name":"Verity Cavern","url":"https://pokeapi.co/api/v2/location/190/"},{"name":"Valor Cavern","url":"https://pokeapi.co/api/v2/location/191/"},{"name":"Acuity Cavern","url":"https://pokeapi.co/api/v2/location/192/"},{"name":"Jubilife TV","url":"https://pokeapi.co/api/v2/location/193/"},{"name":"Pokétch Co.","url":"https://pokeapi.co/api/v2/location/194/"},{"name":"GTS","url":"https://pokeapi.co/api/v2/location/195/"},{"name":"Trainers’ School","url":"https://pokeapi.co/api/v2/location/196/"},{"name":"Mining Museum","url":"https://pokeapi.co/api/v2/location/197/"},{"name":"Flower Shop","url":"https://pokeapi.co/api/v2/location/198/"},{"name":"Cycle Shop","url":"https://pokeapi.co/api/v2/location/199/"},{"name":"Contest Hall","url":"https://pokeapi.co/api/v2/location/200/"},{"name":"Poffin House","url":"https://pokeapi.co/api/v2/location/201/"},{"name":"Foreign Building","url":"https://pokeapi.co/api/v2/location/202/"},{"name":"Pokémon Day Care","url":"https://pokeapi.co/api/v2/location/203/"},{"name":"Veilstone Store","url":"https://pokeapi.co/api/v2/location/204/"},{"name":"Game Corner","url":"https://pokeapi.co/api/v2/location/205/"},{"name":"Canalave Library","url":"https://pokeapi.co/api/v2/location/206/"},{"name":"Vista Lighthouse","url":"https://pokeapi.co/api/v2/location/207/"},{"name":"Sunyshore Market","url":"https://pokeapi.co/api/v2/location/208/"},{"name":"Footstep House","url":"https://pokeapi.co/api/v2/location/209/"},{"name":"Café","url":"https://pokeapi.co/api/v2/location/210/"},{"name":"Grand Lake","url":"https://pokeapi.co/api/v2/location/211/"},{"name":"Restaurant","url":"https://pokeapi.co/api/v2/location/212/"},{"name":"Battle Park","url":"https://pokeapi.co/api/v2/location/213/"},{"name":"Battle Frontier","url":"https://pokeapi.co/api/v2/location/214/"},{"name":"Battle Factory","url":"https://pokeapi.co/api/v2/location/215/"},{"name":"Battle Castle","url":"https://pokeapi.co/api/v2/location/216/"},{"name":"Battle Arcade","url":"https://pokeapi.co/api/v2/location/217/"},{"name":"Battle Hall","url":"https://pokeapi.co/api/v2/location/218/"},{"name":"Distortion World","url":"https://pokeapi.co/api/v2/location/219/"},{"name":"Global Terminal","url":"https://pokeapi.co/api/v2/location/220/"},{"name":"Villa","url":"https://pokeapi.co/api/v2/location/221/"},{"name":"Battleground","url":"https://pokeapi.co/api/v2/location/222/"},{"name":"ROTOM's Room","url":"https://pokeapi.co/api/v2/location/223/"},{"name":"T.G. Eterna Bldg","url":"https://pokeapi.co/api/v2/location/224/"},{"name":"Iron Ruins","url":"https://pokeapi.co/api/v2/location/225/"},{"name":"Iceberg Ruins","url":"https://pokeapi.co/api/v2/location/226/"},{"name":"Rock Peak Ruins","url":"https://pokeapi.co/api/v2/location/227/"}];
