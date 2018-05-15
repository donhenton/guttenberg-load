# Gutenberg Data Load To ElasticSearch

https://blog.patricktriest.com/text-search-docker-elasticsearch/


This application will load the text search gutenberg data for the article
above.

Unzip the books.zip file into a folder books (not checked in see .gitignore)
The books folder should be adjacent to the load_data.js file.

```
node load_data.js
```

Tested with Node 8.11 and above, Using [docker-elk ](https://github.com/donhenton/docker-elk)
