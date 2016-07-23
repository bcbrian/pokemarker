import { Mongo } from 'meteor/mongo';
import _ from 'lodash';
import { Pokeio as PokeioConstruct } from 'pokemon-go-node-api';
import { Pokemon } from "/imports/api/pokemon/pokemon.js";
import { pokemons } from "./pokemons.js";

// export const Pokemon = new Mongo.Collection("pokemon");
//
// Pokemon.allow({
//   insert: function (userId, pokemon) {
//     return userId && pokemon.owner === userId;
//   },
//   update: function (userId, pokemon, fields, modifier) {
//     return userId === pokemon.owner;
//   },
//   remove: function (userId, pokemon) {
//     return userId && pokemon.owner === userId;
//   }
// });

Meteor.methods({
  'getLivePokemon'(currentLocation) {
    var Pokeio = new PokeioConstruct();
    var y = currentLocation.lat;
    var x = currentLocation.lng
    var location = {
      type: 'coords', //(location.type !== 'name' && location.type !== 'coords')
      coords: {
        latitude : y,
        longitude : x
      }
    };

    var username = process.env.PGO_USERNAME || '';
    var password = process.env.PGO_PASSWORD || '';
    var provider = process.env.PGO_PROVIDER || ''; //(provider !== 'ptc' && provider !== 'google') {

    // var convertAsyncToSync  = Meteor.wrapAsync( HTTP.get ),
    //     resultOfAsyncToSync = convertAsyncToSync( 'http://jsonplaceholder.typicode.com/comments', {} );

    var pokeInit = Meteor.wrapAsync( Pokeio.init );
    var pokeSetLocation = Meteor.wrapAsync( Pokeio.SetLocation );

    var profile = pokeInit(username, password, location, "ptc");
    console.log("Pofile: ", profile);
    var pokeGetProfile = Meteor.wrapAsync( Pokeio.GetProfile );
    var gottenProfile = pokeGetProfile();
    if(!gottenProfile) {
      profile = pokeInit("", "", location, "google");


      gottenProfile = pokeGetProfile();
      if(!gottenProfile) {
        throw new Meteor.Error("Servers are down.");
      }
    }

    var setLocation = pokeSetLocation(location);


    var pokeHeartbeat = Meteor.wrapAsync( Pokeio.Heartbeat );

    var delta = 0.0025;
    var x2 = x-2*delta;
    var y2 = y-2*delta;
    var coords = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        coords.push([
          y2+i*delta, x2+j*delta
        ])
      }
    }
    var pokemonList = [];
    console.log("DOING THIS WITH: ", y, x);
    coords.forEach((coord, index)=>{
      console.log("Setting up setion ", index);
      var setLocation = pokeSetLocation({
        type: 'coords', //(location.type !== 'name' && location.type !== 'coords')
        coords: {
          latitude : coord[0],
          longitude : coord[1]
        }
      });
      var hb = pokeHeartbeat();
      pokemonList = manageHB(pokemonList,hb);
    });

    Pokeio = undefined;
    return pokemonList;

  }
});

function manageHB(pokemonList, hb){
  pokemonList = pokemonList || [];

  for (var i = hb.cells.length - 1; i >= 0; i--) {
      // if(hb.cells[i].NearbyPokemon[0]) {
          var cell = hb.cells[i];

    for (var j = hb.cells[i].WildPokemon.length - 1; j >= 0; j--) {
      var pokemon = hb.cells[i] && hb.cells[i].WildPokemon[j] && hb.cells[i].WildPokemon[j].PokedexNumber && Pokeio.pokemonlist[parseInt(hb.cells[i].WildPokemon[j].PokedexNumber)-1]
      var wpoke = hb.cells[i].WildPokemon[j];
      if(wpoke){
        var obj = {
          "spawnPointId": wpoke.SpawnPointId,
          "lat": wpoke.Latitude,
          "lng": wpoke.Longitude,
          "disappear_time": Date.now() + wpoke.TimeTillHiddenMs,
          "pokeId": wpoke.pokemon.PokemonId,
          "name": pokemons.pokemon[wpoke.pokemon.PokemonId-1].name.toLocaleLowerCase(),
          "time": Date.now(),
        };
        pokemonList = pushIfNew(pokemonList, obj, "spawnPointId");
      }
    }
  }


  // return resultOfAsyncToSync;
  return pokemonList;
}
function pushIfNew(array, obj, key) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === obj[key]) { // modify whatever property you need
      return array;
    }
  }
  array.push(obj);
  return array;
}

/*

{
  "spawnPointId": poke.SpawnPointId,
  "lat": poke.Latitude,
  "lng": poke.Longitude,
  "disappear_time": disappear_timestamp,
  "pokeId": poke.pokemon.PokemonId,
  "name": pokename.lower(),
  "time": datetime.now()
}

{
  "EncounterId": {
    "low": -1058944067,
    "high": 651256639,
    "unsigned": true
  },
  "LastModifiedMs": {
    "low": 277955631,
    "high": 342,
    "unsigned": false
  },
  "Latitude": 45.008804306269646,
  "Longitude": -93.12204339033609,
  "SpawnPointId": "52b32a6a201",
  "pokemon": {
    "Id": null,
    "PokemonId": 18
  },
  "TimeTillHiddenMs": 566517
}

        */
