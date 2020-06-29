const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Parameter
artistsRouter.param('artistId', (req, res, next, artistId) => {
    const sql = 'SELECT * FROM Artist WHERE id = $artistId';
    const values = {$artistId: artistId};
    db.get(sql, values, (err, artist) => {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

// GET all artists
artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
        } else {
           res.status(200).json({artists: artists});
        }
    });
});

// GET single artist by id
artistsRouter.get('/:artistId', (req, res, next) => {
    const sql = `SELECT * FROM Artist WHERE id = ${req.artist}`;
    db.get(sql, (err, artist) => {
        res.status(200).json({artist: req.artist});
    });
});

// POST to create a new artist
artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dateOfBirth || !biography) {
        res.sendStatus(400);
    }

    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) ' +
        'VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, artist) => {
                res.status(201).json({artist: artist});
            });
        }
    });
});

// PUT to update an artist by id
artistsRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dateOfBirth || !biography) {
        res.sendStatus(400);
    }

    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, ' + 
        'is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId
    };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    });
});

// DELETE by marking the artist as unemployed
artistsRouter.delete('/:artistId', (req, res, next) => {
    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId';
    const values = {$artistId: req.params.artistId};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE ${req.params.artistId}`, (err, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    });
});

module.exports = artistsRouter;