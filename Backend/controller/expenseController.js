import { Expense } from '../model/expense.js';

export const addExpense = async (req, res) => {
  try {
    const { amount, category, date, title } = req.body;

    if (!amount || !category) {
      return res.status(400).json({
        success: false,
        msg: "Amount and category are required"
      });
    }

    const newExpense = await Expense.create({
      userId: req.user.id,
      amount,
      category,
      date,
      title
    });

    res.status(201).json({
      success: true,
      expense: newExpense
    });

  } catch (err) {
    console.log("Error adding expense:", err);

    res.status(500).json({
      success: false,
      msg: "Failed to add expense",
      error: err.message
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (err) {
    console.log("Error fetching expenses:", err);

    res.status(500).json({
      success: false,
      msg: "Failed to fetch expenses",
      error: err.message
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // 🔥 important
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        msg: "Expense not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      expense
    });

  } catch (err) {
    console.log("Error updating expense:", err);

    res.status(500).json({
      success: false,
      msg: "Failed to update expense",
      error: err.message
    });
  }
};
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.user.id // 🔥 security
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        msg: "Expense not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      msg: "Expense deleted successfully"
    });

  } catch (err) {
    console.log("Error deleting expense:", err);

    res.status(500).json({
      success: false,
      msg: "Failed to delete expense",
      error: err.message
    });
  }
};
export const getSummary = async (req, res) => {
  try {
    const { month } = req.query;
    let match = { userId: req.user.id };

    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      match.date = { $gte: start.toISOString().split('T')[0], $lt: end.toISOString().split('T')[0] };
    }

    const summary = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpent = summary.reduce((sum, cat) => sum + cat.total, 0);

    res.status(200).json({
      success: true,
      summary: summary.map(s => ({ category: s._id, total: s.total, count: s.count })),
      totalSpent
    });

  } catch (err) {
    console.log("Error in summary:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to get summary",
      error: err.message
    });
  }
};

export const getMonthly = async (req, res) => {
  try {
    const monthly = await Expense.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: {
            year: { $year: { $dateFromString: { dateString: "$date" } } },
            month: { $month: { $dateFromString: { dateString: "$date" } } }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    res.status(200).json({
      success: true,
      monthly: monthly.map(m => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        total: m.total,
        count: m.count
      }))
    });

  } catch (err) {
    console.log("Error in monthly:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to get monthly data",
      error: err.message
    });
  }
};