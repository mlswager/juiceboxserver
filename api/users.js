const express = require("express")
const usersRouter = express.Router()
//import jsonwebtoken
const jwt = require('jsonwebtoken')
//import secret key
const { JWT_SECRET } = process.env;
//importing getAllUsers from the db index.js file
//getAllUsers is in {} because it is a named export
const {getAllUsers, createUser, getUserByUsername}=require('../db')


usersRouter.use((req,res,next)=>{
    console.log("a request is  being made to /users")
    //res.send({message: "hello from /users"})
    
    
    next()
})

//this will happen when a GET request is receieved to /users (it is / below because /users is specifiec in index.js (api))
usersRouter.get("/",async (req,res,next)=>{
    //using getAllUsers to grab all the users and put them in a variable caller users
    const users = await getAllUsers()
    if (!req.user){
        //error code here
    }
    let user = req.user
    //sending
    res.send({
        users
    })
})

//this will happen when a POST request is receieved to /login. it will check the incoming username to see if it has username and password entered, and then check it against the usernames and passwords in the database
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body; //pulling username and password from the request
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
      console.log("user.password: ",user && user.password)
      console.log("password: ",password)
  
    // --?why is this written this way?--
      if (user && user.password == password) {
        // create token
        const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET)
        
        //return to user
        res.send({ message: "you're logged in!",token });
        return token
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  })


  /*------register------*/



  usersRouter.post('/register', async (req, res, next) => {
      const{username,password,name,location} = req.body

      try{
          const checkUser = await getUserByUsername(username)
          console.log("checking user")
          if (checkUser){//check if user already exists
              next({
                name: "UsernameExistsError",
                message: "Sorry. That username already exists"
              })
          }
          else{
              //create a new user in the database
              //forgot await here
              console.log("creating user")
              const user = await createUser({username,password,name,location})
              //generate a new token for the new user to log them in
              console.log("usercreated")
                console.log("creating token")
                const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET)
                console.log("token created")
        
                //return to users
                res.send({ message: "you're logged in!",token });
                return token
          }
      }
      catch({name,message}){
          console.log(error)
          next({name,message})
      }    
    
    

  })

module.exports = usersRouter