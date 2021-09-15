const express = require("express")
const postsRouter = express.Router()
//the .. in ..db is because we have to go up a layer to get to the main branch that has access to db
const {getAllPosts,createPost,updatePost,getPostById} = require("../db")
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

postsRouter.get("/", async(req,res,next)=>{
    //forgot the await the first time
    const posts = await getAllPosts()
    res.send({posts})
})

/*------create a new post------*/

postsRouter.post("/",requireUser, async(req,res,next)=>{
    //console.log("req.body: ",req.body)
    const {title, content, tags=""} = req.body//this destructures the data in req.body
    //console.log("tags: ",tags)
    const tagArr = tags.trim().split(/\s+/)//I believe this is turning tags from astrng to an array
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

/*------export------*/

module.exports = postsRouter