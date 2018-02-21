const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const path = require('path')

const graphqlServerExpress = require('graphql-server-express')
const graphql = require('graphql')

const Data = require('coinspec-data-tools').Data
const data = new Data(path.join(process.cwd(), '../data'))
data.load()

const PORT = 3020

//const graphQLschema = require('./schema')
const graphQLschema = require('./lib/genschema')(data.collections, data)

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
