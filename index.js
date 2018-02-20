const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')

const graphqlServerExpress = require('graphql-server-express')
const graphql = require('graphql')

const PORT = 3020

const schema = require('./schema')

var app = express()
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/graphql', graphqlServerExpress.graphqlExpress({ schema }))
app.use('/graphiql', graphqlServerExpress.graphiqlExpress({
  endpointURL: '/graphql'
}))

const server = http.createServer(app)
server.listen(PORT, () => {
  console.log('Server started')
})
