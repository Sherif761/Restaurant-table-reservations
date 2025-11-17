const { MongoClient } = require("mongodb")

let dbconnection
module.exports = {
    connectiondb: (cb)=>{
        MongoClient.connect("mongodb://localhost:27017/first_project")
    .then((client)=>{
        dbconnection = client.db()
        // console.log("done")
        return cb()
    })
    .catch((err)=>{
        console.log("connection failed")
        return cb(err)
    })},
    getdb: ()=> dbconnection
}

// const loginSchema = new mongoose.schema({
//     name: {
//         type:string,
//         required: true
//     },
//     password: {
//         type:string,
//         required: true
//     }
// })

// const collection = new mongoose.schema("login" , loginSchema)

// module.exports = collection