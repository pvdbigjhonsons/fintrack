package main

import (
	"log"
	"os"

	"github.com/fintrack/backend/internal/database"
	"github.com/fintrack/backend/internal/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Inicializa banco de dados
	database.Init()

	// Configura modo do Gin
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORS – permite o frontend em dev (Vite porta 5173)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "fintrack-api"})
	})

	// ─── API v1 ──────────────────────────────────────────────
	api := r.Group("/api/v1")
	{
		// Dashboard (visão geral)
		api.GET("/dashboard", handlers.GetDashboard)

		// Contas
		accounts := api.Group("/accounts")
		{
			accounts.GET("", handlers.ListAccounts)
			accounts.GET("/:id", handlers.GetAccount)
			accounts.POST("", handlers.CreateAccount)
			accounts.PUT("/:id", handlers.UpdateAccount)
			accounts.DELETE("/:id", handlers.DeleteAccount)
		}

		// Transações
		transactions := api.Group("/transactions")
		{
			transactions.GET("", handlers.ListTransactions)
			transactions.POST("", handlers.CreateTransaction)
			transactions.DELETE("/:id", handlers.DeleteTransaction)
		}

		// Dívidas
		debts := api.Group("/debts")
		{
			debts.GET("", handlers.ListDebts)
			debts.POST("", handlers.CreateDebt)
			debts.PUT("/:id", handlers.UpdateDebt)
			debts.DELETE("/:id", handlers.DeleteDebt)
			debts.POST("/:id/pay", handlers.PayInstallment)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 FinTrack API rodando em http://localhost:%s", port)
	log.Printf("📊 Dashboard: http://localhost:%s/api/v1/dashboard", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
