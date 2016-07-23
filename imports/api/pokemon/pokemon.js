import { Mongo } from 'meteor/mongo';

export const Pokemon = new Mongo.Collection("pokemon");

Pokemon.allow({
  insert: function (userId, pokemon) {
    return userId && pokemon.owner === userId;
  },
  update: function (userId, pokemon, fields, modifier) {
    return userId === pokemon.owner;
  },
  remove: function (userId, pokemon) {
    return userId && pokemon.owner === userId;
  }
});

Meteor.methods({
  "pokemon:insert"(pokemon) {
    pokemon.lat = parseFloat(pokemon.lat);
    pokemon.lng = parseFloat(pokemon.lng);
    pokemon.time = parseFloat(pokemon.time);
    pokemon.name = pokemon.name.toLowerCase();
    let count = Pokemon.find({spawnPointId:pokemon.spawnPointId, name:pokemon.name}).count();
    if(count > 0){
      console.log("Already found this stop:)");
      return;
    }
    Pokemon.insert(pokemon);
    console.log("SUCSESS");
  },
  'getPokemon'({pokemonSearchString, top, bottom, left, right}) {
    top = parseFloat(top);
    bottom = parseFloat(bottom);
    right = parseFloat(right);
    left = parseFloat(left);
    let sections = [];
    let vertDiff = (top - bottom)/4;
    let horzDiff = (right - left)/4;
    //for a group use average of the group maybe...
    // for (var i = 0; i < 3; i++) {
    //   for (var j = 1; j < 3; j++) {
    //     section.push({
    //       id:""+i+j,
    //       querys : [],
    //       pokemonSearchString:pokemonSearchString,
    //       box:[{
    //         "lat":{
    //           "$lt":top - (i)vertDiff,
    //           "$gt":bottom + (2-i)vertDiff
    //         }
    //       },{
    //         "lng":{
    //           "$lt":right - (j)horzDiff,
    //           "$gt":left + (2-j)horzDiff
    //         }
    //       }]
    //     })
    //   }
    // }
    //Loop
    if(pokemonSearchString){
      querys.push({name:pokemonSearchString});
    }
    if(top && bottom && left && right){
      querys.push({"lat":{"$lt":top, "$gt":bottom}});
      querys.push({"lng":{"$lt":right, "$gt":left}});
    }
    if(!querys || querys.length < 1){
      return Pokemon.find();
    }
    // return Pokemon.find({"$and":querys}, {fields: {thumbs: 0}}); // might need fir performance
    return Pokemon.find({"$and":querys}, {limit: 400}).fetch();
    // return Pokemon.find({"$and":querys}).fetch();
  }
});

/*
{
  "spawnPointId": poke.SpawnPointId,
  "lat": poke.Latitude,
  "lng": poke.Longitude,
  "disappear_time": disappear_timestamp,
  "id": poke.pokemon.PokemonId,
  "name": pokename
  "time": dt.microsecond,
}
        */
