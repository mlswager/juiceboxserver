const express = require("express")
const apiRouter = express.Router()

/*------verifytokencodefrominstructions------*/

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');//header is a function. you could also do it req.headers.authorization
    //console.log(req.headers)
  if (!auth) { // nothing to see here if there is no authorization header
    next();

  } else if (auth.startsWith(prefix)) { //if there is an authorization header that starts with the Bearer prefix
    const token = auth.slice(prefix.length);
    try { //verify that the token from the line above matches the login info once decrypted by thwe JWT_SECRET. if it doesn't then id would be undefined
      const { id } = jwt.verify(token, JWT_SECRET);
        // if there is an id from the line above then add the results of getUserById to the request with a key of user
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
        //this should pass the information along to where the error is handled
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});

/*------middleware to say that there is a user logged in ------*/
//?---more info on where this gets the info it's displaying---?

apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
  });

/*------attach routers------*/

//importing the route to users
const usersRouter = require("./users")
apiRouter.use("/users", usersRouter)

//importing the route to posts
const postsRouter = require("./posts")
apiRouter.use("/posts",postsRouter)

// importing the route to tags
const tagsRouter = require("./tags")
apiRouter.use("/tags",tagsRouter)

/*------errorhandler------*/
apiRouter.use((error, req, res, next) => {
    res.send(error);
  });

//export the apiRouter which is a bundle of the about routers so it can be used in the main index.js
module.exports = apiRouter;


