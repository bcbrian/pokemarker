// import { Meteor } from 'meteor/meteor';
// import { Pokemon } from "../pokemon.js";
// Meteor.publish("pokemon", function (querys) {
//   if(!querys || querys.length < 1){
//     return Pokemon.find({}, {limit: 400});
//     // return Pokemon.find({});
//   }
//   // return Pokemon.find({"$and":querys}, {fields: {thumbs: 0}}); // might need fir performance
//   return Pokemon.find({"$and":querys}, {limit: 400});
//   // return Pokemon.find({"$and":querys});
// });
