import mongoose from 'mongoose';
const userschema = new mongoose.Schema({
  name:{
     type:String,
     required:true, 
  },
  
   email:{
    type:String,
    required:true,
   },

   mobile:{
    type:String,
    required:false,
   },
   password:{
    type: String,
    required:true
   }, 
},
{timestamps:true},
);
export const User = mongoose.model("users",userschema)