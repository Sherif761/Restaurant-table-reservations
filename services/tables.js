const{getdb} = require('../config/mongodb')

let table = {}
let datePart 

let startTime 
let startHour 
let startMinute
//  console.log(startHour)

let endTime
let endHour
let endMinute 

tables = async function(req, res, next){ // fn for getting all tables from db
    try{
        allTables = await getdb().collection('tables').find({}).toArray()
        res.send(allTables)
        // console.log("tables", req.cookies)
    }catch(err){
        res.status(400).send({message: "server error"})
    }
}

async function checkChairs(req, datePart, startHour, startMinute, endHour, endMinute){ // Function to check whether the requested number of chairs is available.
// The admin defines the total number of chairs in the restaurant, and for each reservation request,
// the system calculates all active reservations for the same time and location.
// By subtracting the total reserved chairs from the total available chairs,
// the function determines if the requested reservation can be accommodated.
 
    try{
        let sum = 0
        let chairs_array = []
        let array_chairs = []
        

         reserveArray = await getdb().collection('tables').aggregate([
            { $unwind: "$reserve" },  
            { $match: { "reserve.reserve_date": datePart } },
            { $project: { _id: 0, reserve_array: "$reserve.reserve_array" } }
          ]).toArray();
                
        // console.log(reserveArray)
        
        if(reserveArray.length > 0) {
            for(i = 0; i<reserveArray.length; i++){
                for(q = 0 ; q< reserveArray[i].reserve_array.length ; q++){
                    array_chairs.push(reserveArray[i].reserve_array[q])
                }
            }
        }
        
        // console.log(array_chairs)
        for(i = 0 ; i<array_chairs.length ; i++){
            if((Number(array_chairs[i][0].split(":")[0]) < startHour) && (startHour < Number(array_chairs[i][1].split(":")[0]))){
                chairs_array.push(Number(array_chairs[i][2]))
            }
            else if(Number(array_chairs[i][0].split(":")[0]) === startHour && startHour === Number(array_chairs[i][1].split(":")[0])){
                if(Number(array_chairs[i][0].split(":")[1]) <= startMinute && startMinute < Number(array_chairs[i][1].split(":")[1])){
                    chairs_array.push(Number(array_chairs[i][2]))
                 }else if(Number(array_chairs[i][0].split(":")[1]) > startMinute && endMinute > Number(array_chairs[i][0].split(":")[1]))     
                 chairs_array.push(Number(array_chairs[i][2]))

            }
            else if(Number(array_chairs[i][0].split(":")[0]) === startHour){
                 if(Number(array_chairs[i][0].split(":")[1]) <= startMinute){
                    chairs_array.push(Number(array_chairs[i][2]))
                 }else if(endHour >= array_chairs[i][1].split(":")[0]){
                    chairs_array.push(Number(array_chairs[i][2]))
                 }
            }
            else if(Number(array_chairs[i][0].split(":")[0]) > startHour) {
                if(endHour > Number(array_chairs[i][0].split(":")[0])){
                    chairs_array.push(Number(array_chairs[i][2]))
                }else if(endHour === Number(array_chairs[i][0].split(":")[0])){
                    if(endMinute >Number(array_chairs[i][0].split(":")[1])){
                        chairs_array.push(Number(array_chairs[i][2]))
                    }
                }
            
            }else if(Number(array_chairs[i][1].split(":")[0]) === startHour && startMinute < Number(array_chairs[i][1].split(":")[1]))
                chairs_array.push(Number(array_chairs[i][2]))
        }
        // console.log(chairs_array)
        for(i = 0 ; i< chairs_array.length ; i++) sum += chairs_array[i]
        available_chairs = Number(table.no_chairs) - sum
        // console.log(available_chairs)
        if((Number(table.maxCapacity) < Number(req.body.members)) || (Number(req.body.members) < Number(table.minCapacity)) ||  (Number(req.body.members) > available_chairs)){
            return false
        }
        return true


    }catch(err){
        return res.status(400).send({message: `${err}`})
    }
}

