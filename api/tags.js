const express = require("express")
const tagsRouter = express.Router()
const {getAllTags,getPostsByTagName} = require("../db")

tagsRouter.get("/",async(req,res,next)=>{
    //forgot the await the first time again
    const tags = await getAllTags()
    console.log(tags)
    res.send({tags})
})

tagsRouter.get("/:tagName/posts",async (req,res,next)=>{
    const{tagName} = req.params//destructure postId from the request parameters
    
    try{
        console.log("tagName: ", tagName)
        const gottenPosts = await getPostsByTagName(tagName)
        console.log("gottenPosts: ",gottenPosts)
        res.send({posts: gottenPosts})
        return gottenPosts

    }
    catch({name,message}){
        console.log("there was an error getting the post")
        next({name,message})
    }
})

module.exports = tagsRouter