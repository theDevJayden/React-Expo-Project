# Product Requirements Document (PRD): Friendly

**Document Version:** 1.2  
**Target Release:** MVP v1.0  
**Tech Stack:** React Native (Expo), NativeWind (Tailwind CSS for Mobile), React Native Gifted Charts / SVG, Lucide React Native Icons  

---

## 1. Executive Summary

**Friendly** is a streamlined personal finance mobile application built with **React Native (Expo)** and **NativeWind**. It gives users immediate visibility into their monthly cash flow, category spending habits, custom budget limits, and personal debt obligations without bank sync requirements or unnecessary operational clutter.

---

## 2. Target Persona & Core Objectives

* **Target User:** Individuals seeking a clean, secure, and responsive mobile application to track daily income, expenses, budget thresholds, and debt payoff deadlines on their mobile devices.
* **Core Objectives:**
  * Track monthly income, expenses, and net monthly savings in real-time.
  * Provide dynamic visual feedback on spending breakdowns and budget usage on mobile screens.
  * Allow complete flexibility through custom category creation.
  * Monitor active personal debts and payment deadlines.

---

## 3. Technology Stack Definitions & Mobile Equivalents

* **React Native + Expo:** The framework used to build cross-platform mobile apps (iOS and Android) using React.
* **NativeWind:** A library that allows you to write standard Tailwind CSS classes directly inside React Native `StyleSheet` components (`className="p-4 bg-slate-900"`).
* **Charts (`react-native-gifted-charts` or `react-native-svg`):** Replaces web-based chart libraries like *Recharts* or *Chart.js*, allowing custom pie/donut chart rendering optimized for mobile touchscreens.
* **Icons (`lucide-react-native`):** Mobile-optimized SVG icons for crisp UI visuals.

---

## 4. Detailed Feature Specifications

### Feature 1: Overview Dashboard (Monthly Cash Flow)
* **Description:** A primary metric panel displaying dynamic high-level monthly totals derived from user transactions for the active calendar month.
* **Requirements:**
  * **Monthly Income:** Sum of all transactions categorized as `income` within the current calendar month.
  * **Monthly Expense:** Sum of all transactions categorized as `expense` within the current calendar month.
  * **Monthly Savings:** Calculated dynamically as $\text{Monthly Savings} = \text{Monthly Income} - \text{Monthly Expense}$.
  * **Visual Styling:** Prominent mobile card layout using NativeWind with contextual status indicators (Green for savings/income, Red for expenses).

---

### Feature 2: Fast Expense & Income Tracker (With Custom Categories)
* **Description:** A mobile-friendly bottom sheet or modal form and list view for recording and managing financial entries.
* **Form Inputs (4 Primary Fields):**
  1. **Amount:** Positive numeric value ($) with numeric keyboard input.
  2. **Title:** Short description string (e.g., "Grocery Run").
  3. **Date:** Native date picker modal (`YYYY-MM-DD`).
  4. **Category:** Single-select picker populated with system defaults and custom user categories.
* **Default Preset Categories:**
  * *Housing Bills*
  * *Medical*
  * *Food & Beverages*  
  * *Transport*
  * *Leisure*
  * *Shopping*
* **Custom Category Creation Engine:**
  * A permanent **"+ Add Custom Category"** option at the bottom of the category selector.
  * Selecting this triggers a native modal requiring:
    * **Category Name:** String (e.g., "Pets", "Gym").
    * **Category Color:** Color selector for chart rendering.
  * Newly created categories immediately persist to state and Async Storage.
* **Transaction List Requirements:**
  * Chronological sorting (newest first) using React Native `FlatList`.
  * Filter/search bar by Title or Category.
  * Swipe-to-delete or tap-to-delete action per transaction item.

---

### Feature 3: Category Breakdown Visualizer
* **Description:** Graphical summary of current month expenses grouped by category optimized for mobile layouts.
* **Requirements:**
  * **Chart Type:** Interactive Donut or Pie chart rendered via `react-native-gifted-charts`.
  * **Data Mapping:** Aggregates all current-month transactions of type `expense` across default and custom categories.
  * **Legend & Interactions:** Tap state displaying raw spending ($) and percentage (%) breakdown per category.

---

