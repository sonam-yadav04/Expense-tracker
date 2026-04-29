import express from 'express';
import expenseRoutes from './routes/expenseRoutes.js';
import userRoutes  from './routes/userRoute.js';
import { ConnectDB } from './config/db.js';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app =  express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use((err, req, res, next)=>{
    console.log('error from server side', err)
}) 
ConnectDB();
app.use('/api/auth', userRoutes);
app.use('/api/expenses', expenseRoutes);
const port = 4000;
app.listen(port, '0.0.0.0', (error) => {
  if (!error) {
    console.log(`Server is running on: http://localhost:${port}`);
  } else {
    console.log("error occurred", error);
  }
});
