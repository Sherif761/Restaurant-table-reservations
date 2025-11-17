import express from "express";
const app = express();

import AdminJS from 'adminjs';
// import { buildAuthenticatedRouter } from '@adminjs/express';
import AdminJSExpress  from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';

import {table} from '../config/schemas.js'

AdminJS.registerAdapter({ Database, Resource })
// import mongoose from "mongoose";
// const { connect, connection, Schema, model } = mongoose;




const adminOptions = {
  resources: [
    {
      resource: table,
      options: {
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
            label: 'Available Range',
            // type: 'richtext', // Optional: nicer editor
          },
          no_chairs: {
            label: 'Number Of Available Chairs In The Whole Place',
            // type: 'richtext', // Optional: nicer editor
          },
    },
        listProperties: ['tableId', 'maxCapacity', 'minCapacity', 'available_range', 'no_chairs'],
        editProperties: ['tableId', 'maxCapacity', 'minCapacity', 'available_range', 'no_chairs'],
        filterProperties: ['tableId', 'maxCapacity'],
      },
    }
  ],//listProperties, editProperties, filterProperties should be like the schema
  branding: {
    companyName: 'My CMS Dashboard',
    softwareBrothers: false,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGxwl4fhem6m2urbLPsROL7UHP2tjF4CowszALXe5IwDIMG7C2VdCqSyLCsNi4mrqWuKJgVE215SQCpX3TOTQSUgwhOnN_kBr2FB6omLvWww&s=10',
  },
};


const admin = new AdminJS(adminOptions);
// const adminRouter = buildAuthenticatedRouter(
  // admin
// );

const adminRouter = AdminJSExpress.buildRouter(admin);
// app.use(admin.options.rootPath, adminRouter); //while vistiting /admin route call adminRouter fn 

export { admin, adminRouter };







