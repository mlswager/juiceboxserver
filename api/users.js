const express = require("express")
const usersRouter = express.Router()
//importing getAllUsers from the db index.js file
//getAllUsers is in {} because it is a named export
const {getAllUsers}=require('../db')

usersRouter.use((req,res,next)=>{
    console.log("a request is  being made to /users")
    //res.send({message: "hello from /users"})
    next()
})

//this will happen when a GET request it receieved to /users (it is / below because /users is specifiec in index.js (api))
usersRouter.get("/",async (req,res,next)=>{
    //using getAllUsers to grab all the users and put them in a variable caller users
    const users = await getAllUsers()
    
    //sending
    res.send({
        users
    })
})

module.exports = usersRouter