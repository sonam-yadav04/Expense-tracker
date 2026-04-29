import mongoose from 'mongoose';
const ExpenseSchema = new mongoose.Schema({
   userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
   },
    amount:{
    type:Number,
    required:true,
    min:0
    },
   category:{
      type:String,
      required: true,
      enum: ["food", "transport", "entertainment", "shopping", "health", "bills", "education", "other"]
    },
   date:{
      type:String,
      required:true,
      default: Date.now
  },
  title:{
    type:String,
     trim: true,
      maxlength: 200
  }
},{timestamps:true}
);
export const Expense = mongoose.model("expenses", ExpenseSchema)