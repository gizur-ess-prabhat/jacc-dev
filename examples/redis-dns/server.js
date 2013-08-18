var dnsd = require('dnsd'),
    PORT = 5353;

function handler(req, res) {

  var question = res.question[0], 
      hostname = question.name, 
      length = hostname.length, 
      ttl = Math.floor(Math.random() * 3600);

  var answer = {};

  if(question.type === 'A') {
    answer = {
      name:hostname, 
      type:'A', 
      data:"1.1.1."+length, 
      'ttl':ttl};

    res.answer.push(answer);
  }

  console.log('%s:%s/%s question:%j answer:%j', req.connection.remoteAddress, req.connection.remotePort, req.connection.type, question, answer);

  res.end();
}

var server = dnsd.createServer(handler);

console.log('Server running at 127.0.0.1:'+PORT);

server.zone('example.com', 'ns1.example.com', 'us@example.com', 'now', '2h', '30m', '2w', '10m')
      .listen(PORT, '127.0.0.1');
