package logging

import (
	"oauth-example/common"
	"oauth-example/type/response"
	"oauth-example/type/shared"
	"oauth-example/type/table"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"

	"github.com/bsthun/gut"
)

func HandleLoggingGetLogs(c *fiber.Ctx) error {
	// Parse JWT token from context
	claims := c.Locals("l").(*jwt.Token).Claims.(*shared.UserClaims)

	// Retrieve logs for the user
	logs := []table.Logging{}
	if tx := common.Database.Where("user_id = ?", claims.UserId).Find(&logs); tx.Error != nil {
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
