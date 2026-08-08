/* FinanceFlow — Expense Tracker
   Single-file application script.
   Sections: Utilities → Storage → Analytics → Charts → App
*/

/* ===================== utils ===================== */
/* Shared helpers: formatting, category metadata, DOM utilities. */

const CATEGORY_META = {
  Food: { icon: "fa-utensils", color: "#ef4444" },
  Travel: { icon: "fa-plane", color: "#3b82f6" },
  Shopping: { icon: "fa-bag-shopping", color: "#8b5cf6" },
  Entertainment: { icon: "fa-film", color: "#ec4899" },
  Bills: { icon: "fa-file-invoice-dollar", color: "#f59e0b" },
  Healthcare: { icon: "fa-heart-pulse", color: "#10b981" },
  Education: { icon: "fa-graduation-cap", color: "#6366f1" },
  Salary: { icon: "fa-money-bill-wave", color: "#16a34a" },
  Investment: { icon: "fa-chart-line", color: "#0ea5e9" },
  Others: { icon: "fa-ellipsis-h", color: "#64748b" },
};

const PAYMENT_METHODS = ["Cash", "UPI", "Money", "Credit Card", "Online Banking", "Debit Card"];

/* --- DOM shortcuts (remove repeated getElementById noise) --- */
const $ = (id) => document.getElementById(id);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const on = (id, event, handler) => {
  const element = $(id);
  if (element) element.addEventListener(event, handler);
};

/* --- Formatting --- */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitialDate() {
  return new Date().toISOString().split("T")[0];
}

/* --- Safety --- */
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

