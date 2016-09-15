'use strict'

const app = require('./app')()
const port = process.env.PORT || 3030
const sport = (process.env.NODE_ENV === 'production') ? 443 : 3031

const server = require('letsencrypt-express').create({
  server: 'staging',
  email: 'pietgeursen@gmail.com',
  agreeTos: true,
  approveDomains: [ 'devacademygrads.co.nz' ],
  app: app
}).listen(port, sport)

server.on('listening', () => console.log(`Feathers application started on ${app.get('host')}:${port}`))
