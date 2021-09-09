/*------setup------*/

const PORT= 3000
const express=require("express")
const server=express()

//dotenv is what we are using to store our secret encryption key
require("dotenv").config()

//we have to connect to our client to use the database so we import the client from the index.js in db
const {client} = require("./db")
client.connect()

/*------usefulpackages------*/
//bodyparser reads incoming JSON from requests so we can see what is being requested
const bodyParser=require('body-parser')
server.use(express.json())

//morgan logs out incoming requests in terminal
const morgan=require("morgan")
server.use(morgan("dev"))

/*------bodylogging------*/
const apiRouter=require("./api")
const { connect } = require("./api")
server.use("/api",apiRouter) 



//start up the server
server.listen(PORT,()=>{
    console.log("the server is up on port",PORT)
})
