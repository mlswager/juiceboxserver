const express = require("express")
const postsRouter = express.Router()
//the .. in ..db is because we have to go up a layer to get to the main branch that has access to db
const {getAllPosts} = require("../db")


//does the order of req,res,next matter?
postsRouter.use((req,res,next)=>{
    console.log("a request is being made to /posts")
    //res.send({message: "hello from /posts"})
    next()
})

postsRouter.get("/", async(req,res,next)=>{
    //forgot the await the first time
    const posts = await getAllPosts()
    res.send({posts})
})

module.exports = postsRouter