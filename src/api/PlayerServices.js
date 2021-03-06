let SlimHelper = require('../slim-server-wrapper/SlimHelper');
var Player = require('../integration/player/Player');

exports.setEndPoints = function (app) {

    // We have to check how much we have players to get all the players, 
    // then get the players.
    app.get('/players', requireAuthentication, async (req, res) => {
        try {
            const resultNbPlayers = await SlimHelper.sendRequest(['-', ['player', 'count', '?']]);
            const resultPlayers = await SlimHelper.sendRequest(['-', ['players', '0', resultNbPlayers._count]]);
            let players = resultPlayers.count > 0 ? resultPlayers.players_loop.map(playerFromSlim => new Player(playerFromSlim.playerid)) : [];
            const initPlayerPromises = players ? players.map(player => player.init()) : [];
            await Promise.all(initPlayerPromises);
            let playersToSend = [];
            for (let player of players) {
                playersToSend.push(player.toAPI());
            }
            res.send(playersToSend.length > 0 ? playersToSend : "no players");
        } catch (error) {
            let errorToSend = errorManager(error, 'GET', '/players');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });

    app.get('/players/:id', requireAuthentication, async (req, res) => {
        try {
            let player = new Player(req.params.id);
            await player.init();
            res.send(player.toAPI());
        } catch (error) {
            let errorToSend = errorManager(error, 'GET', '/players/:id');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });

    app.get('/favorites', requireAuthentication, async (req, res) => {
        try {
            const favorites = await SlimHelper.sendRequest(["-", ["favorites", "items", 0, 10, ""]]);
            res.send(favorites.loop_loop);
        } catch (error) {
            let errorToSend = errorManager(error, 'GET', '/favorites');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }   
    });

    // According to the body, we had on an array the promises to execute, and then execute them.
    app.patch('/players/:id', requireAuthentication, async (req, res) => {
        try {
            let player = new Player(req.params.id);
            await player.init();
            let changesToDo = [];
            if (req.body.play_state !== undefined) changesToDo.push(player.setPlayState(req.body.play_state));
            if (req.body.song_currently_played !== undefined) {
                var songPlayed = player.getSongPlayed();
                if (req.body.song_currently_played.index_in_playlist == '+1') {
                    changesToDo.push(songPlayed.nextTrack());
                } else if (req.body.song_currently_played.index_in_playlist == '-1') {
                    changesToDo.push(songPlayed.previousTrack());
                } else {
                    changesToDo.push(player.songPlayed.setIndexSongPlayedOnPlaylist(req.body.song_currently_played.index_in_playlist));
                }
            }
            await Promise.all(changesToDo);
            res.sendStatus(204);
        } catch (error) {
            let errorToSend = errorManager(error, 'PATCH', '/players/:id');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });

    // To change the playlist to play on the player, this endpoint wait the path of the new playlist
    app.patch('/players/:id/playlist', requireAuthentication, async (req, res) => {
        try {
            let player = new Player(req.params.id);
            await player.init();
            if (req.body.path !== undefined) {
                await player.getPlaylist().changePath(req.body.path);
            } else if (req.body.album_title !== undefined) {
                await player.getPlaylist().searchAlbum(req.body.album_title);
            } else if (req.body.artist_name !== undefined) {
                await player.getPlaylist().searchArtist(req.body.artist_name);
            } else {
                let error = {
                    codeHTTP: 400,
                    message: "The object is not well formed."
                };
                throw error;
            }
            res.sendStatus(204);
        } catch (error) {
            let errorToSend = errorManager(error, 'PATCH', '/players/:id/playlist');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });

    app.delete('/players/:id/playlist', requireAuthentication, async (req, res) => {
        try {
            let player = new Player(req.params.id);
            await player.init();
            await player.getPlaylist().clear();
            res.sendStatus(204);
        } catch (error) {
            let errorToSend = errorManager(error, 'DELETE', '/players/:id/playlist');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });

    // According to the body, we had on an array the promises to execute, and then execute them.
    app.patch('/players/:id/mixer', requireAuthentication, async (req, res) => {
        try {
            let player = new Player(req.params.id);
            await player.init();
            let mixer = await player.getMixer();
            let changesToDo = [];
            if (req.body.power !== undefined) changesToDo.push(mixer.setPower(req.body.power));
            if (req.body.volume !== undefined) changesToDo.push(mixer.setVolume(req.body.volume));
            if (req.body.bass !== undefined) changesToDo.push(mixer.setBass(req.body.bass));
            if (req.body.treble !== undefined) changesToDo.push(mixer.setTreble(req.body.treble));
            await Promise.all(changesToDo);
            res.sendStatus(204);
        } catch (error) {
            let errorToSend = errorManager(error, 'PATCH', '/players/:id/mixer');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });

    app.patch('/players/:id/favorite', requireAuthentication, async (req, res) => {
        try {
            let player = new Player(req.params.id);
            await player.init();
            let changesToDo = [];
            if (req.body.play !== undefined) {
                var songPlayed = player.getSongPlayed();
                changesToDo.push(songPlayed.playFav(player.id, req.body.play)); // "item_id:0"
            }
            await Promise.all(changesToDo, player.init());
            await player.init();
            res.send(player.toAPI());
        } catch (error) {
            let errorToSend = errorManager(error, 'PATCH', '/player/:id/favorite');
            res.status(errorToSend.codeHTTP).send(errorToSend);
        }
    });    

};

var errorManager = (error, HTTPMethod, URI) => {
    let errorToSend;
    if (error && error.codeHTTP !== undefined) {
        errorToSend = error;
    } else {
        errorToSend = {
            codeHTTP: 500,
            message: 'There is a problem with the ' + HTTPMethod + ' on ' + URI
        };
    }
    return errorToSend;
};

// Simple security - just check a token.
var requireAuthentication = (req, res, next) => {
    if (req.query.token == process.env.TOKEN) {
        next();
    } else {
        res.sendStatus(403);
    }
};