/* --- Notifications --- */
function showToast(message, variant = "success") {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${variant}`;
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.className = "toast";
  }, 2400);
}

/* --- Category helpers --- */
function getCategoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.Others;
}

function createCategoryOptions() {
  const categories = Object.keys(CATEGORY_META);
  const options = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
  const select = $("category");
  const filter = $("categoryFilter");
  if (select) select.innerHTML = options;
  if (filter) filter.innerHTML = `<option value="all">All Categories</option>${options}`;
}

function buildCategoryBadge(category, type) {
  const meta = getCategoryMeta(category);
  return `<span class="badge ${type}"><i class="fa-solid ${meta.icon}"></i>${escapeHtml(category)}</span>`;
}

function getTransactionTypeClass(type) {
  return type === "income" ? "income" : "expense";
}

/* --- Animated counters --- */
function animateCounter(elementId, target, formatter) {
  const element = $(elementId);
  if (!element) return;
  const startValue = Number(element.dataset.value || 0);
  const startTime = performance.now();
  const duration = 650;

  const tick = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = startValue + (target - startValue) * eased;
    element.textContent = formatter(value);
    element.dataset.value = value;
    if (progress < 1) requestAnimationFrame(tick);
    else element.dataset.value = target;
  };

  requestAnimationFrame(tick);
}

/* ===================== storage ===================== */
/* Local Storage persistence layer — the only place that touches localStorage data. */

const STORAGE_KEY = "financeflow-transactions";
const THEME_KEY = "financeflow-theme";

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
}

function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
  return transactions;
}

function addTransaction(transaction) {
  const transactions = loadTransactions();
  transactions.unshift(transaction);
  return saveTransactions(transactions);
}

function updateTransaction(id, next) {
  const transactions = loadTransactions().map((item) =>
    item.id === id ? { ...item, ...next } : item,
  );
  return saveTransactions(transactions);
}

function deleteTransaction(id) {
  return saveTransactions(loadTransactions().filter((item) => item.id !== id));
}

function clearAllTransactions() {
  return saveTransactions([]);
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "light";
  } catch {
    return "light";
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error("Failed to save theme", error);
  }
}

/* ===================== analytics ===================== */
/* Pure analytics calculations — no DOM access. */

function calculateAnalytics(transactions) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const incomes = transactions.filter((item) => item.type === "income");
  const sum = (list) => list.reduce((total, item) => total + Number(item.amount || 0), 0);

  const totalIncome = sum(incomes);
  const totalExpenses = sum(expenses);
  const totalBalance = totalIncome - totalExpenses;
  const savings = totalBalance;
  const transactionsCount = transactions.length;

  const highestExpense =
    [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0] || null;
  const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;

  const categorySpend = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount || 0);
    return acc;
  }, {});
  const highestSpendingCategory =
    Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const sortedByDate = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const monthlyTotals = sortedByDate.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleString("en-IN", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + Number(item.amount || 0) * (item.type === "expense" ? 1 : 0);
    return acc;
  }, {});

  const uniqueDays = [...new Set(expenses.map((item) => item.date))].sort();
  const averageDailySpending = uniqueDays.length ? totalExpenses / uniqueDays.length : 0;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .slice(0, 7);
  const monthlySpending = sum(expenses.filter((item) => String(item.date).startsWith(currentMonth)));
  const previousMonthSpending = sum(
    expenses.filter((item) => String(item.date).startsWith(previousMonth)),
  );
  const averageTransactionAmount = transactionsCount
    ? (totalExpenses + totalIncome) / transactionsCount
    : 0;

  const weeklySpending = sum(
    expenses.filter((item) => {
      const diff = (Date.now() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }),
  );

  const paymentMethods = transactions.reduce((acc, item) => {
    acc[item.paymentMethod] = (acc[item.paymentMethod] || 0) + 1;
    return acc;
  }, {});
  const mostUsedPaymentMethod =
    Object.entries(paymentMethods).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const monthlyValues = Object.values(monthlyTotals).filter(Boolean);
  const forecast =
    monthlyValues.length >= 3
      ? monthlyValues.slice(-3).reduce((total, value) => total + value, 0) / 3
      : monthlyValues.length
        ? monthlyValues[monthlyValues.length - 1]
        : 0;

  return {
    totalIncome,
    totalExpenses,
    totalBalance,
    savings,
    transactionsCount,
    highestExpense,
    averageExpense,
    highestSpendingCategory,
    averageDailySpending,
    monthlySpending,
    previousMonthSpending,
    averageTransactionAmount,
    weeklySpending,
    mostUsedPaymentMethod,
    forecast,
    categorySpend,
    monthlyTotals,
  };
}

/* ===================== charts ===================== */
/* Chart.js rendering — theme aware, one chart registry to avoid duplicate code. */

const chartRegistry = {};

const CHART_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
  "#0ea5e9",
  "#64748b",
];

function chartTheme() {
  const dark = document.body.classList.contains("dark");
  return {
    text: dark ? "#cbd5e1" : "#475569",
    grid: dark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.07)",
  };
}

function baseOptions(extra = {}) {
  const theme = chartTheme();
  return {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 600 },
    plugins: {
      legend: { position: "bottom", labels: { color: theme.text, boxWidth: 12, padding: 14 } },
      ...(extra.plugins || {}),
    },
    ...(extra.scales
      ? {
          scales: {
            x: { ticks: { color: theme.text }, grid: { color: theme.grid } },
            y: { beginAtZero: true, ticks: { color: theme.text }, grid: { color: theme.grid } },
          },
        }
      : {}),
  };
}

function upsertChart(key, canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;
  if (chartRegistry[key]) chartRegistry[key].destroy();
  chartRegistry[key] = new Chart(canvas, config);
}

function renderChartsFromAnalytics(transactions, analytics) {
  const expenseData = transactions
    .filter((item) => item.type === "expense")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  upsertChart("category", "categoryChart", {
    type: "pie",
    data: {
      labels: Object.keys(analytics.categorySpend),
      datasets: [
        {
          data: Object.values(analytics.categorySpend),
          backgroundColor: CHART_PALETTE,
          borderWidth: 0,
        },
      ],
    },
    options: baseOptions({ plugins: { title: { display: true, text: "Spending by Category", color: chartTheme().text } } }),
  });

  const monthEntries = Object.entries(analytics.monthlyTotals).slice(-6);
  upsertChart("monthly", "monthlyChart", {
    type: "bar",
    data: {
      labels: monthEntries.map(([month]) => month),
      datasets: [
        {
          label: "Monthly Expenses",
          data: monthEntries.map(([, value]) => value),
          backgroundColor: "#2563eb",
          borderRadius: 8,
        },
      ],
    },
    options: baseOptions({ scales: true }),
  });

  upsertChart("trend", "trendChart", {
    type: "line",
    data: {
      labels: expenseData.map((item) => item.date),
      datasets: [
        {
          label: "Expense Trend",
          data: expenseData.map((item) => Number(item.amount)),
          borderColor: "#dc2626",
          backgroundColor: "rgba(220,38,38,0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: baseOptions({ scales: true }),
  });

  upsertChart("incomeExpense", "incomeExpenseChart", {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [analytics.totalIncome, analytics.totalExpenses],
          backgroundColor: ["#16a34a", "#dc2626"],
          borderWidth: 0,
        },
      ],
    },
    options: baseOptions(),
  });
}

/* ===================== app ===================== */
/* Application controller: state, events, rendering. */

const state = {
  transactions: [],
  editingId: null,
  filters: { search: "", category: "all", date: "", sort: "date-desc" },
};

let pendingConfirm = null;

/* ------------------------------------------------------------------ init */
function init() {
  applyTheme();
  createCategoryOptions();

  state.transactions = loadTransactions();
  if (!state.transactions.length) {
    state.transactions = saveTransactions(seedSampleTransactions());
  }

  bindEvents();
  resetForm();
  render();

  setTimeout(() => $("loadingOverlay")?.classList.add("hidden"), 650);
}

function seedSampleTransactions() {
  const today = new Date();
  const iso = (offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    return date.toISOString().split("T")[0];
  };

  const sample = [
    ["Salary", "Monthly paycheck", 65000, "income", "Salary", "UPI", 0, "Monthly income"],
    ["Groceries", "Weekly department store", 4200, "expense", "Food", "Debit Card", 1, "House supplies"],
    ["Train Pass", "Commuter travel", 1800, "expense", "Travel", "UPI", 3, "Monthly pass"],
    ["Streaming Subscription", "Entertainment bundle", 899, "expense", "Entertainment", "Credit Card", 5, "Family account"],
    ["Electricity Bill", "Utility payment", 3200, "expense", "Bills", "Cash", 6, "Due this week"],
    ["Mutual Funds", "Monthly SIP", 7000, "expense", "Investment", "UPI", 8, "Long-term plan"],
  ];

  return sample.map(([title, description, amount, type, category, paymentMethod, offset, notes]) => ({
    id: crypto.randomUUID(),
    title,
    description,
    amount,
    type,
    category,
    paymentMethod,
    date: iso(offset),
    notes,
  }));
}

/* ---------------------------------------------------------------- events */
function bindEvents() {
  const form = $("expenseForm");
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("input", validateForm);
  form.addEventListener("change", validateForm);

  on("cancelEditBtn", "click", resetForm);

  const bindFilter = (id, key, event = "change") =>
    on(id, event, (e) => {
      state.filters[key] = e.target.value;
      renderTable();
    });

  bindFilter("searchInput", "search", "input");
  bindFilter("categoryFilter", "category");
  bindFilter("dateFilter", "date");
  bindFilter("sortSelect", "sort");

  on("themeToggle", "click", toggleTheme);
  on("menuToggle", "click", () => $("sidebar").classList.toggle("open"));
  on("clearDataBtn", "click", requestClearAll);
  on("printReportBtn", "click", printReport);
  on("downloadPdfBtn", "click", downloadPdf);
  on("exportCsvBtn", "click", exportCsv);

  on("closeModalBtn", "click", () => closeModal("detailModal"));
  on("detailModal", "click", (e) => {
    if (e.target.id === "detailModal") closeModal("detailModal");
  });
  on("confirmCancelBtn", "click", () => closeModal("confirmModal"));
  on("confirmModal", "click", (e) => {
    if (e.target.id === "confirmModal") closeModal("confirmModal");
  });
  on("confirmOkBtn", "click", () => {
    const action = pendingConfirm;
    closeModal("confirmModal");
    if (typeof action === "function") action();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal("detailModal");
    closeModal("confirmModal");
  });

  $$(".nav-link").forEach((link) =>
    link.addEventListener("click", () => {
      $$(".nav-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      $("sidebar").classList.remove("open");
    }),
  );
}

/* ------------------------------------------------------------ validation */
function readForm() {
  return {
    title: $("title").value.trim(),
    description: $("description").value.trim(),
    amount: $("amount").value,
    type: $("type").value,
    category: $("category").value,
    paymentMethod: $("paymentMethod").value,
    date: $("date").value,
    notes: $("notes").value.trim(),
  };
}

function getValidationErrors(values) {
  const errors = {};
  if (!values.title) errors.title = "Title is required.";
  else if (values.title.length > 60) errors.title = "Title must be under 60 characters.";

  const amount = Number(values.amount);
  if (values.amount === "") errors.amount = "Amount is required.";
  else if (Number.isNaN(amount)) errors.amount = "Amount must be a number.";
  else if (amount <= 0) errors.amount = "Amount must be greater than zero.";
  else if (amount > 100000000) errors.amount = "Amount is unrealistically large.";

  if (!values.paymentMethod) errors.paymentMethod = "Select a payment method.";

  if (!values.date) errors.date = "Date is required.";
  else if (new Date(values.date) > new Date()) errors.date = "Date cannot be in the future.";

  return errors;
}

function validateForm() {
  const values = readForm();
  const errors = getValidationErrors(values);

  ["title", "amount", "paymentMethod", "date"].forEach((field) => {
    const input = $(field);
    const message = errors[field] || "";
    const hint = document.querySelector(`[data-error-for="${field}"]`);
    const touched = input.dataset.touched === "true" || input.value !== "";
    if (hint) hint.textContent = touched ? message : "";
    input.classList.toggle("invalid", Boolean(message) && touched);
    input.dataset.touched = String(touched);
  });

  const valid = Object.keys(errors).length === 0;
  $("submitBtn").disabled = !valid;
  return valid;
}

/* ---------------------------------------------------------------- submit */
function handleSubmit(event) {
  event.preventDefault();
  const message = $("formMessage");
  const values = readForm();
  const errors = getValidationErrors(values);

  if (Object.keys(errors).length) {
    validateForm();
    message.className = "form-message error";
    message.textContent = Object.values(errors)[0];
    showToast(Object.values(errors)[0], "error");
    return;
  }

  const transaction = {
    ...values,
    id: state.editingId || crypto.randomUUID(),
    amount: Number(values.amount),
  };

  if (state.editingId) {
    state.transactions = updateTransaction(state.editingId, transaction);
    showToast("Transaction updated successfully.");
  } else {
    state.transactions = addTransaction(transaction);
    showToast("Transaction added successfully.");
  }

  resetForm();
  message.className = "form-message success";
  message.textContent = "Saved to your browser storage.";
  render();
}

function resetForm() {
  const form = $("expenseForm");
  form.reset();
  $("transactionId").value = "";
  $("formTitle").textContent = "Add a new expense";
  $("cancelEditBtn").classList.add("hidden");
  $("formMessage").textContent = "";
  $("formMessage").className = "form-message";
  state.editingId = null;
  $("date").value = getInitialDate();
  ["title", "amount", "paymentMethod", "date"].forEach((field) => {
    $(field).dataset.touched = "false";
    $(field).classList.remove("invalid");
    const hint = document.querySelector(`[data-error-for="${field}"]`);
    if (hint) hint.textContent = "";
  });
  validateForm();
}

/* ---------------------------------------------------------------- render */
function render() {
  const analytics = calculateAnalytics(state.transactions);
  renderStats(analytics);
  renderTable();
  renderInsights(analytics);
  renderChartsFromAnalytics(state.transactions, analytics);
}

function renderStats(analytics) {
  animateCounter("totalExpenses", analytics.totalExpenses, formatCurrency);
  animateCounter("transactionsCount", analytics.transactionsCount, (v) => Math.round(v).toString());
  animateCounter("highestExpenseAmount", analytics.highestExpense?.amount || 0, formatCurrency);
  animateCounter("averageExpense", analytics.averageExpense, formatCurrency);
  animateCounter("totalIncome", analytics.totalIncome, formatCurrency);
  animateCounter("savingsAmount", analytics.savings, formatCurrency);
  animateCounter("totalBalance", analytics.totalBalance, formatCurrency);
  $("heroBalance").textContent = formatCurrency(analytics.totalBalance);
}

function renderTable() {
  const filtered = getFilteredTransactions();
  const tbody = $("transactionTableBody");

  if (!filtered.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No transactions found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((item) => {
      const meta = getCategoryMeta(item.category);
      const typeClass = getTransactionTypeClass(item.type);
      return `
      <tr>
        <td><span class="icon-pill" style="background:${meta.color}"><i class="fa-solid ${meta.icon}"></i></span></td>
        <td>
          <strong>${escapeHtml(item.title)}</strong><br />
          <small>${escapeHtml(item.description || "No description")}</small>
        </td>
        <td class="${typeClass}">${item.type === "income" ? "+" : "−"} ${formatCurrency(item.amount)}</td>
        <td>${buildCategoryBadge(item.category, typeClass)}</td>
        <td>${escapeHtml(item.paymentMethod || "—")}</td>
        <td>${formatDate(item.date)}</td>
        <td>
          <div class="actions-cell">
            <button class="action-btn" type="button" data-action="view" data-id="${item.id}" aria-label="View"><i class="fa-solid fa-eye"></i></button>
            <button class="action-btn" type="button" data-action="edit" data-id="${item.id}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn" type="button" data-action="delete" data-id="${item.id}" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  $$(".action-btn", tbody).forEach((btn) => btn.addEventListener("click", handleTableAction));
}

