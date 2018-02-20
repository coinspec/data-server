const graphqlTools = require('graphql-tools')
const Data = require('./node_modules/coinspec-data-tools/data.lib.js').Data
const path = require('path')

const data = new Data(path.join(process.cwd(), '../data'))
data.load()

const typeDefs = [`
  type Tag {
    id: Int
  }
  type Asset {
    id: String
    name: String
    symbol: String
  }

  type Query {
    assets: [Asset]
    asset(id: String!): Asset
  }
`]
const resolvers = {
  Query: {
    asset: (root, { id }, context) => {
      return data.find('assets', id).dump()
    },
    assets: () => {
      return data.dump([ 'assets' ])['assets']
    }
  }
}

module.exports = graphqlTools.makeExecutableSchema({
  typeDefs,
  resolvers
})
