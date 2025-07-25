package logging

import (
	"fmt"
	"oauth-example/common"
	"oauth-example/type/response"
	"oauth-example/type/table"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
)

func HandleLoggingCreate(c *fiber.Ctx) error {
	// Validate and parse user_id
	userIdStr := c.FormValue("user_id")
	if userIdStr == "" {
		return gut.Err(false, "Failed to retrieve user_id from context", nil)
	}

	userId, err := strconv.ParseUint(userIdStr, 10, 64)
	if err != nil {
		return gut.Err(false, "Failed to convert user_id to uint64", err)
	}

	// Parse status
	statusStr := c.FormValue("status")

	// Initialize logging entry with null ImageName
	var imageName *string = nil
	logEntry := &table.Logging{
		UserId:    &userId,
		Status:    &statusStr,
		ImageName: imageName,
	}

	// Handle optional image upload
	file, err := c.FormFile("image")
	if err == nil && file != nil {
		// Create images directory if it doesn't exist
		destinationFolder := "images"
		if err := os.MkdirAll(destinationFolder, os.ModePerm); err != nil {
			return gut.Err(false, "Failed to create directory", err)
		}

		// Generate filename with timestamp
		timestamp := time.Now().Unix()
		fileName := fmt.Sprintf("%d_%s", timestamp, file.Filename)
		fileNamePath := filepath.Join(destinationFolder, fileName)

		// Save the file
		if err := c.SaveFile(file, fileNamePath); err != nil {
			return gut.Err(false, "Failed to save file", err)
		}

		// Set image name in log entry
		logEntry.ImageName = &fileName
	}

	// Create log entry in database
	if tx := common.Database.Create(logEntry); tx.Error != nil {
		return gut.Err(false, "Failed to create logging entry", tx.Error)
	}

	// Prepare response
	responseData := fiber.Map{
		"id":        logEntry.Id,
		"user_id":   logEntry.UserId,
		"status":    logEntry.Status,
		"timestamp": time.Now(),
	}

	// Add image_name to response only if it exists
	if logEntry.ImageName != nil {
		responseData["image_name"] = *logEntry.ImageName
	} else {
		responseData["image_name"] = nil
	}

	return c.JSON(response.Success(fiber.Map{
		"message": "Log created successfully",
		"log":     responseData,
	}))
}