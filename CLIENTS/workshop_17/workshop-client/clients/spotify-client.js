'use strict';

var nodeSpotifyWebHelper = require('node-spotify-webhelper');

var SpotifyClient = function () {
  this.spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();
}
SpotifyClient.prototype.getRandomInt = function(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

SpotifyClient.prototype.start = function () {
  var trackIDs = ['2Ae5awwKvQpTBKQHr1TYCg', '2CPqh63wRVscbceKcPxwvv', '0nAo3RrqcYHauN7eIQIJJz', '2MHCiOohBZEQuLgDTPvSzF', '0qRZ9ydGdzeVk3S01pLGoJ', '5dKyZWlgjWw1oJgLa4GCZD', '06KyNuuMOX1ROXRhj787tj', '4XuK9jJP3mpYBq5qf68vfF', '3GBlLqIYgB8zWaeWDNJzdh', '4CBM38zmBBV7ytoRU1TuOc', '6UcTHiP25meOD9ox8Rspgx', '60lwJa695S26FsYbhCVFVa', '7gZQfdEQpmwAoPHSbEHzms', '7lQqaqZu0vjxzpdATOIsDt', '0h4FK0CnlZ3oJnZ6quEk1P', '6bLopGnirdrilrpdVB6Um1', '7BKLCZ1jbUBVqRi2FVlTVw', '0L9lXMXddmoBbBUeF7A9An', '6LUOMjoORvAkdhBYvESO46', '4pdPtRcBmOSQDlJ3Fk945m', '594Id4J7VH4nVIfI1FwhP9', '4pLwZjInHj3SimIyN9SnOz'],
    randomPosition = this.getRandomInt(0, trackIDs.length - 1),
    track = 'spotify:track:' + trackIDs[randomPosition];

  console.log('trackIDs position: ', randomPosition);
  console.log('TrackCall: ', track);

  this.spotify.play(track, function (err, res) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Music started");
  });
}

SpotifyClient.prototype.stop = function () {
  this.spotify.pause(function (err, res) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Music stopped");
  });
}


module.exports = SpotifyClient;