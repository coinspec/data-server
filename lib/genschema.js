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
  if (schema.type === 'number') {
    return GraphQLFloat
  }
  return GraphQLString
}

function normalizeItem (item) {
  if (!item) {
    return null
  }
  let out = item.data
  if (!out) {
    out = { id: item.id }
  }
  out.rt_data = item.rt_data

  if (item.rt_data_raw) {
    Object.keys(item.rt_data_raw).forEach((k) => {
      let alias = k+'s'
      out.rt_data[alias] = []
      Object.keys(item.rt_data_raw[k]).forEach(ik => {
        out.rt_data[alias].push(item.rt_data_raw[k][ik])
      })
    })
  }

  return out
}

function rootFields (collections, db) {
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
        return db.collection(ckey).findOne({ id: args.id, published: true })
        .then(item => normalizeItem(item))
        //return addRTData(data.find(ckey, args.id))
      }
    }
    arr[ckey] = {
      type: new GraphQLList(converted),
      resolve: (root, args, context) => {
        return db.collection(ckey).find({ published: true }).toArray()
        .then(items => items.map(i => normalizeItem(i)))
      }
    }
  })
  return arr
}

function generateGraphQLSchema (collections, db) {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: () => rootFields(collections, db)
    })
  })
}
module.exports = generateGraphQLSchema
