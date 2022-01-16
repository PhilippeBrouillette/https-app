'use strict';
const tls = require('tls');
const fs = require('fs');
require('dotenv').config({ path: './var.env' })
const port = process.env.PORT;

const options = {
  key: fs.readFileSync('server/ssl/key.pem'),
  passphrase: process.env.KEY_PASSWORD,
  cert: fs.readFileSync('server/ssl/signed_certificate.pem'),
  ca: fs.readFileSync('certificat/autorite.pem'),
  requestCert: true, // ask for a client cert
  ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384',
};

const server = tls.createServer(options, (socket) => {
  socket.write('Salut client confidentiel je ne veux pas que les gens voient ce que je t' !\n');
  socket.setEncoding('utf8');
  socket.pipe(socket);
})
  .on('connection', () => {
  })

  .on('secureConnection', (socket) => {
    // c.authorized will be true if the client cert presented validates with our CA
    console.log('connexion securitaire; client reconnu: ', socket.authorized);
  })

  .listen(port, () => {
    console.log('server listening on port ' + port + '\n');
  });