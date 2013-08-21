var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : '172.17.0.84',
  user     : 'admin',
  password : 'mysql-server',
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

connection.end();
