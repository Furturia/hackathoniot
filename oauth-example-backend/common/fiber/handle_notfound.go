package fiber

import (
	"fmt"
	"oauth-example/type/response"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
)

func HandleNotFound(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
		Success: false,
		Message: gut.Ptr(fmt.Sprintf("%s %s not found", c.Method(), c.Path())),
		Error:   gut.Ptr("NOT_FOUND"),
	})
}
