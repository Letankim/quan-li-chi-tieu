// ====== GOOGLE APPS SCRIPT CODE ======
// Deploy as Web App: Execute as "Me", Who has access: "Anyone"
// Sau khi deploy, copy URL và thêm vào biến môi trường NEXT_PUBLIC_GAS_URL

const CATEGORIES = ['Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 'Hóa đơn', 'Y tế', 'Khác'];

function doGet(e) {
  const action = e.parameter.action || 'getAllData';
  const month = e.parameter.month;
  const compareMonth = e.parameter.compareMonth;
  
  let result;
  switch(action) {
    case 'getAllData':
      result = getAllData(month);
      break;
    case 'getDashboardData':
      result = getDashboardData(month);
      break;
    case 'getComparisonData':
      result = getComparisonData(month, compareMonth);
      break;
    case 'getBudgets':
      result = getBudgets();
      break;
    default:
      result = { error: 'Unknown action' };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  let result;
  switch(action) {
    case 'addExpense':
      result = addExpense(data.expense);
      break;
    case 'updateExpense':
      result = updateExpense(data.id, data.expense);
      break;
    case 'deleteExpense':
      result = deleteExpense(data.id);
      break;
    case 'setBudgets':
      result = setBudgets(data.budgets);
      break;
    default:
      result = { error: 'Unknown action' };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

const expensesSheet = () => getSheet('Expenses', ['Ngày', 'Danh Mục', 'Số Tiền', 'Mô Tả', 'ID']);
const budgetsSheet = () => {
  const sheet = getSheet('Budgets', ['Danh Mục', 'Ngân Sách Tháng']);
  if (sheet.getLastRow() === 1) CATEGORIES.forEach(cat => sheet.appendRow([cat, 0]));
  return sheet;
};

function getExpenses() {
  const sheet = expensesSheet();
  if (sheet.getLastRow() <= 1) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  return values.map((row, i) => ({
    id: row[4] || (sheet.getLastRow() + i),
    date: row[0] instanceof Date ? row[0].toISOString() : new Date(row[0]).toISOString(),
    category: row[1],
    amount: Number(row[2]) || 0,
    description: row[3] ? row[3].toString() : ''
  })).reverse();
}

function getBudgets() {
  const sheet = budgetsSheet();
  const values = sheet.getDataRange().getValues();
  const budgets = {};
  for (let i = 1; i < values.length; i++) budgets[values[i][0]] = Number(values[i][1]) || 0;
  return budgets;
}

function setBudgets(obj) {
  const sheet = budgetsSheet();
  const values = sheet.getDataRange().getValues();
  Object.keys(obj).forEach(cat => {
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === cat) {
        sheet.getRange(i + 1, 2).setValue(obj[cat]);
        break;
      }
    }
  });
  return { success: true, budgets: getBudgets() };
}

function calculateMonthSummary(yearMonth) {
  const expenses = getExpenses();
  const budgets = getBudgets();
  const summary = {};
  CATEGORIES.forEach(cat => summary[cat] = { spent: 0, budget: budgets[cat] || 0, percentage: 0, status: 'safe' });

  expenses.forEach(exp => {
    const m = Utilities.formatDate(new Date(exp.date), Session.getScriptTimeZone(), 'yyyy-MM');
    if (m === yearMonth) summary[exp.category].spent += exp.amount;
  });

  let total = 0;
  CATEGORIES.forEach(cat => {
    const s = summary[cat];
    total += s.spent;
    if (s.budget > 0) {
      s.percentage = Math.round(Math.min(100, (s.spent / s.budget) * 100));
      if (s.spent > s.budget) s.status = 'over';
      else if (s.percentage >= 80) s.status = 'warning';
    } else s.status = 'no-budget';
  });

  return { summary, monthlyTotal: total, pieData: { labels: [...CATEGORIES], data: CATEGORIES.map(c => summary[c].spent) } };
}

function getCurrentMonth() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
}

function getDashboardData(month) {
  return calculateMonthSummary(month || getCurrentMonth());
}

function getComparisonData(mainMonth, compareMonth) {
  const main = calculateMonthSummary(mainMonth || getCurrentMonth());
  const compare = calculateMonthSummary(compareMonth);
  const diff = {};
  let totalDiff = 0;
  CATEGORIES.forEach(cat => {
    const mainSpent = main.summary[cat].spent;
    const compareSpent = compare.summary[cat].spent;
    const change = mainSpent - compareSpent;
    const percentChange = compareSpent > 0 ? Math.round((change / compareSpent) * 100) : (change > 0 ? 100 : change < 0 ? -100 : 0);
    diff[cat] = { main: mainSpent, compare: compareSpent, change, percentChange, trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same' };
    totalDiff += change;
  });
  return { mainData: main, compareData: compare, diff, totalDiff, mainMonth, compareMonth };
}

function getAllData(selectedMonth) {
  const month = selectedMonth || getCurrentMonth();
  return {
    dashboard: calculateMonthSummary(month),
    expenses: getExpenses(),
    budgets: getBudgets(),
    currentMonth: getCurrentMonth(),
    selectedMonth: month
  };
}

function addExpense(expense) {
  const sheet = expensesSheet();
  const row = sheet.getLastRow() + 1;
  sheet.appendRow([new Date(), expense.category, Number(expense.amount), expense.description || '', row]);
  const dash = getDashboardData();
  let warning = '';
  const s = dash.summary[expense.category] || { spent: 0, budget: 0, percentage: 0 };
  if (s.budget > 0) {
    if (s.spent > s.budget) warning = `Vượt ngân sách ${expense.category}!`;
    else if (s.percentage >= 80) warning = `Sắp vượt ngân sách ${expense.category}!`;
  }
  return { dashboard: dash, expenses: getExpenses(), warning };
}

function updateExpense(id, expense) {
  const sheet = expensesSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][4] == id) {
      sheet.getRange(i + 1, 1, 1, 4).setValues([[new Date(), expense.category, Number(expense.amount), expense.description || '']]);
      break;
    }
  }
  return { dashboard: getDashboardData(), expenses: getExpenses() };
}

function deleteExpense(id) {
  const sheet = expensesSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][4] == id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { dashboard: getDashboardData(), expenses: getExpenses() };
}
