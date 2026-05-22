package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/fintrack/backend/internal/database"
	"github.com/fintrack/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func ListDebts(c *gin.Context) {
	status := c.Query("status") // active, paid, overdue, ou vazio p/ todos
	query := `
		SELECT id, name, type, total_amount, paid_amount, remaining_amount, installments,
		       paid_installments, interest_rate, due_day, COALESCE(next_due_date,''), status, created_at, updated_at
		FROM debts
	`
	args := []any{}
	if status != "" {
		query += " WHERE status = ?"
		args = append(args, status)
	}
	query += " ORDER BY next_due_date ASC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	debts := []models.Debt{}
	for rows.Next() {
		var d models.Debt
		if err := rows.Scan(&d.ID, &d.Name, &d.Type, &d.TotalAmount, &d.PaidAmount, &d.RemainingAmount,
			&d.Installments, &d.PaidInstallments, &d.InterestRate, &d.DueDay, &d.NextDueDate,
			&d.Status, &d.CreatedAt, &d.UpdatedAt); err == nil {
			debts = append(debts, d)
		}
	}
	c.JSON(http.StatusOK, debts)
}

func CreateDebt(c *gin.Context) {
	var req models.CreateDebtRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := "active"
	if req.PaidAmount >= req.TotalAmount {
		status = "paid"
	}

	remaining := req.TotalAmount - req.PaidAmount
	if remaining < 0 {
		remaining = 0
	}

	result, err := database.DB.Exec(`
		INSERT INTO debts (name, type, total_amount, paid_amount, remaining_amount, installments, paid_installments,
		                   interest_rate, due_day, next_due_date, status)
		VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		req.Name, req.Type, req.TotalAmount, req.PaidAmount, remaining, req.Installments, req.PaidInstallments,
		req.InterestRate, req.DueDay, req.NextDueDate, status,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "debt created"})
}

func UpdateDebt(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req models.CreateDebtRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := "active"
	if req.PaidAmount >= req.TotalAmount {
		status = "paid"
	}

	remaining := req.TotalAmount - req.PaidAmount
	if remaining < 0 {
		remaining = 0
	}

	_, err := database.DB.Exec(`
		UPDATE debts SET name=?, type=?, total_amount=?, paid_amount=?, remaining_amount=?, installments=?,
		paid_installments=?, interest_rate=?, due_day=?, next_due_date=?, status=?, updated_at=?
		WHERE id=?`,
		req.Name, req.Type, req.TotalAmount, req.PaidAmount, remaining, req.Installments, req.PaidInstallments,
		req.InterestRate, req.DueDay, req.NextDueDate, status, time.Now(), id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "debt updated"})
}

func DeleteDebt(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	_, err := database.DB.Exec(`DELETE FROM debts WHERE id=?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "debt deleted"})
}

// PayInstallment registra o pagamento de uma parcela
func PayInstallment(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req struct {
		Amount float64 `json:"amount" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := database.DB.Exec(`
		UPDATE debts
		SET paid_amount        = MIN(paid_amount + ?, total_amount),
		    remaining_amount   = MAX(total_amount - (paid_amount + ?), 0),
		    paid_installments  = MIN(paid_installments + 1, installments),
		    status = CASE WHEN (paid_amount + ?) >= total_amount THEN 'paid' ELSE 'active' END,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`,
		req.Amount, req.Amount, req.Amount, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "installment paid"})
}
