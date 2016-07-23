import { Mongo } from 'meteor/mongo';

export const Stops = new Mongo.Collection("stops");

Stops.allow({
  insert: function (userId, stop) {
    return userId && stop.owner === userId;
  },
  update: function (userId, stop, fields, modifier) {
    return userId === stop.owner;
  },
  remove: function (userId, stop) {
    return userId && stop.owner === userId;
  }
});

Meteor.methods({
  "stops:insert"(stop) {
    stop.lat = parseFloat(stop.lat);
    stop.lng = parseFloat(stop.lng);
    stop.time = parseFloat(stop.time);
    let count = Stops.find({stopId:stop.stopId}).count();
    if(count > 0){
      console.log("Already found this stop:)");
      return;
    }
    Stops.insert(stop);
    console.log("SUCSESS");
  },
});

/*
{
  "spawnPointId": poke.SpawnPointId,
  "lat": poke.Latitude,
  "lng": poke.Longitude,
  "disappear_time": disappear_timestamp,
  "id": poke.stops.StopsId,
  "name": pokename
  "time": dt.microsecond,
}
        */
