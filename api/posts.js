const express = require("express")
const postsRouter = express.Router()
//the .. in ..db is because we have to go up a layer to get to the main branch that has access to db
const {getAllPosts,createPost,updatePost,getPostById,} = require("../db")
const{requireUser}=require("./utils")

//testing requireUser
//figure out when you should invoke a function vs just list it
// postsRouter.post("/",requireUser, async (req,res,next)=>{
//     res.send({message: "testing requireUser successfule"})
// })


//does the order of req,res,next matter?
postsRouter.use((req,res,next)=>{
    console.log("a request is being made to /posts")
    //res.send({message: "hello from /posts"})
    next()
})

/*------gets all the posts------*/

// postsRouter.get("/", async(req,res,next)=>{
//     //forgot the await the first time
//     const posts = await getAllPosts()
//     res.send({posts})
// })

postsRouter.get("/", async(req,res,next)=>{
    try{
        const allposts = await getAllPosts()
        const posts = allposts.filter(post =>{
            if (post.active){//if the post is active it can be displayed to anyone
                return true
            }
            if (req.user && post.author.id === req.user.id){//if the post belongs to the user it can be displayed regardless of whether it is active(the instructions didn't say this until it gave us the code)
                return true
            }
            return false//if neither of the above happen the post does not display
        })
        res.send({posts})
    }
    catch({name,message}){
        next({name,message})
    }
})

/*------create a new post------*/

postsRouter.post("/",requireUser, async(req,res,next)=>{
    //console.log("req.body: ",req.body)
    const {title, content, tags=""} = req.body//this destructures the data in req.body
    //console.log("tags: ",tags)
    const tagArr = tags.trim().split(/\s+/)//I believe this is turning tags from a string to an array
    //onsole.log("tagArr: ",tagArr)
    const postData = {}

    if (tagArr.length){ // if there are tags we set them to postData.tags
        postData.tags = tagArr
    }

    try{
        
        postData.title = title//putting the sectructured data from above into thee postData object
        postData.content = content
        postData.authorId = req.user.id//we grab authorid from req.user because we didn't destructure it above
        
        //add postData to the database using the createPost function from db/index. assign the response to post
        const post = await createPost(postData)
        if (post){
            res.send({post})
        }
        else{
            next({
                name: "ErrorCreatingPost",
                message: "There was an error creating this post"
              });
        }
    }
    catch({name,message}){
        console.log("there was an error creating the post")
        next({name,message})
    }
})

/*------update an existing post------*/

postsRouter.patch("/:postId", requireUser, async(req,res,next) => {
    const{postId} = req.params//destructure postId from the request parameters
    //console.log("req.params: ",req.params)
    //console.log("postId: ", postId)
    const{title,content, tags}=req.body//destructure title, content, body from the request body

    const updateFields = {}//creating a variable that is an empty object

    if(tags && tags.length > 0){//?? something to do with turning the tags into an array and then adding it to the updateFields object
        updateFields.tags = tags.trim().split(/\s+/)
    }

    if (title){//if there is a title requested than that title is added to the updateFields object
        updateFields.title = title
    }

    if(content){//if there is a content requested than that content is added to the updateFields object
        updateFields.content = content
    }

    try{
        const originalPost = await getPostById(postId)//getting the post from the database and storing it in the variable "originalPost"
        //console.log(`original post: ${originalPost}`)
        if(originalPost.author.id===req.user.id){//checking to see if the post from the database has an author id that mmatches the author id of the currently logged in user
            const updatedPost = await updatePost(postId, updateFields)//use updatePost to create a new post and assign the returned value to the updatedPost variable
            res.send({post:updatedPost}) //send the updatePost variable to the user
        }
        else{
            next({
                name: "UnauthorizedUserError",
                message:"You can't update a post that is not yours"
            })
        }
    }
    catch({name,message}){
        console.log("there was an error updating the post")
        next({name,message})
    }


})

/*------delete posts------*/

//didn't think to check that a post was actually returned from the database
postsRouter.delete('/:postId', requireUser, async(req,res,next)=>{
    const {postId} = req.params//destructure postId from request parameters
    console.log("postId:",postId)
    try{
        const post = await getPostById(postId)//grab the post from the database based on the postId (forgot to do this step)(forgot the await)
        console.log("post: ",post)
        if(post && post.author.id===req.user.id){//if there is a post returned from the datavase AND if the author.id of the post from the database matches the id of the post from the databse
        const deactivatePost = await updatePost(postId, {active:false})//use the updatePost function to change the active status to false (forgot the await)
        res.send({post:deactivatePost})//send the deactivated post to the user
        }
        else{//TERNERY:if the author.id does not match the id of the the post from the database then send an error
            next(post ? {//if there is a post returned from the database then send one error, if there is not then send a different error
                name:"postDeleteErrorUnauthorizeUser",
                message:"You cannot delete a post that is not yours"
            }:{
                name:"postDeleteErrorPostNotFound",
                message: "The requested post was not found"
            })
        }
    }
    catch({name,message}){
        next({name,message})
    }

})

/*------export------*/

module.exports = postsRouter