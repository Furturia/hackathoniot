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
	userIdStr := c.FormValue("user_id") // สมมติว่า user_id เป็นประเภท int
	if userIdStr == "" {
		return gut.Err(false, "Failed to retrieve user_id from context", nil)
	}

	// Convert userId to uint64
	userId, err := strconv.ParseUint(userIdStr, 10, 64)  // base 10, 64-bit unsigned integer
	if err != nil {
		return gut.Err(false, "Failed to convert user_id to uint64", err)
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
		UserId:    &userId,
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
