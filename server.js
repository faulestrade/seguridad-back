const express = require("express");
const { Pool, Client } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen("3001", () => {
  console.log("Started on PORT 3001");
});

const crypto = require("crypto");
const bcrypt = require("bcrypt");

const poolUser = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Fausti060499",
  port: "5432"
});

const poolPepper = new Pool({
  user: "postgres",
  host: "localhost",
  database: "SeguridadConfig",
  password: "Fausti060499",
  port: "5432"
});

let pepper =''

poolPepper.query("SELECT * from userpepper", (err, res) => {
  pepper =res.rows[0].pepper
  poolPepper.end()
});

app.post("/register", (req, res) => {
  // Insert Register Code Here
  let userMail = req.body.userMail;
  let password = req.body.password;
  let confirmationPassword = req.body.confirmationPassword;
  const salt = bcrypt.genSaltSync();
  let isValidMail = /[^'?="!]/g.test(userMail)
  let isValidPass = /[^'?="!]/g.test(password)
  let isValidCPass = /[^'?="!]/g.test(confirmationPassword)
  if (password === confirmationPassword) {
    if (isValidPass && isValidCPass && isValidMail){
    const passwordHashed = bcrypt.hashSync(pepper + password, salt);
    poolUser.query(
      `INSERT INTO userinfo(id, mail, password, salt) VALUES ('${crypto.randomUUID()}', '${userMail}', '${passwordHashed}', '${salt}')`,
      (err, resp) => {
        if(resp){res.status(200).send('Register correcto')}
        else if (err){ res.status(400).send('Ya existe un usuario con este mail') }
      }
    );
    } else{res.status(400).send('Mail o contraseña no valido')}
  } else{res.status(400).send('Las contraseñas no son iguales')}
});
  

  app.post("/login", (req, res) => {
    // Insert Login Code Here
    let userMail = req.body.userMail;
    let password = req.body.password;
    let isValidMail = /[^'?="!]/g.test(userMail)
    let isValidPass = /[^'?="!]/g.test(password)
    if (isValidPass && isValidMail) {
      poolUser.query(`SELECT * from userinfo WHERE mail= '${userMail}'`, (err, resp) => {
        if (resp?.rows[0]){
          const passwordHashed = bcrypt.hashSync(pepper + password, resp.rows[0].salt);
          const passwordDB = resp.rows[0].password
          if (passwordDB === passwordHashed){
             res.status(200).send('Log in correcto')
          }else{
            res.status(400).send('Contraseña incorrecta')
          }
        }else{
          res.status(404).send('No hay usuario con este mail')
        }
      });
    }else{
      res.status(400).send( 'Mail o contraseña no valido')
    }
});
