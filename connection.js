const elasticsearch = require('elasticsearch')

// Core ES variables for this project
const index = 'library'
const type = 'book'
const card_catalog_index = 'card_catalog'
const card_catalog_type = 'index_card'
const port = 9200
const host = process.env.ES_HOST || 'localhost'
const client = new elasticsearch.Client({host: {host, port}})

/** Check the ES connection status */
async function checkConnection() {
  let isConnected = false
  while (!isConnected) {
    console.log('Connecting to ES')
    try {
      const health = await client.cluster.health({})
      console.log(health)
      isConnected = true
    } catch (err) {
      console.log('Connection Failed, Retrying...', err)
    }
  }
}

/** Clear the index, recreate it, and add mappings */
async function resetIndex() {
  if (await client.indices.exists({index})) {
    await client.indices.delete({index})
  }
  if (await client.indices.exists({index: card_catalog_index})) {
    await client.indices.delete({index: card_catalog_index})
  }

  await client.indices.create({index})
  await client.indices.create({index: card_catalog_index})
  await putBookMapping()
  await putCatalogMapping()
}
//https://www.elastic.co/guide/en/elasticsearch/reference/6.2/multi-fields.html
/** Add book section schema mapping to ES */
async function putBookMapping() {
  const schema = {
    title: {type: 'keyword'},
    //see sample below
    "author": {
      "type": "text",
      "fields": {
        "author_key": {
          "type": "keyword"
        }
      },
    },
    location: {type: 'integer'},
    text: {type: 'text'}
  }

  return client.indices.putMapping({index, type, body: {properties: schema}})
}

async function putCatalogMapping() {
  const schema = {
    title: {
      type: 'keyword',
      "fields": {
        "text": {
          "type": "text"
        },
        "suggest": {
          "type": "completion"
        }
      }

    },
    "author": {
      "type": "text",
      "fields": {
        "keyword": {
          "type": "keyword"
        },
        "suggest": {
          "type": "completion"
        }
      }
    }
  }

  return client.indices.putMapping({index: card_catalog_index, type: card_catalog_type, body: {properties: schema}})
}


module.exports = {
  client, index, type, checkConnection, resetIndex, card_catalog_index, card_catalog_type
}


//this demonstrates the use of the fields with multiple definitionss

/*
 curl -XGET "http://elasticsearch:9200/library/book/_search" -H 'Content-Type: application/json' -d'
 {
 "query": {
 "match_phrase": {
 "author.author_key": "Charles Dickens"
 }
 }
 }'
 */

/*
 curl -XGET "http://elasticsearch:9200/library/book/_search" -H 'Content-Type: application/json' -d'
 {
 "query": {
 "match_phrase": {
 "author": "Dickens"
 }
 }
 }'
 
 */