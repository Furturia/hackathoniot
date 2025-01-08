package logging

import (
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

func HandleLoggingGetImage(c *fiber.Ctx) error {
	imageName := c.Params("name")

	imagePath := filepath.Join("images", imageName)

	return c.SendFile(imagePath)
}