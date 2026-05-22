package database

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func Init() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./fintrack.db"
	}

	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		log.Fatalf("failed to create db directory: %v", err)
	}

	var err error
	DB, err = sql.Open("sqlite", dbPath+"?_pragma=journal_mode(WAL)&_pragma=foreign_keys(on)")
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	DB.SetMaxOpenConns(1) // SQLite: single writer
	DB.SetMaxIdleConns(1)

	if err := DB.Ping(); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	if err := migrate(); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	log.Println("✅ Database initialized successfully")
}

func migrate() error {
	schema := `
	CREATE TABLE IF NOT EXISTS accounts (
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT NOT NULL,
		type       TEXT NOT NULL DEFAULT 'checking',
		balance    REAL NOT NULL DEFAULT 0.0,
		currency   TEXT NOT NULL DEFAULT 'BRL',
		color      TEXT NOT NULL DEFAULT '#3B82F6',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS transactions (
		id          INTEGER PRIMARY KEY AUTOINCREMENT,
		account_id  INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
		type        TEXT NOT NULL CHECK(type IN ('income','expense')),
		amount      REAL NOT NULL CHECK(amount > 0),
		category    TEXT NOT NULL,
		description TEXT,
		date        TEXT NOT NULL,
		created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS debts (
		id                 INTEGER PRIMARY KEY AUTOINCREMENT,
		name               TEXT NOT NULL,
		type               TEXT NOT NULL DEFAULT 'credit_card',
		total_amount       REAL NOT NULL,
		paid_amount        REAL NOT NULL DEFAULT 0.0,
		remaining_amount   REAL NOT NULL DEFAULT 0.0,
		installments       INTEGER NOT NULL DEFAULT 1,
		paid_installments  INTEGER NOT NULL DEFAULT 0,
		interest_rate      REAL NOT NULL DEFAULT 0.0,
		due_day            INTEGER NOT NULL DEFAULT 10,
		next_due_date      TEXT,
		status             TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paid','overdue')),
		created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
	CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);
	CREATE INDEX IF NOT EXISTS idx_debts_status         ON debts(status);
	`

	_, err := DB.Exec(schema)
	if err != nil {
		return err
	}

	// Seed com dados de exemplo se o banco estiver vazio
	return seedIfEmpty()
}

func seedIfEmpty() error {
	var count int
	if err := DB.QueryRow("SELECT COUNT(*) FROM accounts").Scan(&count); err != nil || count > 0 {
		return err
	}

	seed := `
	INSERT INTO accounts (name, type, balance, color) VALUES
		('Conta Corrente Nubank', 'checking', 4250.75, '#8B5CF6'),
		('Poupança', 'savings', 12500.00, '#10B981'),
		('Carteira', 'cash', 320.00, '#F59E0B');

	INSERT INTO transactions (account_id, type, amount, category, description, date) VALUES
		(1, 'income',  5800.00, 'Salário',       'Salário mensal',             date('now','start of month')),
		(1, 'expense',  950.00, 'Moradia',        'Aluguel',                    date('now','-5 days')),
		(1, 'expense',  280.50, 'Alimentação',    'Supermercado',               date('now','-3 days')),
		(1, 'expense',  120.00, 'Transporte',     'Combustível',                date('now','-2 days')),
		(1, 'expense',   89.90, 'Assinaturas',    'Streaming e serviços',       date('now','-1 days')),
		(2, 'income',  1000.00, 'Investimentos',  'Rendimento poupança',        date('now','-10 days')),
		(1, 'expense',  450.00, 'Saúde',          'Plano de saúde',             date('now','-7 days')),
		(3, 'expense',   65.00, 'Lazer',          'Cinema e lanche',            date('now')),
		(1, 'income',   350.00, 'Freelance',      'Projeto extra',              date('now','-15 days')),
		(1, 'expense',  200.00, 'Educação',       'Curso online',               date('now','-4 days'));

	INSERT INTO debts (name, type, total_amount, paid_amount, remaining_amount, installments, paid_installments, interest_rate, due_day, next_due_date, status) VALUES
		('Cartão Nubank',       'credit_card', 3200.00,  850.00,  2350.00, 12,  3, 2.5, 15, date('now','start of month','+14 days'), 'active'),
		('Financiamento Carro', 'financing',  48000.00, 9600.00, 38400.00, 60, 12, 1.2, 10, date('now','start of month', '+9 days'), 'active'),
		('Empréstimo Pessoal',  'loan',        5000.00, 5000.00,     0.00, 10, 10, 3.5, 20, date('now','start of month','+19 days'), 'paid');
	`

	_, err := DB.Exec(seed)
	return err
}
