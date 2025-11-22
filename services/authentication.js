const passport = require('passport')
const{getdb} = require('../config/mongodb')
const bcrypt = require('bcrypt')
const { Strategy } = require('passport-local') 
const { ObjectId } = require('mongodb')


indicator = { message: '' }

passport.serializeUser((user, done)=>{// fn for attach or sign user to the req object (req.user). it is called after passport staretegy if done return is not false
    //id of serializing will be the id of the object in mongodb
    // console.log(user._id)
    done(null, user._id); //done fn is finally after cheking that all thing is good return what it turns to the req object 
})

passport.deserializeUser(async(id, done)=>{ //fn which when there is coming request it search with the id of user in db if found it is ok
    //    console.log(` deserialize id ${id}`);
        try{
            const user = await getdb().collection('login-signup').findOne({_id: new ObjectId(id)})
            if(!user) console.log("error from deserialize")
                //throw new Error("Authentication Failed")
            done(null, user)
        }catch(err){
            done(err, null)
        }
    })

passport.use(//while making a post request passport will be looking for username and password from the req body and send them as an argument
    new Strategy({usernameField: 'email', passReqToCallback: true },async (req, username, password, done)=>// strategy for authentication
        {//usernameField is used to clarify that the username will be email not exactly name
        // console.log(username)
        // console.log(password)
        try{
             const findUser = await getdb().collection('login-signup').findOne({email: username})//search with user email in db
             if(!findUser){
                return done(null, false, { message: 'email not found' });
             } 
             else if(!await bcrypt.compare(password, findUser.password)){ // comparing provided password with the decrypted one from db
                return done(null, false, { message: 'Password is incorrect' });
             } 
                ifLogin = 1
                // console.log("here")
                done(null, findUser);
        }catch(err){
            done(err, null);
        }
    })
)



register = async function(req, res, next){ //fn for register new user with new email
    try{
        console.log(req.body.email)
        if(await getdb().collection('login-signup').findOne({email: req.body.email})){// ensures that that provided email is not duplicated
            return res.redirect('/register?mess=Email has been already registered');
        }
        hashedPassword = await bcrypt.hash(req.body.password,10)// storing password encrypted
        let user = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phoneNumber: req.body.phone,
            userRole: "user"
        }
        getdb().collection('login-signup').insertOne(user).then(()=>{
            console.log("registeration sucsess")
        }).catch((err)=>{
            console.log(err)
        })
        next()
        // res.redirect('/login')
    }catch(err){
        console.log(err)
        res.redirect('/register')     
    }
}

module.exports = {register, indicator}
