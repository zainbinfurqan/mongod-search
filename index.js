const bodyParser = require('body-parser');
const express = require('express')
const { MongoClient } = require('mongodb');
const { performance } = require('perf_hooks');

const start = performance.now();

const app = express()
const port = 3000

const url = '';
// const url = 'mongodb+srv://user01:user01@cluster0.radnh.mongodb.net/'
const client = new MongoClient(url);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoDBConnection = async () => {
  try {
    console.log('Connecting mongo server');
    await client.connect();
    console.log('Connected successfully to server');
  } catch (error) {
    console.log(error)
  }
}

mongoDBConnection()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/contact/search', async (req, res) => {
  try {
    const leads_data_v1222 =  client.db('leadsy_agora').collection("leads_data_v1222");
    const match = { $and: [] };

    let count;
    let searchResults;

    Object.keys(req.body.filterFields).map((item,index)=>{
      match.$and.push({[`${item}`]:{$in:[...req.body.filterFields[item]]}})
    })

    req.body.skip =0 && (count = await leads_data_v1222.estimatedDocumentCount({ ...match }));

    searchResults = await leads_data_v1222.aggregate([
      { $match: { ...match } },
      // {
      //   $facet: {
      //     data: [
      //       { $skip: req.body.skip },
      //       { $limit: req.body.limit }
      //     ],
      //     count: [
      //       { $group: { _id: null, matchCount: { $sum: 1 } } }
      //     ]
      //   }
      // },
      // {
      //   $project: {
      //     matchCount: { $arrayElemAt: ["$count.matchCount", 0] }
      //   }
      // }
    ])
    // .skip(req.body.skip).limit(req.body.limit)
    .toArray();
    console.log(searchResults)
    const response = {
      result : [...searchResults],
      count
    }

    res.send(response).json()
  } catch (error) {
   console.log(error) 
  }

})


app.post('/search/filter/new', async (req, res) => {
  try {
    const match = { $and: [] };
    // const count =  [
    //   { $group: { _id: null, count: { $sum: 1 } } },
    //   { $project: { _id: 0, count: 1 } }
    // ];
    // const pagination = [
    //   { $skip: 0 },
    //   { $limit: 10 }
    // ];

    Object.keys(req.body.filterFields).map((item,index)=>{
      match.$and.push({[`${item}`]:{$in:[...req.body.filterFields[item]]}})
    })

    // client.db('test').collection("courses").updateMany({}, {$set: {"title": ""}})

    // console.log("match",match)
    // const searchResults = await courses.find({}).skip(0).limit(10).toArray();
    //
    const count =  await courses.estimatedDocumentCount({ ...match });
    const searchResults = await courses.aggregate([
      { $match: { ...match } },
    ]).skip(req.body.skip).limit(req.body.limit).toArray();
    const response = {
      result : [...searchResults],
      count
    }
    // {
      //   $facet: {
      //     count: [...count],
      //     paginatedResults: [...pagination]
      //   }
      // },
      // {
      //   $project: {
      //     count: { $arrayElemAt: ["$count.count", 0] },
      //     result: "$paginatedResults"
      //   }
      // }
    // ]).skip(req.body.skip).limit(req.body.limit).toArray();

// console.log("searchResults",searchResults)
    
    // searchResults.explain().then(explainResult => {
    //   console.log('Explain result:', explainResult);
    
    //   // Retrieve execution time statistics
    //   const executionTimeMillis = explainResult.executionStats
    //     ? explainResult.executionStats.executionTimeMillis
    //     : undefined;
    //   console.log('Execution time: ' + executionTimeMillis + ' milliseconds');
    
    //   // Fetch the query results using toArray()
    //   searchResults.toArray()
    //     .then(results => {
    //       console.log('Query results:', results);
    //     })
    //     .catch(error => {
    //       console.error('Error fetching query results:', error);
    //     });
    // }).catch(error => {
    //   console.error('Error:', error);
    // });
    // .then(results => {
    //   const end = performance.now();
    //   const executionTime = end - start;
    //   console.log('Execution time: ' + executionTime + ' milliseconds');
    //   console.log('Results:', results);
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });

    // client.db('test').currentOp()
    // res.send(searchResults).json()
    res.send(response).json()

  } catch (error) {
    console.log(error)
  }
})

app.post('/search/filter', async (req, res) => {
  try {
    const match = { $and: [] };
    const count =  [
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0, count: 1 } }
    ];
    const pagination = [
      { $skip: req.body.skip },
      { $limit: req.body.limit }
    ];

    Object.keys(req.body.filterFields).map((item,index)=>{
      match.$and.push({[`${item}`]:{$in:[...req.body.filterFields[item]]}})
    })

    // client.db('test').collection("courses").updateMany({}, {$set: {"title": ""}})

    const courses = client.db('test').collection("courses");
    //
    const searchResults =  courses.aggregate([
      { $match: { ...match } },
      {
        $facet: {
          count: [...count],
          paginatedResults: [...pagination]
        }
      },
      {
        $project: {
          count: { $arrayElemAt: ["$count.count", 0] },
          result: "$paginatedResults"
        }
      }
    ])
    
    searchResults.explain().then(explainResult => {
      console.log('Explain result:', explainResult);
    
      // Retrieve execution time statistics
      const executionTimeMillis = explainResult.executionStats
        ? explainResult.executionStats.executionTimeMillis
        : undefined;
      console.log('Execution time: ' + executionTimeMillis + ' milliseconds');
    
      // Fetch the query results using toArray()
      searchResults.toArray()
        .then(results => {
          console.log('Query results:', results);
        })
        .catch(error => {
          console.error('Error fetching query results:', error);
        });
    }).catch(error => {
      console.error('Error:', error);
    });
    // .then(results => {
    //   const end = performance.now();
    //   const executionTime = end - start;
    //   console.log('Execution time: ' + executionTime + ' milliseconds');
    //   console.log('Results:', results);
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });

    // client.db('test').currentOp()
    // res.send(searchResults).json()
    res.send({}).json()

  } catch (error) {
    console.log(error)
  }
})

app.get('/search/autosuggestkeywords', async (req, res) => {
  try {
    const courses = client.db('test').collection("courses");
    const suggest = await courses.aggregate([
      {
        $search: {
          index: "luxis",
          autocomplete: {
            query: req.query.keyword,
            path: 'keywords'
          },
          highlight : {
            path : [
              'keywords'
              ]
          }
        }
      },
      {
        $project: {
          highlight: {
            $meta: 'searchHighlights'
          }
        }
      },
      {
        $unwind: "$highlight"
      },
      {
        $unwind: "$highlight.texts"
      },
      {
        $group: {
          _id: null,
          strings: { $addToSet: "$highlight.texts.value" }
        }
      },
      {
        $project: {
          _id: 0,
          strings: { $setUnion: "$strings" }
        }
      }
      
    ]).toArray();
    console.log("suggest",suggest)
    res.send(suggest).json()
  } catch (error) {
    console.log(error)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})