const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const path = require('path')
const MongoClient = require('mongodb').MongoClient

const graphqlServerExpress = require('graphql-server-express')
const graphql = require('graphql')

const Data = require('coinspec-data-tools').Data
const data = new Data(path.join(process.cwd(), '../data'))

const mongoUrl = 'mongodb://localhost:27017'

const PORT = 3020


MongoClient.connect(mongoUrl, (err, client) => {
  const db = client.db('coinspec')
  const graphQLschema = require('./lib/genschema')(data.collections, db)

  var app = express()
  app.use(cors())

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  app.use('/graphql', graphqlServerExpress.graphqlExpress({ schema: graphQLschema }))
  app.use('/graphiql', graphqlServerExpress.graphiqlExpress({
    endpointURL: '/graphql'
  }))

  const server = http.createServer(app)
  server.listen(PORT, () => {
    console.log('Server started')
  })
})

