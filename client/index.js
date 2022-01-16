'use strict';
const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { listeners } = require('process');
require('dotenv').config({path:'.env'});
const port = process.env.PORT;
const zonename = process.env.ZONE
const { Resolver } = require('dns').promises;
const resolver = new Resolver();
resolver.setServers(['127.0.0.1:9000']);


(async function() {
  const ipAdresses = await resolver.resolve4(zonename);
  console.log("voici les ipv4 trouves :" , ipAdresses);
  const hostname = ipAdresses[0]
var readline = require("readline"),
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
	const options = {
  host:  hostname === "127.0.0.1" ? 'localhost' : hostname,
  port: port,
  key: fs.readFileSync('client/ssl/key_client.pem'),
  passphrase:process.env.KEY_PASSWORD,
  cert: fs.readFileSync('client/ssl/signed_certificate_client.pem'),
  ca: fs.readFileSync('certificat/autorite.pem'),
  ciphers: 'HIGH',
};

const socket = tls.connect(options, () => {	
  console.log('client connected', socket.authorized ? 'authorized' : 'unauthorized');
  if (!socket.authorized) {
    console.log("Error: ", socket.authorizationError());
    socket.end();
  }
})
  .setEncoding('utf8')
  .on('data', (data) => {
    //console.log("Received: ", data);

    // Close after receive data
  })
  .on('close', () => {
    console.log("Connection closed");
  })
  .on('end', () => {
    console.log("End connection");
  })
  .on('error', (error) => {
    console.error(error);
    socket.destroy();
  });

  socket.on('secureConnect', () => {
    if(socket.authorized){

      var data = {};

      rl.question("Enter your username : \n", function(username){
        rl.input.on("keypress", function (c, k) {
          // get the number of characters entered so far:
          var len = rl.line.length;
          // move cursor back to the beginning of the input:
          readline.moveCursor(rl.output, -len, 0);
          // clear everything to the right of the cursor:
          readline.clearLine(rl.output, 1);
          // replace the original input with asterisks:
          for (var i = 0; i < len; i++) {
            rl.output.write("*");
          }
        });
        rl.question("Enter your password : \n", function (password){
          data ={
            username: username,
            password: password
          };
          socket.write(JSON.stringify(data));
          rl.close();
          console.log('\n');
          socket.end();
          rl.history = rl.history.slice(2);
        });
        
      });
    }
  });
})();
