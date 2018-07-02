const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const nodemailer = require ('nodemailer')

const cors = require('cors')

let app = express()
let transporter = nodemailer.createTransport({sendmail: true})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.options('*', cors())

app.get('/', function(res){
  res.send('Hi there.')
  res.end('thanks')
})

app.post('/', function(req, res){
  if (writeToFile(req.body) && sendToMail(req.body)) {
    if (writeToFile(req.body)) {
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end('thanks')
    }
  }
})


function writeToFile(body) {
  let line = `"${body.firstname}", "${body.lastname}", "${body.email}", "${body.story}"\n`
  fs.lstat('concours.csv', (err) => {
    if (err) {
      fs.appendFile('concours.csv', 'prenom, nom, email, histoire\n', (err) => {
        fs.appendFile('concours.csv', line, (err) => {
          return err ? false : true
        })
      })
    } else {
      fs.appendFile('concours.csv', line, (err) => {
        return err ? false : true
      })
    }
  })
}

function sendToMail(body) {
  let content = `Prenom : ${body.firstname}\nNom : ${body.lastname}\nEmail : ${body.email}\n\nHistoire :\n${body.story}`

  transporter.sendMail({
    from: `${body.firstname} ${body.lastname} <${body.email}>`,
    to: 'yorick@ctrlaltdev.xyz',
    subject: '[Concours] Petite histoire des grands droits',
    text: content
  }, (err, info) => {
    return err ? false : true
  })
}

app.listen(3000)