package logging

import (
	"oauth-example/common"
	"oauth-example/type/response"
	"oauth-example/type/table"

	"github.com/gofiber/fiber/v2"

	"github.com/bsthun/gut"
)

func HandleLoggingGetLogs(c *fiber.Ctx) error {
	logs := []table.Logging{}
	if tx := common.Database.Preload("User").
		Order("COALESCE(timestamp, '0001-01-01 00:00:00') DESC"). // ใช้ COALESCE แทนการเปรียบเทียบ NULL
		Find(&logs); tx.Error != nil {
		return gut.Err(false, "Failed to retrieve logs", tx.Error)
	}

	// Map logs and associated user data to response format
	logResponses := make([]fiber.Map, len(logs))
	for i, log := range logs {
		logResponses[i] = fiber.Map{
			"id":         log.Id,
			"image_name": log.ImageName,
			"timestamp":  log.Timestamp,
			"status":     log.Status,
			"user": fiber.Map{
				"id":        log.User.Id,
				"firstname": log.User.Firstname,
				"lastname":  log.User.Lastname,
				"email":     log.User.Email,
				"role":      log.User.Role,
			},
		}
	}

	return c.JSON(response.Success(fiber.Map{
		"logs": logResponses,
	}))
}
