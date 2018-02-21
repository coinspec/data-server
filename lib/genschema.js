const _ = require('lodash')
const deref = require('deref')()

const {
    GraphQLBoolean,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLID,
    GraphQLNonNull,
    GraphQLList
} = require('graphql')

function convertSchema (name, schema, parentName=null) {
  let nname = _.upperFirst(name)
  if (parentName) {
    nname = parentName + nname
  }

  if (schema.type === 'object') {
    let fields = {}
    if (!schema.properties) {
      return GraphQLString
    }
    Object.keys(schema.properties).forEach((pn) => {
      fields[pn] = { type: convertSchema(pn, schema.properties[pn], nname) }
    })

    return new GraphQLObjectType({
      name: nname,
      fields
    })
  }
  if (schema.type === 'string') {
    return GraphQLString
  }
  if (schema.type === 'array') {
    return new GraphQLList(convertSchema(nname, schema.items))
  }
  if (schema.type === 'boolean') {
    return GraphQLBoolean
  }
  return GraphQLString
}

function rootFields (collections, data) {
  let arr = {}
  Object.keys(collections).forEach((ckey) => {

    let col = collections[ckey]
    let schemaDeref = deref(col.schemaObj, true)
    console.log(schemaDeref)
    let converted = convertSchema(col.schema, schemaDeref)
    arr[col.schema] = {
      type: converted,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, args, context) => {
        return data.find(ckey, args.id).dump()
      }
    }
    arr[ckey] = {
      type: new GraphQLList(converted),
      resolve: (root, args, context) => {
        console.log(root, args, context)

        return [{
          name: 'xxx'
        }]
      }
    }
  })
  return arr
}

function generateGraphQLSchema (collections, data) {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: () => rootFields(collections, data)
    })
  })
}
module.exports = generateGraphQLSchema
