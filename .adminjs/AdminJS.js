import express from "express";
const app = express();

import AdminJS from 'adminjs';
// import { buildAuthenticatedRouter } from '@adminjs/express';
import AdminJSExpress  from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';

import {table, meal} from '../config/schemas.js'

AdminJS.registerAdapter({ Database, Resource })
// import mongoose from "mongoose";
// const { connect, connection, Schema, model } = mongoose;




const adminOptions = {
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


const admin = new AdminJS(adminOptions);
// const adminRouter = buildAuthenticatedRouter(
  // admin
// );

const adminRouter = AdminJSExpress.buildRouter(admin);
// app.use(admin.options.rootPath, adminRouter); //while vistiting /admin route call adminRouter fn 

export { admin, adminRouter };







