import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getSummary,
  getMonthly
} from '../controller/expenseController.js';

const router = express.Router();

router.post('/', auth, addExpense);
router.get('/', auth, getExpenses);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);


router.get('/summary', auth, getSummary);
router.get('/monthly', auth, getMonthly);

export default router;