### Feature 4: Budget Pie Chart
* **Description:** A manual budget cap set by the user to track monthly burn rate.
* **Requirements:**
  * **User Input:** Editable numeric field for total Monthly Budget Cap (e.g., $2,500).
  * **Calculations:**
    * $\text{Spending Percentage} = \left(\frac{\text{Monthly Expense}}{\text{Budget Cap}}\right) \times 100$
    * $\text{Remaining Capacity} = \text{Budget Cap} - \text{Monthly Expense}$
  * **Progress Bar Feedback:**
    * **Green Pie Chart:** $\le 75\%$ of budget used.
    * **Yellow Pie Chart:** $76\% - 99\%$ of budget used.
    * **Red Pie Chart:** $\ge 100\%$ of budget used (Displays "Over Budget by $X" warning).

---

### Feature 5: Debt Tracker
* **Description:** A module to track personal liabilities, loans, and credit card balances.
* **Form Inputs:**
  * **Debt Name:** String (e.g., "Car Loan", "Student Credit").
  * **Total Amount Owed:** Numeric value ($).
  * **Deadline:** Target repayment date (`YYYY-MM-DD`).
* **Display Requirements:**
  * Card-based list displaying total debt load, individual item deadlines, and days remaining until due date.
  * Action toggle to mark debt as "Paid Off" (strikes through and archives item).

---

## 5. Technical Architecture & Data Model

### Local State & Storage Structure (`AsyncStorage` / `Zustand`)

```json
{
  "userBudgetCap": 2500.00,
  "categories": [
    { "id": "cat-1", "name": "Housing Bills", "color": "#3B82F6", "isDefault": true },
    { "id": "cat-2", "name": "Medical", "color": "#EF4444", "isDefault": true },
    { "id": "cat-3", "name": "Food and Beverages", "color": "#10B981", "isDefault": true },
    { "id": "cat-4", "name": "Transport", "color": "#F59E0B", "isDefault": true },
    { "id": "cat-5", "name": "Leisure", "color": "#8B5CF6", "isDefault": true },
    { "id": "cat-6", "name": "Shopping", "color": "#EC4899", "isDefault": true },
    { "id": "cat-7", "name": "Pet Care", "color": "#14B8A6", "isDefault": false }
  ],
  "transactions": [
    {
      "id": "tx-001",
      "title": "Monthly Salary",
      "amount": 4000.00,
      "date": "2026-10-01",
      "category": "Income",
      "type": "income"
    },
    {
      "id": "tx-002",
      "title": "Apartment Rent",
      "amount": 950.00,
      "date": "2026-10-02",
      "category": "Housing Bills",
      "type": "expense"
    }
  ],
  "debts": [
    {
      "id": "debt-001",
      "title": "Credit Card Settlement",
      "totalOwed": 450.00,
      "deadline": "2026-11-15",
      "isPaid": false
    }
  ]
}
```

### Proposed Expo File Structure (Expo Router)

```text
app/
├── (tabs)/
│   ├── _layout.tsx               # Bottom Tab Bar Navigation
│   ├── index.tsx                 # Overview Dashboard & Budget Pie Chart
│   ├── transactions.tsx          # Fast Tracker & Transaction List
│   ├── analytics.tsx             # Category Breakdown Pie Chart
│   └── debts.tsx                 # Debt Tracker
├── modal/
│   ├── add-transaction.tsx       # Transaction Form Modal
│   └── add-category.tsx          # Custom Category Creator Modal
src/
├── components/
│   ├── SummaryCards.tsx          # Income, Expense, Savings Cards
│   ├── BudgetPieChart.tsx        # Donut Chart for Spent vs. Remaining Budget
│   ├── CategoryPieChart.tsx      # Donut Chart for Expense Categories
│   └── DebtCard.tsx              # Individual Debt Tracker Item
├── store/
│   └── useFinanceStore.ts        # Zustand store + AsyncStorage persistence
└── types/
    └── index.ts                  # TypeScript interface definitions
```

---

## 6. Execution Roadmap

1. **Phase 1: Expo Setup & Store** — Initialize Expo app with NativeWind and setup Zustand store with `@react-native-async-storage/async-storage`.
2. **Phase 2: Mobile Dashboard** — Build mobile UI for `SummaryCards` and `BudgetProgressBar`.
3. **Phase 3: Fast Tracker & Modals** — Build transaction list (`FlatList`), input modals, and dynamic category creation.
4. **Phase 4: Mobile Analytics & Debt Module** — Implement `react-native-gifted-charts` for category breakdown and debt management screens.