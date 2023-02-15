const express = require('express');
const parser = require('./parser');
const urlParser = require('./urlParser');

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
    console.log('SERVER IS STARTING!');
});



app.get('/api', (req, res) => {
    const surname = urlParser(decodeURI(req.url)).surname;

    console.log(urlParser(decodeURI(req.url)).surname);

    parser(surname, '%').then( result => {
        res.json({
            message: result
        });
    });
});