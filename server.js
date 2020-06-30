const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorhandler = require('errorhandler');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(errorhandler());

// ROUTER
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server listening in Port: ${PORT}`);
});

module.exports = app;