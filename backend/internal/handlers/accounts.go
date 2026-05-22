package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/fintrack/backend/internal/database"
	"github.com/fintrack/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func ListAccounts(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, type, balance, currency, color, created_at, updated_at FROM accounts ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	accounts := []models.Account{}
	for rows.Next() {
		var a models.Account
		if err := rows.Scan(&a.ID, &a.Name, &a.Type, &a.Balance, &a.Currency, &a.Color, &a.CreatedAt, &a.UpdatedAt); err == nil {
			accounts = append(accounts, a)
		}
	}
	c.JSON(http.StatusOK, accounts)
}

func GetAccount(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var a models.Account
	err := database.DB.QueryRow(
		`SELECT id, name, type, balance, currency, color, created_at, updated_at FROM accounts WHERE id=?`, id,
	).Scan(&a.ID, &a.Name, &a.Type, &a.Balance, &a.Currency, &a.Color, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}
	c.JSON(http.StatusOK, a)
}

func CreateAccount(c *gin.Context) {
	var req models.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Currency == "" {
		req.Currency = "BRL"
	}
	if req.Color == "" {
		req.Color = "#3B82F6"
	}

	result, err := database.DB.Exec(
		`INSERT INTO accounts (name, type, balance, currency, color) VALUES (?,?,?,?,?)`,
		req.Name, req.Type, req.Balance, req.Currency, req.Color,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "account created"})
}

func UpdateAccount(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req models.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := database.DB.Exec(
		`UPDATE accounts SET name=?, type=?, balance=?, currency=?, color=?, updated_at=? WHERE id=?`,
		req.Name, req.Type, req.Balance, req.Currency, req.Color, time.Now(), id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "account updated"})
}

func DeleteAccount(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	_, err := database.DB.Exec(`DELETE FROM accounts WHERE id=?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "account deleted"})
}
