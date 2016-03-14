var pg = require('pg');
var connString = 'postgres:localhost:5432/libraryAdmin';

var query = new pg.Client(connString);

module.exports = query;
