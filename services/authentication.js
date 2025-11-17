const passport = require('passport')
const{getdb} = require('../config/mongodb')
const bcrypt = require('bcrypt')
const { Strategy } = require('passport-local') // in this case the strategy is called local
const { ObjectId } = require('mongodb')


indicator = { message: '' }

passport.serializeUser((user, done)=>{//id of serializing will be the id of the object in mongodb
    // console.log(user._id)
    done(null, user._id); //done fn is finally after cheking that all thing is good return what it turns to the req object 
})

passport.deserializeUser(async(id, done)=>{
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
    new Strategy({usernameField: 'email', passReqToCallback: true },async (req, username, password, done)=>{//usernameField is used to clarify that the username will be email not exactly name
        // console.log(username)
        // console.log(password)
        try{
             const findUser = await getdb().collection('login-signup').findOne({email: username})
            // console.log("a7a1")
             if(!findUser){
                return done(null, false, { message: 'email not found' });
             } 
             else if(!await bcrypt.compare(password, findUser.password)){ 
                return done(null, false, { message: 'Password is incorrect' });
             } 
                ifLogin = 1
                console.log("here")
                //  console.log(passport.)
                done(null, findUser);
        }catch(err){
            done(err, null);
        }
    })
)



register = async function(req, res, next){
    try{
        console.log(req.body.email)
        if(await getdb().collection('login-signup').findOne({email: req.body.email})){
            // res.send('Email has been already registered')
            return res.redirect('/register?mess=Email has been already registered');
        }
        hashedPassword = await bcrypt.hash(req.body.password,10)
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