reserve = async function(req, res, next){//fn for validate whether the slot selected can be reserved or not
    try{
        x = 0
        t = 0
        r = 0
        w = 0
        mealArray = []
        expectedEndTime = []
        
        table = await getdb().collection('tables').findOne({tableId: req.body.tableId})

        datePart = req.body.start.split("T")[0]; // "2025-01-25"

        startTime = req.body.start.split("T")[1].split("Z")[0]; // "16:00"
        startHour = Number(startTime.split(":")[0])
        startMinute = Number(startTime.split(":")[1])

        // console.log(req.body.meals)
        if (!req.body.meals && !req.body.end) return res.status(400).send({message: "you should at least choose the meal or the end time of your reservation"})
        if(req.body.meals?.length > 0){//If req.body.meals is undefined, ?.length prevents the error and returns undefined, making the condition safely evaluate to false.
            for(m = 0 ; m< req.body.meals.length ; m++){
                mealArray.push(await getdb().collection('meals').findOne({name: req.body.meals[m]}))
                // console.log(mealArray)
                expectedEndTime.push([startHour + Number(mealArray[m].preparation_time.split(":")[0]), startMinute + Number(mealArray[m].preparation_time.split(":")[1])])
                if(expectedEndTime[m][1] > 59){
                    expectedEndTime[m][0]++
                    expectedEndTime[m][1] -= 60
                }
            }
            // console.log(expectedEndTime)
            expectedEndTime.sort((a, b) => {
                if (a[0] === b[0]) {
                    return a[1] - b[1]; // Compare minutes if hours are the same
                }
                return a[0] - b[0]; // Compare hours first
            });
            // console.log(expectedEndTime)
        }else{
            expectedEndTime = [[startHour, startMinute + 30]]
            if(expectedEndTime[0][1] > 59){
                expectedEndTime[0][0] = startHour + 1
                expectedEndTime[0][1] -= 60
            }
        }
        

        if(req.body.end){
            endTime = req.body.end.split("T")[1].split("Z")[0];
            endHour = Number(endTime.split(":")[0])
            endMinute = Number(endTime.split(":")[1])
            if(endHour < expectedEndTime[expectedEndTime.length - 1][0]) return res.status(400).send({message: "the selected time is less than the required"})
            else if(endHour === expectedEndTime[expectedEndTime.length - 1][0]){
                if(endMinute < expectedEndTime[expectedEndTime.length - 1][1]) return res.status(400).send({message: "the selected time is less than the required"})
            }    
        }else{
            endTime = `${expectedEndTime[expectedEndTime.length - 1][0]}:${expectedEndTime[expectedEndTime.length - 1][1]}`
            endHour = expectedEndTime[expectedEndTime.length - 1][0]
            endMinute = expectedEndTime[expectedEndTime.length - 1][1]
        }

        minRange = table.available_range.split("-")[0]
        maxRange = table.available_range.split("-")[1]

        minHour = table.available_range.split(":")[0]
        minMin = table.available_range.split(":")[1].split("-")[0]
        maxHour = table.available_range.split("-")[1].split(":")[0]
        maxMin = table.available_range.split("-")[1].split(":")[1]


        if((startHour < Number(table.available_range.split(":")[0])) || 
        (endHour > Number(table.available_range.split(":")[1].split("-")[1].split(":")[0]))||
        (startHour > endHour)|| startMinute < Number(table.available_range.split(":")[1].split("-")[0])||
        (endMinute > Number(table.available_range.split(":")[1].split("-")[1].split(":")[1])))
        return res.status(400).send({message: "the selected time is unavailable"})

        if(startHour === endHour){
            if(startMinute >= endMinute) return res.status(400).send({message: "the selected time is unavailable"})
        }
        // console.log(req.body.meals)

        for(i = 0 ; i<table.reserve.length; i++){
            if(table.reserve[i].reserve_date === datePart){
                array = table.reserve[i].reserve_array;
                break
        }}

        if(!table.reserve[0].reserve_date){
            indication = checkChairs(req, datePart, startHour, startMinute, endHour, endMinute)
            if(!indication) return res.status(400).send({message: "number of members is unavailable "})
            array = [[startTime, endTime, req.body.members, req.body.meals, req.user.email]]
            await getdb().collection('tables').updateOne(
                {tableId: req.body.tableId},
                { $set: {[`reserve.${0}`]: {reserve_date: datePart, reserve_array: array}}},
                { upsert: true } )
            if(!await getdb().collection('reservations').findOne({user: req.user.email})){
                await getdb().collection('reservations').insertOne(
                    {
                        user: req.user.email,
                        reservation:[{
                            date: datePart,
                            tableId: table.tableId,
                            start: startTime,
                            end: endTime,
                            meals: req.body.meals
                        }]
                    }
                )
            }else{
                await getdb().collection('reservations').updateOne(
                    {user: req.user.email},
                    {$push: {reservation: {
                        date: datePart,
                        tableId: table.tableId,
                        start: startTime,
                        end: endTime,
                        meals: req.body.meals
                    }}}
                )
            }
            
            return res.status(200).json({ success: true, message: 'table has been reserved sucsessfully' });


        }else if(i ===table.reserve.length){
            indication = checkChairs(req, datePart, startHour, startMinute, endHour, endMinute)
            if(!indication) return res.status(400).send({message: "number of members is unavailable "})
            array = [[startTime, endTime, req.body.members, req.body.meals, req.user.email]]
            await getdb().collection('tables').updateOne(
                {tableId: req.body.tableId},
                {$push: {  reserve: {reserve_date: datePart, reserve_array: array}}},
                    
                { upsert: true } )

                if(!await getdb().collection('reservations').findOne({user: req.user.email})){
                    await getdb().collection('reservations').insertOne(
                        {
                            user: req.user.email,
                            reservation:[{
                                date: datePart,
                                tableId: table.tableId,
                                start: startTime,
                                end: endTime,
                                meals: req.body.meals
                            }]
                        }
                    )
                }else{
                    await getdb().collection('reservations').updateOne(
                        {user: req.user.email},
                        {$push: {reservation: {
                            date: datePart,
                            tableId: table.tableId,
                            start: startTime,
                            end: endTime,
                            meals: req.body.meals
                        }}}
                    )
                }
            return res.status(200).json({ success: true, message: 'table has been reserved sucsessfully' });

        }  
            // console.log(table.reserve)
        if(!(Number(array[0][0].split(":")[0]) === Number(minHour))|| (Number(array[0][0].split(":")[1]) === Number(minMin))){
            start = Number(minHour)
            end =  Number(array[0][0].split(":")[0])
            for(q = start ; q <= end ; q++){
                if(q ===startHour){
                    if(startHour === end){
                        start_minute = Number(array[0][0].split(":")[1])
                        if(startMinute < start_minute) t = 1
                    }else t = 1
                } 
                if(q === endHour){
                    if(endHour === end){
                        end_minute = Number(array[0][0].split(":")[1])
                        if(endMinute <= end_minute) r = 1
                    }else if(endHour === start){
                        if(endMinute > startMinute) r = 1
                    }else r = 1
                } 
                if((q === end) && (((!t && r) || (t && !r)))){
                    t = 0
                    r = 0
                }
                if(t && r) break
            }
        }
        // console.log(`here${t} and ${r}`)
        if((!t && r) || (t && !r) )return res.status(400).send({message: "the selected time is unavailable"})

        if(!(Number(array[array.length - 1][1].split(":")[0]) === Number(maxHour))){
            start = Number(array[array.length - 1][1].split(":")[0])
            end = Number(maxHour)
            if(t && r) q = end + 1
            // console.log(start, end)
            for(q = start ; q <= end ; q++){
                if(q ===startHour && q < end){
                    if(startHour === start){
                        start_minute = Number(array[array.length - 1][1].split(":")[1])
                        if(startMinute >= start_minute) t = 1
                    }else t = 1
                }
                if(q === endHour){
                    if(endHour === start){
                        end_minute = Number(array[array.length - 1][1].split(":")[1])
                        if(endMinute > end_minute) r = 1
                    }else if(endHour === end){
                        if(endMinute <= Number(maxMin)) r = 1
                    }else r = 1
                }
                if((q === end) && (((!t && r) || (t && !r)))){
                    t = 0
                    r = 0
                }
                if(t && r) break
            }
        }
        // console.log(`hereee${t} and ${r}`)
        if((!t && r) || (t && !r) )return res.status(400).send({message: "the selected time is unavailable"})

        if(t && r) w = array.length - 1

        for(w  ; w<array.length - 1 ; w++){
            start = Number(array[w][1].split(":")[0])
            end = Number(array[w + 1][0].split(":")[0])
                // console.log(start, end)
            for(q = start ; q <= end ; q++){
                if(q ===startHour){
                    if(startHour === start){
                        start_minute = Number(array[w][1].split(":")[1])
                        if(startMinute >= start_minute) t = 1
                    }else if(startHour === end){
                        start_minute = Number(array[w+1][0].split(":")[1])
                        if(startMinute <= start_minute) t = 1
                    }else t = 1
                } 
                if(q === endHour){
                    if(endHour === end){
                        end_minute = Number(array[w + 1][0].split(":")[1])
                        if(endMinute <= end_minute) r = 1
                    }else if(endHour === start){
                        end_minute = Number(array[w][0].split(":")[1])
                        if(endMinute >= end_minute) r = 1
                    }else r = 1
                } 
                if((q === end) && (((!t && r) || (t && !r)))){
                    t = 0
                    r = 0
                }
                if(t && r){
                    x = 1
                    break
                }
            }
            if(x) break
        }

        if((!t && r) || (t && !r) || (!t && !r))return res.status(400).send({message: "the selected time is unavailable"})

        indication = checkChairs(req, datePart, startHour, startMinute, endHour, endMinute)
        if(!indication) return res.status(400).send({message: "number of members is unavailable "})
        array.push([startTime, endTime, req.body.members, req.body.meals, req.user.email])
        array.sort((a, b) => timeToSeconds(a[0]) - timeToSeconds(b[0]));

// Function to convert time string (HH:MM) to seconds
        function timeToSeconds(timeStr) {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 3600 + minutes * 60; // Ignore seconds
        }
        await getdb().collection('tables').updateOne(
            {tableId: req.body.tableId},
            {$set: {[`reserve.${i}`]: {reserve_date: datePart, reserve_array: array}}},
            { upsert: true } )     
        
            if(!await getdb().collection('reservations').findOne({user: req.user.email})){
                await getdb().collection('reservations').insertOne(
                    {
                        user: req.user.email,
                        reservation:[{
                            date: datePart,
                            tableId: table.tableId,
                            start: startTime,
                            end: endTime,
                            meals: req.body.meals
                        }]
                    }
                )
            }else{
                await getdb().collection('reservations').updateOne(
                    {user: req.user.email},
                    {$push: {reservation: {
                        date: datePart,
                        tableId: table.tableId,
                        start: startTime,
                        end: endTime,
                        meals: req.body.meals
                    }}}
                )
            }    
        res.status(200).json({ success: true, message: 'table has been reserved sucsessfully' });
    }catch(err){
        res.status(400).send({message: `${err}`})
    }
}



