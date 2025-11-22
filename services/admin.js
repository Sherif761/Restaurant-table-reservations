const{getdb} = require('../config/mongodb')

notUser = function(req, res, next){ // fn for checking the request coming from logged in user or not
    // console.log(req.user)
    // console.log(req.sessionID)
    if(!req.user) return res.redirect('/login')
    next()
}

adminFunc =  function(req, res, next){ // fn for checking the request coming from userRole which is admin
    role = req.user.userRole
    if (role == "admin"){
        // console.log(req.user)
        return res.redirect('/admin');
    } 
    // else res.status(200).json({ success: false, message:`wellcome admin ${req.user.name}` });
    next()
}

adminTables = async function(req, res, next){ // fn for pushing tables by admin (without adminjs dashboard)
    try{
        let table = {}
        let m = 0
    allTables = await getdb().collection('tables').find({}).toArray()
    if(allTables.length != 0){
        for(m = 0 ; m< allTables.length ; m++){
                if (req.body.tableId == allTables[m].tableId){
                    return res.status(400).send({message: "Sorry table with that id has been already added"})
                }
            }
    }
     
    if(allTables.length === 0){
         table = {
            tableId: req.body.tableId,
            maxCapacity: req.body.maxCapacity,
            minCapacity: req.body.minCapacity,
            available_range: req.body.range,
            reserve: [{}],
            no_chairs: req.body.no_chairs
        }
    }else if(allTables[0].no_chairs){
         table = {
            tableId: req.body.tableId,
            maxCapacity: req.body.maxCapacity,
            minCapacity: req.body.minCapacity,
            available_range: req.body.range,
            reserve: [{}],
            no_chairs: allTables[0].no_chairs
        }
    }
    
     
     await getdb().collection('tables').insertOne(table)
     // console.log(table)
     next()
    }catch(err){
        res.status(400).send({message: "server error"})
    }
    
 }

 adminMeals = async function(req, res, next){ // fn for adding meals by admin (without adminjs dashboard)
    let meals = {
         name: req.body.mealName,
         time: req.body.mealTime
     }
     
     await getdb().collection('meals').insertOne(meals)
     next()
 }

chairs = async function(req ,res, next){
    await getdb().collection('tables').updateMany(
        {},
        {$set: {no_chairs: req.body.chairs}},
        { upsert: true }
    )
     next()
}


module.exports = {notUser, adminFunc, adminTables, adminMeals, chairs}
