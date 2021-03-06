# rest-api-squeezebox

## changes in this fork

changed Player.js and PlayerServices.js to use player ID instead of UUID. My squeezebox 2 didn't return a UUID.

added GET /favorites and PATCH /players/:id/favorite methods to get favorites and to play one of them

docker file. needs work to externalise token, port, LMS host, port from package.json 

token moved to a .env file. create this file in the project root

```
TOKEN=you-token
```

## Abstract
This REST API, which runs on nodejs, is a translation of the slimserver / logitech squeezebox server Web RPC API.
Why I do that ? Just beacause it'll be simpler to make mobile app, or actually for me it's to have nicer http requests in IFTTT that I use with my google home mini. I use it to say "Musique dans la salle" or "Chanson suivante" or "Volume à 75 dans la salle" and it's fun ;-)

## Notice
To install, just run "npm install". 
To launch the API, run "npm start".

But, it is very possible you have to change the "script" in your case. 

In fact, notice in package.json the start script is "node src/index.js 192.168.1.12:2311 2312". Usualy, the squeezebox server is 9000, not 2311, and your squeezebox sever is certainly not on 192.168.1.12.
Personnaly, I don't use the default port (9000) for my server, just for security reason.

2312 in the command line means that the API will be accessible in the 2312 port. Of course, you can change it for 8080.

## Endpoint that you can use

### GET /players to know your players on your multi-room logitech squeezebox system
Get players informations. The array returned looks like :
```
[
    {
        "name": "Salle chacha",
        "id": "**:**:**:**:**:**",
        "ip": "192.168.*.*:*****",
        "model": "Squeezebox Touch",
        "firmware_version": "7.8.0-r16754",
        "signal_strength": 88,
        "mixer": {
            "volume": "42",
            "bass": "50",
            "treble": "50",
            "power": "on"
        },
        "play_state": "pause",
        "song_currently_played": {
            "index_in_playlist" : 3,
            "seconds_played": 183.890504037857,
            "duration": "258.466",
            "artist": "The Smashing Pumpkins",
            "album": "Mellon Collie and the Infinite Sadness (2012 - Remaster)",
            "title": "Bullet With Butterfly Wings",
            "is_remote": true,
            "path": "spotify://track:4qMzPtAZe0C9KWpWIzvZAP"
        }
    },
    {
    "name": "Musique salle de bain",
    "id": "**:**:**:**:**:**",
    "ip": "192.168.*.*:*****",
    "model": "Squeezebox Radio",
    "firmware_version": "7.7.3-r16676",
    "signal_strength": 88,
    "mixer": {
        "volume": "42",
        "bass": "50",
        "treble": "50",
        "power": "on"
    },
    "play_state": "pause",
    "song_currently_played": {
        "index_in_playlist" : 3,
        "seconds_played": 183.890504037857,
        "duration": "258.466",
        "artist": "The Smashing Pumpkins",
        "album": "Mellon Collie and the Infinite Sadness (2012 - Remaster)",
        "title": "Bullet With Butterfly Wings",
        "is_remote": true,
        "path": "spotify://track:4qMzPtAZe0C9KWpWIzvZAP"
    }
}
]
```

### GET /players/{id} just to have the information to display
Get informations for one player. The object returned looks like : 
```
{
    "name": "Musique salle de bain",
    "id": "**:**:**:**:**:**",
    "ip": "192.168.*.*:*****",
    "model": "Squeezebox Radio",
    "firmware_version": "7.7.3-r16676",
    "signal_strength": 88,
    "mixer": {
        "volume": "42",
        "bass": "50",
        "treble": "50",
        "power": "on"
    },
    "play_state": "pause",
    "song_currently_played": {
        "index_in_playlist" : 3,
        "seconds_played": 183.890504037857,
        "duration": "258.466",
        "artist": "The Smashing Pumpkins",
        "album": "Mellon Collie and the Infinite Sadness (2012 - Remaster)",
        "title": "Bullet With Butterfly Wings",
        "is_remote": true,
        "path": "spotify://track:4qMzPtAZe0C9KWpWIzvZAP"
    }
}
```

### GET /favorites
Get list of favorites
```
[
    {
        "id": "157b8bae.0",
        "name": "BBC Radio Fourfm (mp3 128kbps)",
        "type": "audio",
        "isaudio": 1,
        "hasitems": 0
    },
    {
        "id": "157b8bae.1",
        "name": "BBC 6music (mp3 128kbps)",
        "type": "audio",
        "isaudio": 1,
        "hasitems": 0
    }
]
```

### PATCH /players/{id} to play or stop your music, or to change the song to play
Actually, you just can change the value of play_state and the index_in_playlist of the song_currently_played object. So the body of the request could look like  :
```
{
    "play_state": "play", // can be play, pause or stop
    "song_currently_played" : {
        "index_in_playlist" : 4
    }
}
```
If you change the value of play_state of you player, it will play or stop the music on your player.
Notice that it's possible to change the song played for the next in playlist, if you send "+1" for song_currently_played.index_in_playlist.

### PATCH /players/{id}/mixer to turn off or on a player, or just to change the volume
PATCH /players/{id}/mixer is to patch the mixer :-). So you can use it to turn on or off your player, or change volume, bass and treble. For example, if you want turn off your player, you can send :
```
{
    "power": "off"
}
```
Or, if you want to change the volume : 
```
{
    "volume": "15"
}
```
Refer to the GET /players/{id} to see what is the mixer object.


### PATCH /players/{id}/playlist to change the playlist to play on the player
You can change the playlist to play in different ways.
1. With the path of a playlist.
2. With the name of an artist or the title of an album, which will be used for a search on your slimserver.

For the first way, the request object just contains one attibute : "path", for example :
```
{
    "path" : "spotify://user:legrosmanu:playlist:40xqGToCIq7PLn4CdZSNAO"
}
```
For the second way, the request object contains "album_title" or "artist_name" attributes, for example :
```
{
    "album_title" : "black album"
} 
or 
{
    "artist_name" : "metallica"
}
```
### PATCH /players/{id}/favorite to play an item from the favorite list
set one of the favorites playing on the chosen player

send the index of the favorite 

play the first item:
```
{
    "play" : "item_id:0"
}
```

play the second item:
```
{
    "play" : "item_id:1"
}
```
### DELETE /player/{id}/playlist to remove all the tracks on the playlist
Just clear all the tracks with the DELETE verb.

## Docker

build with
```
docker build -t rest-api-squeezebox .
```

run with
```
docker run -p 8080:8080 rest-api-squeezebox
```