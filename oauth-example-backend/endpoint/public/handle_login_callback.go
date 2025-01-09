package public

import (
	"oauth-example/endpoint/logging"
	"oauth-example/type/response"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
)

func HandleLoginCallback(c *fiber.Ctx) error {
	if err := logging.HandleLoggingCreate(c); err != nil {
		return gut.Err(false, "failed to log the action", err)
	}

	return c.JSON(response.Success(map[string]string{
		"message": "login Successful!",
	}))
}
