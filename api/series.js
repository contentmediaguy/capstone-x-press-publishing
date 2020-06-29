const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Issues Router
const issuesRouter = require('./issues');

// Parameter
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE id = $seriesId';
    const values = {$seriesId: seriesId};
    db.get(sql, values, (err, series) => {
        if (err) {
            next(err);
        } else if (series) {
            req.series = series;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

// Needs to be after parameter to be able to use parameter
seriesRouter.use('/:seriesId/issues', issuesRouter);

// GET all series
seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, series) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: series});
        }
    });
});

// GET a single Series by Id
seriesRouter.get('/:seriesId', (req, res, next) => {
    const sql = `SELECT * FROM Series WHERE id = ${req.series}`;
    db.get(sql, (err, series) => {
        res.status(200).json({series: req.series});
    });
});

// POST to create a new series
seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    }

    const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
    const values = {
        $name: name,
        $description: description
    };
    db.run(sql, values, function(err) {
        if (err) {
            next (err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, series) => {
                res.status(201).json({series: series});
            });
        }
    });
});

// PUT to update a series
seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.sendStatus(400);
    }

    const sql = 'UPDATE Series SET name = $name, description = $description WHERE id = $seriesId';
    const values = {
        $name: name,
        $description: description,
        $seriesId: req.params.seriesId
    };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, series) => {
                res.status(200).json({series: series});
            });
        }
    });
});

// DELETE series by id
seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = 'SELECT * FROM Issue WHERE series_id = $seriesId';
    const issueValues = {$seriesId: req.params.seriesId};
    db.get(issueSql, issueValues, (err, issue) => {
        if (err) {
            next(err);
        } else if (issue) {
            res.sendStatus(400);
        } else {
            const deleteSql = 'DELETE FROM Series WHERE id = $seriesId';
            const deleteValues = {$seriesId: req.params.seriesId};
            db.run(deleteSql, deleteValues, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = seriesRouter;