reservedByUser = async function(req, res, next){ //fn for return user reservations
    try{
        userTables = await getdb().collection('reservations').find({user: req.user.email}).toArray()
        if(userTables.length === 0) return res.status(200).json({ message: 'there are no tables reserved for you!' });
        res.send(userTables)
        next()
        }catch(err){
            res.status(400).send({message: `${err}`})
    }
}

unReservedTable = async function(req, res, next){ // fn for return available slots for table
    try{
        datePart = req.body.date; // "2025-01-25"
        // console.log(datePart)
        // console.log(req.body.tableId)
        available_array = []
        table = await getdb().collection('tables').findOne({tableId: Number(req.body.tableId)})
        // console.log(table)
        minRange = table.available_range.split("-")[0]
        maxRange = table.available_range.split("-")[1]
        
        minHour = table.available_range.split(":")[0]
        minMin = table.available_range.split(":")[1].split("-")[0]
        maxHour = table.available_range.split("-")[1].split(":")[0]
        maxMin = table.available_range.split("-")[1].split(":")[1]

        for(i = 0 ; i< table.reserve.length ; i++){
            if(table.reserve[i].reserve_date === datePart){
                x = table.reserve[i].reserve_array
                if(x[0][0].split(":")[0] != minHour){
                    // console.log("before")
                    available_array.push([minRange, x[0][0]])
                    // console.log(available_array)
                }else if(x[0][0].split(":")[1] != minMin){
                    // console.log("before")
                    available_array.push([minRange, x[0][0]])
                    // console.log(available_array)
                }
                for(q = 0 ; q< x.length - 1 ; q++){
                    if(x[q][1].split(":")[0] != x[q+1][0].split(":")[0]){
                        available_array.push([x[q][1], x[q+1][0]])
                    }else if(x[q][1].split(":")[1] != x[q+1][0].split(":")[1]){
                        available_array.push([x[q][1], x[q+1][0]])
                    }
                }

                if(x[x.length - 1][1].split(":")[0] != maxHour){
                    available_array.push([x[x.length - 1][1], maxRange])
                }else if(x[x.length - 1][1].split(":")[1] != maxMin){
                    available_array.push([x[x.length - 1][1], maxRange])
                }
                break
            }
        }
        if(available_array.length === 0) return res.status(200).json({ message: 'this table is not available now!' });
        res.send({Available_slots: available_array})
        next()
        }catch(err){
            res.status(400).send({message: `${err}`})
    }
}


