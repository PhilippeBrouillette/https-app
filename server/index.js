'use strict';
const tls = require('tls');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path:'.env'});
const port = process.env.PORT;
const { Server } = require('http');


const options = {
  key: fs.readFileSync('server/ssl/key.pem'),
  passphrase:process.env.KEY_PASSWORD,
  cert: fs.readFileSync('server/ssl/signed_certificate.pem'),
  ca: fs.readFileSync('certificat/autorite.pem'),
  requestCert: true, // ask for a client cert
  ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384',
  isServer: true,
};

const server = tls.createServer(options, (socket) => {

    socket.write('Salut client confidentiel je ne veux pas que les gens voient ce que je dit!\n');
    socket.setEncoding('utf8');

    socket.on('end', function(){

      console.log('EOT (End of Transmission)');

    });

});

server.on('connection', (socket) => {
  console.log('connexion effectuée');
})

server.on('secureConnection', (socket) => {
  // c.authorized will be true if the client cert presented validates with our CA
  console.log('connexion securitaire; client reconnu: ', socket.authorized);

  socket.on('data', (data) =>{

    console.log(data);


  });

})

server.listen(port, () => {
  console.log('server listening on port ' + port + '\n');
});

server.on('error', function(error){

  console.error(error);

})