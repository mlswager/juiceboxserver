const express = require("express")
const tagsRouter = express.Router()
const {getAllTags} = require("../db")

tagsRouter.get("/",async(req,res,next)=>{
    //forgot the await the first time again
    const tags = await getAllTags()
    console.log(tags)
    res.send({tags})
})

module.exports = tagsRouter