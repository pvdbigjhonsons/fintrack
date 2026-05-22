package models

import "time"

// Account representa uma carteira/conta do usuário
type Account struct {
	ID        int64     `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Type      string    `json:"type" db:"type"` // checking, savings, cash, investment
	Balance   float64   `json:"balance" db:"balance"`
	Currency  string    `json:"currency" db:"currency"`
	Color     string    `json:"color" db:"color"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// Transaction representa uma receita ou despesa
type Transaction struct {
	ID          int64     `json:"id" db:"id"`
	AccountID   int64     `json:"account_id" db:"account_id"`
	AccountName string    `json:"account_name,omitempty"`
	Type        string    `json:"type" db:"type"` // income, expense
	Amount      float64   `json:"amount" db:"amount"`
	Category    string    `json:"category" db:"category"`
	Description string    `json:"description" db:"description"`
	Date        string    `json:"date" db:"date"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// Debt representa uma dívida (cartão, empréstimo, etc.)
type Debt struct {
	ID             int64     `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	Type           string    `json:"type" db:"type"` // credit_card, loan, financing, other
	TotalAmount    float64   `json:"total_amount" db:"total_amount"`
	PaidAmount     float64   `json:"paid_amount" db:"paid_amount"`
	RemainingAmount float64  `json:"remaining_amount" db:"remaining_amount"`
	Installments   int       `json:"installments" db:"installments"`
	PaidInstallments int     `json:"paid_installments" db:"paid_installments"`
	InterestRate   float64   `json:"interest_rate" db:"interest_rate"` // % ao mês
	DueDay         int       `json:"due_day" db:"due_day"`
	NextDueDate    string    `json:"next_due_date" db:"next_due_date"`
	Status         string    `json:"status" db:"status"` // active, paid, overdue
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

// --- Request DTOs ---

type CreateAccountRequest struct {
	Name     string  `json:"name" binding:"required"`
	Type     string  `json:"type" binding:"required"`
	Balance  float64 `json:"balance"`
	Currency string  `json:"currency"`
	Color    string  `json:"color"`
}

type CreateTransactionRequest struct {
	AccountID   int64   `json:"account_id" binding:"required"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description"`
	Date        string  `json:"date" binding:"required"`
}

type CreateDebtRequest struct {
	Name           string  `json:"name" binding:"required"`
	Type           string  `json:"type" binding:"required"`
	TotalAmount    float64 `json:"total_amount" binding:"required,gt=0"`
	PaidAmount     float64 `json:"paid_amount"`
	Installments   int     `json:"installments" binding:"required,gt=0"`
	PaidInstallments int   `json:"paid_installments"`
	InterestRate   float64 `json:"interest_rate"`
	DueDay         int     `json:"due_day" binding:"required"`
	NextDueDate    string  `json:"next_due_date"`
}

// --- Dashboard Response ---

type DashboardResponse struct {
	TotalBalance      float64              `json:"total_balance"`
	MonthlyIncome     float64              `json:"monthly_income"`
	MonthlyExpenses   float64              `json:"monthly_expenses"`
	TotalDebt         float64              `json:"total_debt"`
	ActiveDebts       int                  `json:"active_debts"`
	Accounts          []Account            `json:"accounts"`
	RecentTransactions []Transaction       `json:"recent_transactions"`
	ActiveDebtsList   []Debt               `json:"active_debts_list"`
	ExpensesByCategory []CategorySummary   `json:"expenses_by_category"`
	MonthlyEvolution  []MonthlyData        `json:"monthly_evolution"`
}

type CategorySummary struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Color    string  `json:"color"`
}

type MonthlyData struct {
	Month    string  `json:"month"`
	Income   float64 `json:"income"`
	Expenses float64 `json:"expenses"`
}
