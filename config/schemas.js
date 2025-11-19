import {mongoose} from "mongoose";

mongoose.connect('mongodb://localhost:27017/Restaurant-reservations')
.catch((err) => {
      console.log("Connection failed", err.message);
    })


mongoose.connection.on('connected', () => {
  console.log('\x1b[32m✔✔✔ MongoDB connected using mongoose driver\x1b[0m');
});


const TableSchema = new mongoose.Schema({
  tableId: {
      type: Number,
      required: true,
      min: [1, "tableId must be positive"],
      validate: {
            validator: Number.isInteger,
            message: "table Id must be a positive integer"
        }
    },
  maxCapacity: { 
    type: Number,
     required: true,
     min: [1, "tableId must be positive"],
     validate: {
            validator: Number.isInteger,
            message: "max Capacity must be an integer"
        }
    },
  minCapacity: { 
    type: Number,
     required: true,
     min: [1, "tableId must be positive"],
     validate: {
            validator: Number.isInteger ,
            message: "min Capacity must be an integer"
        }
    },
    available_range: { 
    type: String,
     required: true,
     validate: {
            validator: function(v) {
        return /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(v);
      },
      message: "available range format must be like 9:00-21:00"
        }
    },
    reserve: { 
    type: Array,
    default: [{}]
  },
    no_chairs: { 
    type: Number,
     required: true,
     min: [1, "no_chairs must be positive"],
     validate: {
            validator: Number.isInteger,
            message: "no_chairs must be an integer"
        }
    }
}, { 
collection: "tables", 
timestamps: true, 
strict: "throw" 
});

TableSchema.pre("validate", function(next) {
  if (this.minCapacity > this.maxCapacity) {
    return next(new Error("minCapacity cannot be greater than maxCapacity"));
  }
  next();
});
// Create model

export const table = mongoose.model("tables", TableSchema);

const mealsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  preparation_time: {
    type: String,
    required: true,
    validate: {
            validator: function(v) {
        return /^\d{1,2}:\d{2}$/.test(v);
      },
      message: "preparation time format must be like 00:20"
        }
  }
}, { 
collection: "meals", 
timestamps: true, 
strict: "throw" 
})

export const meal = mongoose.model("meals", mealsSchema);
// const login_signup = new mongoose.Schema({
//   name: {
//       type: String,
//       required: true,
//     },
// email: {
//       type: String,
//       required: true,
//       unique: true
//     }
//     ,
// password: {
//       type: String,
//       required: true,
//     },
// phoneNumber: {
//       type: String,
//       required: true,
//     },
// userRole: {
//   type: String,
//   default: "user"
// }
// }, { 
// collection: "login-signup", 
// timestamps: true, 
// strict: "throw" 
// });


// // Create model
// const User = mongoose.model("login-signup", login_signup);


