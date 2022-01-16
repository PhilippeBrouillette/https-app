'use strict';
const hostname = 'localhost';
const tls = require('tls');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path:'.env'});
const port = process.env.PORT;

const options = {
  host: hostname,
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
    console.log("Received: ", data);

    // Close after receive data
    socket.end();
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