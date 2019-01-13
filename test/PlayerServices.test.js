let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../src/index').app;
let server = require('../src/index').server;
let assert = chai.assert;


chai.use(chaiHttp);

const token = {
    token: process.env.TOKEN
}
const invalidToken = {
    token: "invalid"
}
const play = {
    play_state: "play"
}
const pause = {
    play_state: "pause"
}
const stop = {
    play_state: "stop"
}
const invalidPlayState = {
    play_state: "invalid"
}
const playerId = "00:16:3e:6e:85:d0"; // squeeezlite
const invalidPlayerId = "00:00:00:00";
const invalidPath = {
    path: "{_234234"
}
const validPath = {
    path: "/foo/bar"
}
const albumTitle = {
    album_title: "Rave Tapes"
}
const artistName = {
    artist_name: "Mogwai"
}
const invalidPlaylist = {
    invalid: "foo"
}
const powerOff = {
    power: "off"
}
const powerOn = {
    power: "on"
}
const powerInvalid = {
    power: "invalid"
}
const volumeZero = {
    volume: 0
}
const volumeOneHundred = {
    volume: 100
}
const volumeOneHundredOne = {
    volume: 101
}
const volumeMinusOne = {
    volume: -1
}
const firstFavorite = {
    play: "item_id:0"
}
const secondFavorite = {
    play: "item_id:1"
}
const invalidFavorite = {
    play: "invalid"
}
afterEach(function (done) {
    server.close();
    done();
});

describe('GET /players without token', () => {
    it('should return unauthorised', (done) => {
        chai.request(app)
            .get('/players')
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    });
});

describe('GET /players with invalid token', () => {
    it('should return unauthorised', (done) => {
        chai.request(app)
            .get('/players')
            .query(invalidToken)
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    });
});

describe('GET /players with token', () => {
    it('should return all players', (done) => {
        chai.request(app)
            .get('/players')
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });
});

describe.skip('GET /players when none on server', () => {
    it('should return all players', (done) => {
        chai.request(app)
            .get('/players')
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isEmpty(res.body);
                done();
            });
    });
});

describe("GET /favorites without token", () => {
    it("should return unauthorised", (done) => {
        chai.request(app)
            .get("/favorites")
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("GET /favorites with token", () => {
    it("should return all favorites", (done) => {
        chai.request(app)
            .get("/favorites")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    })
});

describe.skip("GET /favorites when server has none ", () => {
    it("should return empty array???", (done) => {
        chai.request(app)
            .get("/favorites")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isEmpty(res.body)
                done();
            });
    })
});

describe("GET /players/:id without token", () => {
    it("should return unauthorised", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("GET /players/:id with token", () => {
    it("should return player", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.id, playerId)
                done();
            });
    })
});

describe("GET /players/:id with invalid ID", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .get("/players/" + invalidPlayerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});

describe("PATCH /players/:id without token", () => {
    it("should return 403", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId)
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("PATCH /players/:id with invalid ID", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});

describe.skip("PATCH /players/:id without body", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe("PATCH /players/:id play", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId)
            .send(play)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should start playing", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.play_state, "play")
                done();
            });
    })
});

describe("PATCH /players/:id pause", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId)
            .send(pause)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should pause", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.play_state, "pause")
                done();
            });
    })
});

describe("PATCH /players/:id stop", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId)
            .send(stop)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should stop", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.play_state, "stop")
                done();
            });
    })
});

describe("PATCH /players/:id invalid play state", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId)
            .send(invalidPlayState)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe("PATCH /players/:id/playlist wihout token", () => {
    it("should return 403", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("PATCH /players/:id/playlist with invalid player ID", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId + "/playlist")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});

describe.skip("PATCH /players/:id/playlist with invalid path", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .query(token)
            .send(invalidPath)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe("PATCH /players/:id/playlist with valid path", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .query(token)
            .send(validPath)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
});


describe("PATCH /players/:id/playlist with valid path", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .query(token)
            .send(validPath)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
});

