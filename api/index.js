const express = require("express")
const apiRouter = express.Router()

//importing the rout to users
const usersRouter = require("./users")
apiRouter.use("/users", usersRouter)

//importing the route to posts
const postsRouter = require("./posts")
apiRouter.use("/posts",postsRouter)

// importing the route to tags
const tagsRouter = require("./tags")
apiRouter.use("/tags",tagsRouter)

//export the apiRouter which is a bundle of the about routers so it can be used in the main index.js
module.exports = apiRouter;