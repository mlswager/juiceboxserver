
//function to sendan error message if the user is not logged in that we can apply to routes that need a user to be logged in
//this can be applied to multiple places like this: someRouter.post('/some/route', requireUser, async (req, res, next) => {
function requireUser(req,res,next){
    if(!req.user){
        console.log("the user is not logged in")
        next({
            name:"MissingUserError",
            message:"You are not logged in"
        })
    }
    next()
}

module.exports = {
    requireUser
}