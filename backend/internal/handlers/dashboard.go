package handlers

import (
	"net/http"
	"time"

	"github.com/fintrack/backend/internal/database"
	"github.com/fintrack/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetDashboard(c *gin.Context) {
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")
	monthEnd := time.Date(now.Year(), now.Month()+1, 0, 23, 59, 59, 0, time.Local).Format("2006-01-02")

	// Inicializa com slices vazios para nunca retornar null no JSON
	resp := models.DashboardResponse{
		Accounts:           make([]models.Account, 0),
		RecentTransactions: make([]models.Transaction, 0),
		ActiveDebtsList:    make([]models.Debt, 0),
		ExpensesByCategory: make([]models.CategorySummary, 0),
		MonthlyEvolution:   make([]models.MonthlyData, 0),
	}

	// 1. Saldo total e contas
	rows, err := database.DB.Query(`SELECT id, name, type, balance, currency, color, created_at, updated_at FROM accounts ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	for rows.Next() {
		var a models.Account
		if err := rows.Scan(&a.ID, &a.Name, &a.Type, &a.Balance, &a.Currency, &a.Color, &a.CreatedAt, &a.UpdatedAt); err != nil {
			continue
		}
		resp.Accounts = append(resp.Accounts, a)
		resp.TotalBalance += a.Balance
	}

	// 2. Receitas e despesas do mês
	database.DB.QueryRow(
		`SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='income' AND date BETWEEN ? AND ?`,
		monthStart, monthEnd,
	).Scan(&resp.MonthlyIncome)

	database.DB.QueryRow(
		`SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='expense' AND date BETWEEN ? AND ?`,
		monthStart, monthEnd,
	).Scan(&resp.MonthlyExpenses)

	// 3. Dívidas ativas
	database.DB.QueryRow(
		`SELECT COALESCE(SUM(remaining_amount),0), COUNT(*) FROM debts WHERE status='active'`,
	).Scan(&resp.TotalDebt, &resp.ActiveDebts)

	// 4. Últimas 8 transações
	txRows, err := database.DB.Query(`
		SELECT t.id, t.account_id, a.name, t.type, t.amount, t.category, t.description, t.date, t.created_at
		FROM transactions t
		JOIN accounts a ON a.id = t.account_id
		ORDER BY t.date DESC, t.created_at DESC
		LIMIT 8
	`)
	if err == nil {
		defer txRows.Close()
		for txRows.Next() {
			var tx models.Transaction
			txRows.Scan(&tx.ID, &tx.AccountID, &tx.AccountName, &tx.Type, &tx.Amount, &tx.Category, &tx.Description, &tx.Date, &tx.CreatedAt)
			resp.RecentTransactions = append(resp.RecentTransactions, tx)
		}
	}

	// 5. Dívidas ativas (lista)
	debtRows, err := database.DB.Query(`
		SELECT id, name, type, total_amount, paid_amount, remaining_amount, installments, paid_installments,
		       interest_rate, due_day, COALESCE(next_due_date,''), status, created_at, updated_at
		FROM debts WHERE status='active' ORDER BY next_due_date ASC
	`)
	if err == nil {
		defer debtRows.Close()
		for debtRows.Next() {
			var d models.Debt
			debtRows.Scan(&d.ID, &d.Name, &d.Type, &d.TotalAmount, &d.PaidAmount, &d.RemainingAmount,
				&d.Installments, &d.PaidInstallments, &d.InterestRate, &d.DueDay, &d.NextDueDate,
				&d.Status, &d.CreatedAt, &d.UpdatedAt)
			resp.ActiveDebtsList = append(resp.ActiveDebtsList, d)
		}
	}

	// 6. Gastos por categoria (mês atual)
	catColors := map[string]string{
		"Moradia": "#3B82F6", "Alimentação": "#10B981", "Transporte": "#F59E0B",
		"Saúde": "#EF4444", "Lazer": "#8B5CF6", "Educação": "#EC4899",
		"Assinaturas": "#14B8A6", "Outros": "#6B7280",
	}
	catRows, err := database.DB.Query(`
		SELECT category, SUM(amount) as total FROM transactions
		WHERE type='expense' AND date BETWEEN ? AND ?
		GROUP BY category ORDER BY total DESC
	`, monthStart, monthEnd)
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var cs models.CategorySummary
			catRows.Scan(&cs.Category, &cs.Amount)
			if color, ok := catColors[cs.Category]; ok {
				cs.Color = color
			} else {
				cs.Color = catColors["Outros"]
			}
			resp.ExpensesByCategory = append(resp.ExpensesByCategory, cs)
		}
	}

	// 7. Evolução dos últimos 6 meses
	for i := 5; i >= 0; i-- {
		target := now.AddDate(0, -i, 0)
		start := time.Date(target.Year(), target.Month(), 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")
		end := time.Date(target.Year(), target.Month()+1, 0, 23, 59, 59, 0, time.Local).Format("2006-01-02")

		md := models.MonthlyData{Month: target.Format("Jan/06")}

		database.DB.QueryRow(
			`SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='income' AND date BETWEEN ? AND ?`,
			start, end,
		).Scan(&md.Income)
		database.DB.QueryRow(
			`SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='expense' AND date BETWEEN ? AND ?`,
			start, end,
		).Scan(&md.Expenses)

		resp.MonthlyEvolution = append(resp.MonthlyEvolution, md)
	}

	c.JSON(http.StatusOK, resp)
}
