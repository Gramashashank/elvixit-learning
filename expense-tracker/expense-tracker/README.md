# FinanceFlow — Expense Tracker

A modern, **frontend-only** personal finance dashboard built with plain **HTML, CSS and JavaScript**.
No frameworks, no build step, no backend — all data lives in the browser's Local Storage.

## Project Overview

FinanceFlow lets you record income and expenses, explore them through a professional
dashboard, and understand your spending with live charts and insight cards.
The UI uses a clean white background, blue accents, glassmorphism cards, rounded
corners and soft shadows, and is fully responsive from mobile to desktop.

## Features

**Dashboard**
- Summary cards: Total Expenses, Total Transactions, Highest Expense, Average Expense
- Additional cards: Total Income, Savings, Total Balance
- Animated counters and a net-balance hero panel

**Transactions**
- Add, edit, view and delete transactions
- Alternating row colours, hover effects and category icons
- Search bar, category filter, date filter
- Sorting by date (newest/oldest) and amount (highest/lowest)

**Forms**
- Required-field validation with inline error messages
- Submit button stays disabled until the form is valid
- Success and error toast notifications

**Analytics**
- Category pie chart, monthly bar chart, expense trend line, income vs expense doughnut
- Insights: top categories, largest expense, top 5 expenses, monthly/weekly comparison,
  averages, most used payment method and next-month forecast

**Data & UX**
- Local Storage persistence (transactions + theme)
- Delete confirmation modal and Clear All
- Export to CSV, print report and PDF-style report
- Dark mode with theme persistence
- Loading overlay, smooth transitions and reduced-motion support

## Folder Structure

```
expense-tracker/
├── index.html          # Markup / page structure
├── css/
│   └── style.css       # Design system, layout, components, responsive rules
├── js/
│   └── script.js       # Utilities, storage, analytics, charts and app logic
└── README.md
```

`script.js` is organised into clearly labelled sections — Utilities, Storage,
Analytics, Charts and App — so each concern stays readable and duplication-free.

## Technologies Used

- HTML5 (semantic structure)
- CSS3 (custom properties, grid, flexbox, glassmorphism, media queries)
- JavaScript (ES2020, no framework)
- [Chart.js](https://www.chartjs.org/) for data visualisation
- Font Awesome for icons, Plus Jakarta Sans for typography
- Browser Local Storage for persistence

## How to Run

Open `index.html` directly in a browser, or serve the folder:

```bash
cd expense-tracker
python -m http.server 8000
```

Then visit http://localhost:8000

## Future Improvements

- Monthly budgets with progress bars and overspend alerts
- Recurring transactions and reminders
- Multi-currency support and configurable locale
- Import from CSV / bank statements
- Tags, attachments and receipt photos
- PWA offline install support