describe("PATCH /players/:id/playlist with valid album title", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .query(token)
            .send(albumTitle)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    });
    it("should return album title", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.song_currently_played.album, albumTitle.album_title)
                done();
            });
    })
});

describe("PATCH /players/:id/playlist with valid artist name", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .query(token)
            .send(artistName)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    });
    it("should return artist name", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.song_currently_played.artist, artistName.artist_name)
                done();
            });
    })
});

describe("PATCH /players/:id/playlist with invalid playlist", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/playlist")
            .query(token)
            .send(invalidPlaylist)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe("DELETE /players/:id/playlist wihout token", () => {
    it("should return 403", (done) => {
        chai.request(app)
            .delete("/players/" + playerId + "/playlist")
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("DELETE /players/:id/playlist with invalid player ID", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .delete("/players/" + invalidPlayerId + "/playlist")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});

describe("DELETE /players/:id/playlist", () => {
    it("should return 204 and clear playlist", (done) => {
        chai.request(app)
            .delete("/players/" + playerId + "/playlist")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should return empty playlist", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isUndefined(res.body.song_currently_played.path)
                assert.isUndefined(res.body.song_currently_played.title)
                done();
            });
    })
});


describe("PATCH /players/:id/mixer wihout token", () => {
    it("should return 403", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId + "/mixer")
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("PATCH /players/:id/mixer wihout invalid player ID", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId + "/mixer")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});

describe("PATCH /players/:id/mixer with power off", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(powerOff)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should power off", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.mixer.power, "off");
                done();
            });
    });
});

describe("PATCH /players/:id/mixer with power on", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(powerOn)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should power on", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.mixer.power, "on");
                done();
            });
    });
});

describe.skip("PATCH /players/:id/mixer with invalid power state", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(powerInvalid)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe("PATCH /players/:id/mixer with volume 0", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(volumeZero)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should set volume to 0", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.mixer.volume, 0);
                done();
            });
    });
});

describe("PATCH /players/:id/mixer with volume 100", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(volumeOneHundred)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 204);
                done();
            });
    })
    it("should set volume to 100", (done) => {
        chai.request(app)
            .get("/players/" + playerId)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.mixer.volume, 100);
                done();
            });
    });
});

describe.skip("PATCH /players/:id/mixer with volume 101", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(volumeZero)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});


describe.skip("PATCH /players/:id/mixer with volume -1", () => {
    it("should return 400", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send(volumeZero)
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe.skip("PATCH /players/:id/mixer with bass", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send()
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe.skip("PATCH /players/:id/mixer with treble", () => {
    it("should return 204", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/mixer")
            .send()
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 400);
                done();
            });
    })
});

describe("PATCH /players/:id/favorite wihout token", () => {
    it("should return 403", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId + "/favorite")
            .end((err, res) => {
                assert.equal(res.status, 403);
                done();
            });
    })
});

describe("PATCH /players/:id/favorite wihout invalid player ID", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .patch("/players/" + invalidPlayerId + "/favorite")
            .query(token)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});

describe("PATCH /players/:id/favorite with first fav", () => {
    it("should return 200 and title of favorite", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/favorite")
            .query(token)
            .send(firstFavorite)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.song_currently_played.title, "BBC Radio 6 Music")
                done();
            });
    })
});

describe("PATCH /players/:id/favorite with second fav", () => {
    it("should return 200 and title of favorite", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/favorite")
            .query(token)
            .send(secondFavorite)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.song_currently_played.title, "BBC Radio 4")
                done();
            });
    })
});

describe.skip("PATCH /players/:id/favorite with invalid favorite", () => {
    it("should return 404", (done) => {
        chai.request(app)
            .patch("/players/" + playerId + "/favorite")
            .query(token)
            .send(invalidFavorite)
            .end((err, res) => {
                assert.equal(res.status, 404);
                done();
            });
    })
});