'use strict';
const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { message } = require('prompt');
require('dotenv').config({path:'.env'});
const port = process.env.PORT;
const bcrypt = require('bcrypt');
const { error } = require('console');
const saltRounds = 10;


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

    RecieveDataFromClient(data, socket);

    socket.on("error", function(exception){

      console.error("Error with the connexion.");
      socket.destroy();
  
    })

  });
})


server.listen(port, () => {
  console.log('server listening on port ' + port + '\n');
});

server.on('error', function(error){

  console.error(error);

})

function SendDataToClient(event, message, socket){

  const JSONMessage = {"type": event, "data": message}
  socket.write(JSON.stringify(JSONMessage));

}

function RecieveDataFromClient(data, socket){
    
  if(isJson(data)){

    const client_message = JSON.parse(data);
    var no_username = true;
    if(isJson(client_message.data)){
      
      const payload = JSON.parse(client_message.data);

      switch (client_message.type) {
        case "MESSAGE":
          console.log(payload.message);
          break;

        case "LOGIN":

          fs.readFile('./user.json', 'utf8', function(err, db)
          {

            if(err){
              console.error('Error reading user.json.')
            }
            else{
              var users = [];
              if(isJson(db))
              {
                users = JSON.parse(db);
                
                users.forEach(function(user) {

                  console.log(user);
                  if(payload.username == user.username){
                    
                    const hash = user.password;
                    bcrypt.compare(payload.password, hash, function(err, result){
                      
                      if(result){
                        const success = {message: "You have been succesfully logged in.\n"};
                        SendDataToClient("SUCCESS", success, socket);
                        console.log(success);
                      }
                      else
                      {
                        const error = {message: "You have entered the wrong password.\n"};
                        SendDataToClient("ERROR", error, socket);
                        console.log(error);
                      }

                    });
                    no_username = false;
                  }
                });
              }

              if(no_username){
                //If username doesn't exist in db, write new field
                bcrypt.hash(payload.password, saltRounds, function(err, hash){

                  users.push({
                    username: payload.username,
                    password: hash
                  });

                  fs.writeFileSync('./user.json', JSON.stringify(users), 'utf8');
				  const creation = {message: "You have been registered succesfully.\n"};
                        SendDataToClient("SignUp", creation, socket);
                        console.log(creation);
                });
              }

            }
          });
          break;

        default:
          console.error("Type not supported : " + client_message);
          
      }
    }
  }

}

function isJson(item) {
  item = typeof item !== "string"
      ? JSON.stringify(item)
      : item;

  try {
      item = JSON.parse(item);
  } catch (e) {
      return false;
  }

  if (typeof item === "object" && item !== null) {
      return true;
  }

  return false;
}

// const message = {
//   message: "Hello World.\n"
// };
// SendDataToClient("MESSAGE", message, socket);