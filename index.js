const express = require('express')
const formidable = require('express-formidable')
const fs = require('fs')
const nodemailer = require ('nodemailer')

let app = express()
let transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
})

app.use(formidable())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.get('/', function(req, res){
  res.send('Hi there.')
})

app.post('/', function(req, res){
  writeToFile(req.fields).then(() => {
      console.log('Entry added.')
      res.send('thanks')
      sendToMail(req.fields)
    }
  ).catch(err => console.warn(err))
})


function writeToFile(body) {
  return new Promise((resolve, reject) => {
    let line = `"${body.firstname}", "${body.lastname}", "${body.email}", "${body.age}", "${body.story}"\n`

    fs.lstat('concours.csv', (err) => {
      if (err) {
        fs.appendFile('concours.csv', 'prenom, nom, email, age, histoire\n', (err) => {
          fs.appendFile('concours.csv', line, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      } else {
        fs.appendFile('concours.csv', line, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
  })
}

function sendToMail(body) {
  let content = `Prenom : ${body.firstname}\nNom : ${body.lastname}\nEmail : ${body.email}\nAge : ${body.age}\r\n\r\nHistoire :\n${body.story}`

  let data = {
    from: `${body.firstname} ${body.lastname} <${body.email}>`,
    to: 'concours@defenseurdesdroits.fr',
    subject: '[Concours] Petite histoire des grands droits',
    text: content
  }

  // let contentParticipant = "Ta participation a bien été enregistrée :\n\n" + content
  // let dataParticipant = {
  //   from: `${body.firstname} ${body.lastname} <${body.email}>`,
  //   to: 'concours@defenseurdesdroits.fr',
  //   subject: '[Concours] Petite histoire des grands droits',
  //   text: contentParticipant
  // }
  // transporter.sendMail(dataParticipant, (err, info) => {
  //   if (err) {
  //     console.warn(err)
  //   }
  // })

  transporter.sendMail(data, (err, info) => {
    if (err) {
      console.warn(err)
    } else {
      console.log('Mail sent.')
    }
  })
}

app.listen(process.env.PORT || 3000)