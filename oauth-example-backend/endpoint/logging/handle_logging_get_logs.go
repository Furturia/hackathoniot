package logging

import (
	"oauth-example/common"
	"oauth-example/type/response"
	"oauth-example/type/table"

	"github.com/gofiber/fiber/v2"

	"github.com/bsthun/gut"
)

func HandleLoggingGetLogs(c *fiber.Ctx) error {
	// Retrieve logs for the user
	logs := []table.Logging{}
	if tx := common.Database.Find(&logs); tx.Error != nil {
		return gut.Err(false, "Failed to retrieve logs", tx.Error)
	}

	// Map logs to response format
	logResponses := make([]fiber.Map, len(logs))
	for i, log := range logs {
		logResponses[i] = fiber.Map{
			"id":         log.Id,
			"image_name": *log.ImageName,
			"timestamp":  log.Timestamp,
		}
	}

	return c.JSON(response.Success(fiber.Map{
		"logs": logResponses,
	}))
}
