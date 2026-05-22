package handlers

import (
	"net/http"
	"strconv"

	"github.com/fintrack/backend/internal/database"
	"github.com/fintrack/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func ListTransactions(c *gin.Context) {
	query := `
		SELECT t.id, t.account_id, a.name, t.type, t.amount, t.category, t.description, t.date, t.created_at
		FROM transactions t
		JOIN accounts a ON a.id = t.account_id
		WHERE 1=1
	`
	args := []any{}

	if accountID := c.Query("account_id"); accountID != "" {
		query += " AND t.account_id = ?"
		args = append(args, accountID)
	}
	if txType := c.Query("type"); txType != "" {
		query += " AND t.type = ?"
		args = append(args, txType)
	}
	if from := c.Query("from"); from != "" {
		query += " AND t.date >= ?"
		args = append(args, from)
	}
	if to := c.Query("to"); to != "" {
		query += " AND t.date <= ?"
		args = append(args, to)
	}

	query += " ORDER BY t.date DESC, t.created_at DESC LIMIT 100"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	txns := []models.Transaction{}
	for rows.Next() {
		var tx models.Transaction
		if err := rows.Scan(&tx.ID, &tx.AccountID, &tx.AccountName, &tx.Type, &tx.Amount, &tx.Category, &tx.Description, &tx.Date, &tx.CreatedAt); err == nil {
			txns = append(txns, tx)
		}
	}
	c.JSON(http.StatusOK, txns)
}

func CreateTransaction(c *gin.Context) {
	var req models.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, err := tx.Exec(
		`INSERT INTO transactions (account_id, type, amount, category, description, date) VALUES (?,?,?,?,?,?)`,
		req.AccountID, req.Type, req.Amount, req.Category, req.Description, req.Date,
	)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Atualiza saldo da conta
	balanceDelta := req.Amount
	if req.Type == "expense" {
		balanceDelta = -req.Amount
	}
	_, err = tx.Exec(`UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, balanceDelta, req.AccountID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "transaction created"})
}

func DeleteTransaction(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	// Recupera dados antes de deletar para reverter saldo
	var txType string
	var amount float64
	var accountID int64
	err := database.DB.QueryRow(
		`SELECT type, amount, account_id FROM transactions WHERE id=?`, id,
	).Scan(&txType, &amount, &accountID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	dbTx, _ := database.DB.Begin()
	dbTx.Exec(`DELETE FROM transactions WHERE id=?`, id)

	// Reverte o saldo
	delta := -amount
	if txType == "expense" {
		delta = amount
	}
	dbTx.Exec(`UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id=?`, delta, accountID)
	dbTx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "transaction deleted"})
}
