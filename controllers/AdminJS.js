import express from "express";
const app = express();

import AdminJS from 'adminjs';
import * as AdminJSBundler from '@adminjs/bundler'

import { ComponentLoader } from 'adminjs'
// import { buildAuthenticatedRouter } from '@adminjs/express';
import AdminJSExpress  from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';

import {table, meal} from '../config/schemas.js'
import path from 'path'

import getdb from '../config/mongodb.js'

console.log(
  'Resolved path =',
  path.resolve('./components/dashboard.jsx')
)

AdminJS.registerAdapter({ Database, Resource })
// import mongoose from "mongoose";
// const { connect, connection, Schema, model } = mongoose;

const componentLoader = new ComponentLoader();
const Components = {
    Dashboard: componentLoader.add('Dashboard', path.join(process.cwd(), 'components', 'dashboard.jsx')),
    // other custom components
}  
// AdminJS.bundle =  AdminJSBundler.bundle({ destinationDir: './components'})

const adminOptions = {
  rootPath: '/admin',
  componentLoader,
  dashboard: {
    component: Components.Dashboard,
    // Optional: you can add a handler to fetch data from backend to dashboard:
    // handler: async (req, res, context) => {
    //   const item = await table.findOne({ tableId: 1 });
    //   return { item };
    // },
  },
  resources: [
    {
      resource: table,
      options: {
        listProperties: ['tableId', 'maxCapacity', 'minCapacity', 'available_range', 'no_chairs'],
        editProperties: ['tableId', 'maxCapacity', 'minCapacity', 'available_range', 'no_chairs'],
        filterProperties: ['tableId', 'maxCapacity'],
        
        properties: {
          tableId: {
            label: 'Table ID',   // custom label shown in admin
          },
          maxCapacity: {
            label: 'Max Capacity',
          },
          minCapacity: {
            label: 'Min Capacity',
            // type: 'richtext', // Optional: nicer editor
          },
          available_range: {
            label: "Available Rangeeee",
            // type: 'richtext', // Optional: nicer editor
          },
          no_chairs: {
            label: 'number of chairs in whole restaurant',
            // type: 'richtext', // Optional: nicer editor
          },
        },
      },
    },

    {
      resource: meal,
      options: {
        listProperties: ['name', 'preparation_time'],
        editProperties: ['name', 'preparation_time'],
        filterProperties: ['name', 'preparation_time'],
      },
    }
  ],//listProperties, editProperties, filterProperties should be like the schema
  branding: {
    companyName: 'My CMS Dashboard',
    softwareBrothers: false,
    logo: '/images/logo.png'
  },
};

console.log("Bundle component path =", adminOptions.dashboard.component)
const admin = new AdminJS(adminOptions);
// const adminRouter = buildAuthenticatedRouter(
  // admin
// );

const adminRouter = AdminJSExpress.buildRouter(admin);
// app.use(admin.options.rootPath, adminRouter); //while vistiting /admin route call adminRouter fn 

adminRouter.get('/api/myObject', async (req, res) => {
  const searchTableId = req.query.tableID;
  console.log('tableid', typeof searchTableId)
  let items = {}
  if(searchTableId){
      items = await table.findOne({tableId: Number(searchTableId)});
      console.log('fetched table with tableid', items)
  }else{
     items = await table.find();
    console.log('fetched all tables', items)
  }
//  console.log('dateeeeeeeeeeeeee',items[0].reserve[0].reserve_date)
  res.json(items);
});

adminRouter.post('/admin/api/cancelReservation', async (req, res) => {
  try{
    console.log("..................")
    const ID = req.body.tableId;
   const tablee = await table.findOne({tableId: Number(searchTableId)})
   const email = null 

   result = 0
        z = 0
        datePart = req.body.start.split("T")[0]; // "2025-01-25"
        startTime = req.body.start.split("T")[1].split("Z")[0]; // "16:00"
        endTime = req.body.end.split("T")[1].split("Z")[0];
  // console.log('tableid', typeof searchTableId)
  let neededArray = null; // Ensure it's declared before loops
        let y = false;  // Variable to control the break flag
    if(tablee.length != 0){
      for ( i = 0; i < tablee.reserve.length; i++) {
            console.log(i)
            if (tablee.reserve[i].reserve_date === datePart) {
                for ( n = 0; n < tablee.reserve[i].reserve_array.length; n++) {
                    if (tablee.reserve[i].reserve_array[n][0] === startTime && tablee.reserve[i].reserve_array[n][1] === endTime) {
                        neededArray = tablee.reserve[i].reserve_array[n];
                        email = tablee.reserve[i].reserve_array[n][4]
                        y = true; // Set flag to true to indicate we found the element
                        break; // Break the inner loop once the item is found
                    }
                }
                if (y) break; // Break the outer loop if the inner loop found a match
            }
        }
    console.log(i)
        if (neededArray) {
            // Update the table if we found the item
            // console.log(z)
            z = await table.updateOne(
                {
                    tableId: ID,
                    "reserve.reserve_date": datePart // Find the right object in the reserve array
                },
                {
                    $pull: {
                        "reserve.$.reserve_array": neededArray // Pull the neededArray from reserve_array inside matched reserve object
                    }
                }
            );
            await getdb().collection('reservations').updateOne(
            { user: email }, 
            { $pull: { reservation: { date: datePart , tableId: ID, start: startTime, end: endTime } } })
            // console.log(z)
            return res.json({mess: 'Done!'})
        }
    }else{
      return res.json({mess: 'Invalid Operation!'})
    }
  }catch(err){
    console.log(err)
  }
});


export { admin, adminRouter };







