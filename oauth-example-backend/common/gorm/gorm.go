package gorm

import (
	"log"
	"oauth-example/common"
	"oauth-example/type/table"
	"os"
	"time"

	"github.com/bsthun/gut"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Init() {
	// Config logger
	lg := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             100 * time.Millisecond,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Config GORM dialector (Connector)
	dialector := mysql.New(
		mysql.Config{
			DSN: *common.Config.DB,
		},
	)

	// Open connection
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: lg,
	})

	if err != nil {
		gut.Fatal("Failed to connect to database", err)
	}

	if *common.Config.Environment {
		if err := db.AutoMigrate(
			new(table.User),
			new(table.Logging),
		); err != nil {
			gut.Fatal("Failed to migrate database", err)
		}
	}

	common.Database = db
}