cancel = async function(req, res, next){ // fn for cancell user reservation
    try{
        result = 0
        z = 0
        datePart = req.body.start.split("T")[0]; // "2025-01-25"
        startTime = req.body.start.split("T")[1].split("Z")[0]; // "16:00"
        endTime = req.body.end.split("T")[1].split("Z")[0];
        table = await getdb().collection('tables').findOne({tableId: req.body.tableId})
        doc = await getdb().collection('reservations').findOne({user: req.user.email})
        if(!doc) return res.status(400).send({message: `there is no tables reserved for you`})
         result = await getdb().collection('reservations').updateOne(
            { user: req.user.email }, 
            { $pull: { reservation: { date: datePart , tableId: req.body.tableId, start: startTime, end: endTime } } }
        );
        if (result) {
            let neededArray = null; // Ensure it's declared before loops
            let y = false;  // Variable to control the break flag
        
            for ( i = 0; i < table.reserve.length; i++) {
                // console.log(i)
                if (table.reserve[i].reserve_date === datePart) {
                    for ( n = 0; n < table.reserve[i].reserve_array.length; n++) {
                        if (table.reserve[i].reserve_array[n][0] === startTime && table.reserve[i].reserve_array[n][1] === endTime) {
                            neededArray = table.reserve[i].reserve_array[n];
                            y = true; // Set flag to true to indicate we found the element
                            break; // Break the inner loop once the item is found
                        }
                    }
                    if (y) break; // Break the outer loop if the inner loop found a match
                }
            }
        // console.log(i)
            if (neededArray) {
                // Update the table if we found the item
                // console.log(z)
                z = await getdb().collection('tables').updateOne(
                    {
                        tableId: req.body.tableId,
                        "reserve.reserve_date": datePart // Find the right object in the reserve array
                    },
                    {
                        $pull: {
                            "reserve.$.reserve_array": neededArray // Pull the neededArray from reserve_array inside matched reserve object
                        }
                    }
                );
                // console.log(z)
            }
        }
        // console.log(z)
        // console.log(result)
        if(!result.modifiedCount || !z.modifiedCount) return res.status(400).send({message: `There is no reservation for you at this time!`})
        res.status(200).json({ success: true, message: 'reservation has been cancelled!' });
        next()
        }catch(err){
            res.status(400).send({message: `${err}`})
    }
}



module.exports = {tables, reserve, cancel, reservedByUser, unReservedTable}
