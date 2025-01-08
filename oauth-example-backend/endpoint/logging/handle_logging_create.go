package logging

import (
	"fmt"
	"oauth-example/common"
	"oauth-example/type/response"
	"oauth-example/type/shared"
	"oauth-example/type/table"
	"os"
	"path/filepath"
	"time"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func HandleLoggingCreate(c *fiber.Ctx) error {
	// Parse JWT token from context
	claims := c.Locals("l").(*jwt.Token).Claims.(*shared.UserClaims)

	// Find user in database
	user := new(table.User)
	if tx := common.Database.First(user, "id = ?", claims.UserId); tx.Error != nil {
		return gut.Err(false, "Failed to find user", tx.Error)
	}

	// Parse uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		return gut.Err(false, "Failed to retrieve file", err)
	}

	// Save the file to folder/images
	destinationFolder := "images"
	if err := os.MkdirAll(destinationFolder, os.ModePerm); err != nil {
		return gut.Err(false, "Failed to create directory", err)
	}

	timestamp := time.Now().Unix()
	fileName := fmt.Sprintf("%d_%s", timestamp, file.Filename)
	fileNamePath := filepath.Join(destinationFolder, fmt.Sprintf("%d_%s", timestamp, file.Filename))
	if err := c.SaveFile(file, fileNamePath); err != nil {
		return gut.Err(false, "Failed to save file", err)
	}

	// Create new logging entry
	logEntry := &table.Logging{
		UserId:    user.Id,
		ImageName: &fileName,
	}

	if tx := common.Database.Create(logEntry); tx.Error != nil {
		return gut.Err(false, "Failed to create logging entry", tx.Error)
	}

	// Return success response
	return c.JSON(response.Success(fiber.Map{
		"message": "Log created successfully",
		"log": fiber.Map{
			"id":         logEntry.Id,
			"user_id":    logEntry.UserId,
			"image_name": *logEntry.ImageName,
			"timestamp":  time.Now(),
		},
	}))
}

