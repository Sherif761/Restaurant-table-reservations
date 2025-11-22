let express = require("express");
let app = express();
const https = require('https');
const fs = require('fs')
const PORT = 5500;
const path = require('path')
let session = require("express-session")
const csurf = require("csurf")
const MongoStore = require("connect-mongo");
const passport = require("passport");
const cors = require('cors');
const cookieParser = require("cookie-parser");

const {connectiondb , getdb} = require('./config/mongodb')
const {register, indicator} = require('./services/authentication')
const {notUser, adminFunc, adminFuncTables, adminFuncMeals, chairs} = require('./services/admin')
const {tables, reserve, cancel, reservedByUser, unReservedTable} = require('./services/tables')
const {admin, adminRouter} = require('./controllers/AdminJS')


let db 
app.use(cookieParser());
app.use(cors({
    origin: 'http://127.0.0.1:5501', // Specify the exact frontend URL here
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"] // Allowed headers
}));

app.use(express.json())
app.use(express.urlencoded({extended: false}))//for parsing x-www-form-urlencoded
app.use(express.static("public"));

app.use(session({
    // name: 'backend.sid',
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,// using passport makes the session is modified once it is created
    cookie: {
        // domain: 'localhost',  // ✅ Ensures it's available across all localhost apps
        path: '/',            // ✅ Available for all routes
        httpOnly: true,       // ✅ Prevents JavaScript access
        secure: true,        // ✅ Must be false on HTTP (localhost); true on HTTPS
        sameSite: 'None'      // ✅ Required for cross-origin cookies
    },
    store: MongoStore.create({ //collection to store session storage
        mongoUrl: 'mongodb://localhost:27017/Restaurant-reservations',// if logout session store is deleted
        collectionName: 'session',
    })
}));

app.set('view engine', 'ejs');//app.set is for defining how the express works
app.set('views', path.join(process.cwd(), 'services')); //as the ejs file is inside strategies folder

app.use(passport.session())
app.use(passport.initialize())

app.use(csurf());
app.use((req, res, next) => {// req.csrfToken() for generating token for that request provided by the csurf middleware,
    res.locals.csrfToken = req.csrfToken();//res.locals.csrfToken is saving that token in a local variable which can be accessed dynamically in ejs file 
    next();
  });

app.use(admin.options.rootPath,notUser, (req, res, next)=>{
    role = req.user.userRole
    if (role == "admin"){
        return next()
    }
    return res.send({mess: "Unauthorized"});
}, adminRouter); ////while vistiting /admin route call adminRouter fn 

app.get('/register', (req, res)=>{
    let message = req.query.mess
    res.status(409).send({mess: message})
})

app.post('/register', register, (req, res)=>{
    res.send({mess: "registered successfully"})
})

app.get('/login', (req, res)=>{
    req.body._csrf = req.csrfToken()
    res.render('login')
})


app.post('/login', passport.authenticate("local"), adminFunc , (req,res)=>{
    console.log("logged in user object: ",req.user)
    res.status(200).json({ success: true, message: 'Login successful11', cookie: req.cookies  });
})

app.get('/logout', (req , res)=>{
    // console.log(req.session)
    req.logOut((err)=>{
        if(err) return res.sendStatus(400);
        req.session.destroy((err) => {
            if (err) return next(err);
        })
        res.redirect('/login')
        // res.clearCookie('connect.sid');
})
})




app.get('/api/tables', notUser, tables, (req, res)=>{

})
app.post('/api/tables', notUser, adminFunc, adminTables, (req, res)=>{
    res.status(200).json({ success: true, message: 'table has been added sucsessfully' });
})

app.post('/api/meals', notUser, adminFunc, adminMeals, (req, res)=>{
    res.status(200).json({ success: true, message: 'meal has been added sucsessfully' });
})

app.post('/api/tables/chairs', notUser, adminFunc, chairs ,(req, res)=>{
    res.status(200).json({ success: true, message: 'chairs has been added sucsessfully' });
})

app.post('/api/tables/reserve', notUser, reserve, (req, res)=>{

})

app.get('/api/tables/reservations', notUser, reservedByUser, (req, res)=>{

})

app.get('/api/table/available', notUser, unReservedTable, (req, res)=>{

})

app.post('/api/tables/cancel', notUser, cancel, (req, res)=>{

})



const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  };
  

connectiondb((err) =>{
if(!err){
    https.createServer(options, app).listen(`${PORT}`, () => {
        console.log(`Server is running on https://localhost:${PORT}`);
      });
    db = getdb()
}else{
    console.log(err)
}
})



module.exports = {db}
