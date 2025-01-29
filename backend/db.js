const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const MONGODB_URL = process.env.MONGODB_URL;
console.log("Attempting to connect to mongodb ...");

main().catch(err => console.error("Error connecting to MongoDB"));

async function main() {
  await mongoose.connect(MONGODB_URL);
  console.log("Connected to MongoDB");
}

const{Schema, model} = require("mongoose");



const studentSchema = new Schema({
email: {
type: String,
required: true,
unique: true,
trim: true,
lowercase: true
},
password: {
type: String,
required: true
},
name: {
type: String,
required: true,
trim: true
},
mobileNumber: {
    type: String,
    required: true,
    trim: true
    }
});

const Student = model('Student', studentSchema);

const hostSchema= new Schema({
    hostId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    college: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    }
})

const Host= model('Host', hostSchema);

module.exports = {
Student,
Host
};


