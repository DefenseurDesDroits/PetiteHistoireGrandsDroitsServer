const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const nodemailer = require ('nodemailer')

let app = express()
let transporter = nodemailer.createTransport({sendmail: true})
// let transporter = nodemailer.createTransport({streamTransport: true})

app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.get('/', function(req, res){
  res.send('Hi there.')
})

app.post('/', function(req, res){
  writeToFile(req.body).catch(err => console.warn(err)).then(() => {
      console.log('Entry added.')
      sendToMail(req.body).catch(err => console.warn(err)).then(() => {
        console.log('Mail sent.')
        res.send('thanks')
      })
    }
  )
})


function writeToFile(body) {
  return new Promise((resolve, reject) => {
    let line = `"${body.firstname}", "${body.lastname}", "${body.email}", "${body.story}"\n`
    fs.lstat('concours.csv', (err) => {
      if (err) {
        fs.appendFile('concours.csv', 'prenom, nom, email, histoire\n', (err) => {
          fs.appendFile('concours.csv', line, (err) => {
            if (err) {
              throw(err)
              reject(err)
            } else {
              resolve()
            }
          })
        })
      } else {
        fs.appendFile('concours.csv', line, (err) => {
          if (err) {
            throw(err)
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
  return new Promise((resolve, reject) => {
    let content = `Prenom : ${body.firstname}\nNom : ${body.lastname}\nEmail : ${body.email}\n\nHistoire :\n${body.story}`

    transporter.sendMail({
      from: `${body.firstname} ${body.lastname} <${body.email}>`,
      to: 'yorick@ctrlaltdev.xyz',
      subject: '[Concours] Petite histoire des grands droits',
      text: content
    }, (err, info) => {
      if (err) {
        throw(err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

app.listen(process.env.PORT || 3000)