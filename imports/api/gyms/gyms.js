import { Mongo } from 'meteor/mongo';

export const Gyms = new Mongo.Collection("gyms");

Gyms.allow({
  insert: function (userId, gym) {
    return userId && gym.owner === userId;
  },
  update: function (userId, gym, fields, modifier) {
    return userId === gym.owner;
  },
  remove: function (userId, gym) {
    return userId && gym.owner === userId;
  }
});

Meteor.methods({
  "gym:insert"(gym) {
    gym.lat = parseFloat(gym.lat);
    gym.lng = parseFloat(gym.lng);
    gym.time = parseFloat(gym.time);
    let count = Gyms.find({gymId:Gym.gymId}).count();
    if(count > 0){
      console.log("Already found this gym:)");
      return;
    }
    Gyms.insert(gym);
    console.log("SUCSESS");
  },
});

/*
{
  "spawnPointId": poke.SpawnPointId,
  "lat": poke.Latitude,
  "lng": poke.Longitude,
  "disappear_time": disappear_timestamp,
  "pokeId": poke.gym.GymsId,
  "name": pokename
  "time": dt.microsecond,
}
        */