function getFilteredTransactions() {
  const { search, category, date, sort } = state.filters;
  let data = [...state.transactions];

  if (search) {
    const term = search.toLowerCase();
    data = data.filter((item) =>
      [item.title, item.description, item.category, item.paymentMethod, item.notes]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }
  if (category !== "all") data = data.filter((item) => item.category === category);
  if (date) data = data.filter((item) => item.date === date);

  const sorters = {
    "amount-asc": (a, b) => Number(a.amount) - Number(b.amount),
    "amount-desc": (a, b) => Number(b.amount) - Number(a.amount),
    "date-asc": (a, b) => new Date(a.date) - new Date(b.date),
    "date-desc": (a, b) => new Date(b.date) - new Date(a.date),
  };
  return data.sort(sorters[sort] || sorters["date-desc"]);
}

function renderInsights(analytics) {
  const topExpenses = state.transactions
    .filter((item) => item.type === "expense")
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  $("highestCategory").textContent = analytics.highestSpendingCategory;
  $("largestExpense").textContent = analytics.highestExpense
    ? `${analytics.highestExpense.title} (${formatCurrency(analytics.highestExpense.amount)})`
    : "—";
  $("topExpensesList").innerHTML =
    topExpenses
      .map((item) => `<li>${escapeHtml(item.title)} — ${formatCurrency(item.amount)}</li>`)
      .join("") || "<li>No expenses yet</li>";
  $("monthlyComparison").textContent = `${formatCurrency(analytics.monthlySpending)} this month vs ${formatCurrency(analytics.previousMonthSpending)} last month`;
  $("weeklySpending").textContent = formatCurrency(analytics.weeklySpending);
  $("averageDailySpending").textContent = formatCurrency(analytics.averageDailySpending);
  $("averageAmount").textContent = formatCurrency(analytics.averageTransactionAmount);
  $("mostUsedPaymentMethod").textContent = analytics.mostUsedPaymentMethod;
  $("forecast").textContent = formatCurrency(analytics.forecast);
}

/* --------------------------------------------------------- table actions */
function handleTableAction(event) {
  const button = event.currentTarget;
  const id = button.dataset.id;
  const action = button.dataset.action;
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;

  if (action === "delete") return requestDelete(transaction);
  if (action === "view") return openTransactionModal(transaction);
  startEditing(transaction);
}

function startEditing(transaction) {
  state.editingId = transaction.id;
  $("transactionId").value = transaction.id;
  $("title").value = transaction.title;
  $("description").value = transaction.description || "";
  $("amount").value = transaction.amount;
  $("type").value = transaction.type;
  $("category").value = transaction.category;
  $("paymentMethod").value = transaction.paymentMethod || "";
  $("date").value = transaction.date;
  $("notes").value = transaction.notes || "";
  $("formTitle").textContent = "Edit transaction";
  $("cancelEditBtn").classList.remove("hidden");
  validateForm();
  $("title").focus();
  $("expenseForm").scrollIntoView({ behavior: "smooth", block: "center" });
}

/* --------------------------------------------------------------- modals */
function openModal(id) {
  const modal = $(id);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function askConfirmation({ title, message, confirmLabel, onConfirm }) {
  $("confirmTitle").textContent = title;
  $("confirmMessage").textContent = message;
  $("confirmOkBtn").innerHTML = `<i class="fa-solid fa-trash"></i> ${confirmLabel}`;
  pendingConfirm = onConfirm;
  openModal("confirmModal");
}

function requestDelete(transaction) {
  askConfirmation({
    title: "Delete transaction?",
    message: `"${transaction.title}" (${formatCurrency(transaction.amount)}) will be permanently removed.`,
    confirmLabel: "Delete",
    onConfirm: () => {
      state.transactions = deleteTransaction(transaction.id);
      if (state.editingId === transaction.id) resetForm();
      showToast("Transaction deleted.");
      render();
    },
  });
}

function requestClearAll() {
  if (!state.transactions.length) return showToast("There is nothing to clear.", "error");
  askConfirmation({
    title: "Clear all transactions?",
    message: "Every transaction stored in this browser will be deleted. This cannot be undone.",
    confirmLabel: "Clear All",
    onConfirm: () => {
      state.transactions = clearAllTransactions();
      resetForm();
      showToast("All transactions cleared.");
      render();
    },
  });
}

function openTransactionModal(transaction) {
  $("modalTitle").textContent = transaction.title;
  $("modalBody").innerHTML = [
    ["Amount", formatCurrency(transaction.amount)],
    ["Type", transaction.type === "income" ? "Income" : "Expense"],
    ["Category", transaction.category],
    ["Payment", transaction.paymentMethod || "—"],
    ["Date", formatDate(transaction.date)],
    ["Description", transaction.description || "No description"],
    ["Notes", transaction.notes || "No notes"],
  ]
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
    .join("");
  openModal("detailModal");
}

/* --------------------------------------------------------------- export */
function buildReportRows() {
  return getFilteredTransactions()
    .map(
      (item) =>
        `<tr><td>${formatDate(item.date)}</td><td>${escapeHtml(item.title)}</td><td>${item.type}</td><td>${formatCurrency(item.amount)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.paymentMethod || "—")}</td></tr>`,
    )
    .join("");
}

function openReportWindow(autoPrint) {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return showToast("Allow pop-ups to generate the report.", "error");

  reportWindow.document.write(`<!DOCTYPE html><html><head><title>FinanceFlow Report</title>
    <style>
      body{font-family:'Plus Jakarta Sans',Arial,sans-serif;padding:32px;color:#0f172a}
      h1{margin:0 0 4px}
      p{color:#64748b;margin:0 0 22px}
      table{width:100%;border-collapse:collapse;font-size:14px}
      th{text-align:left;background:#eff6ff;color:#2563eb;padding:10px}
      td{padding:10px;border-bottom:1px solid #e2e8f0}
      tr:nth-child(even) td{background:#f8fafc}
    </style></head><body>
    <h1>FinanceFlow Expense Report</h1>
    <p>Generated ${new Date().toLocaleDateString("en-IN")}</p>
    <table><thead><tr><th>Date</th><th>Title</th><th>Type</th><th>Amount</th><th>Category</th><th>Payment</th></tr></thead>
    <tbody>${buildReportRows()}</tbody></table></body></html>`);
  reportWindow.document.close();
  reportWindow.focus();
  if (autoPrint) {
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 500);
  }
}

function printReport() {
  openReportWindow(true);
  showToast("Print report ready.");
}

function downloadPdf() {
  openReportWindow(true);
  showToast("PDF report ready — choose 'Save as PDF'.");
}

function exportCsv() {
  if (!state.transactions.length) return showToast("Nothing to export yet.", "error");

  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const header = ["date", "title", "type", "amount", "category", "paymentMethod", "description", "notes"];
  const rows = state.transactions.map((item) =>
    header.map((key) => escapeCell(item[key])).join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `financeflow-expenses-${getInitialDate()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("CSV exported.");
}

/* ---------------------------------------------------------------- theme */
function setThemeIcon() {
  const icon = document.querySelector("#themeToggle i");
  if (icon) {
    icon.className = document.body.classList.contains("dark")
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  }
}

function applyTheme() {
  document.body.classList.toggle("dark", loadTheme() === "dark");
  setThemeIcon();
}

function toggleTheme() {
  const dark = document.body.classList.toggle("dark");
  saveTheme(dark ? "dark" : "light");
  setThemeIcon();
  render();
}

window.addEventListener("DOMContentLoaded", init);

