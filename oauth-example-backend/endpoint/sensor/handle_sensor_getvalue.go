package sensor

import (
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/gofiber/fiber/v2"
)

func HandleSensorGetValue(c *fiber.Ctx) error {
	// สร้าง Resty client พร้อมการตั้งค่า timeout และ retry
	client := resty.New().
		SetTimeout(60 * time.Second).       // กำหนด timeout 1 นาที
		SetRetryCount(3).                   // พยายาม retry 3 ครั้ง
		SetRetryWaitTime(2 * time.Second).  // เว้นระยะ 2 วินาทีระหว่าง retry
		SetRetryMaxWaitTime(10 * time.Second) // กำหนดเวลารอ retry สูงสุด 10 วินาที

	// ส่งคำขอ GET ไปยัง IP address ของ sensor
	resp, err := client.R().Get("http://10.4.162.124:80/start_motion")

	// หากเกิดข้อผิดพลาด
	if err != nil {
		fmt.Printf("Error making request: %v\n", err) // Logging ข้อผิดพลาด
		return c.Status(500).SendString(fmt.Sprintf("Error making request: %v", err))
	}

	// ตรวจสอบ Content-Type จาก response
	contentType := resp.Header().Get("Content-Type")

	// Logging สำหรับ debug
	fmt.Printf("Response Status: %d\n", resp.StatusCode())
	fmt.Printf("Content-Type: %s\n", contentType)

	// สร้าง response ตามประเภทของ content
	response := fiber.Map{
		"status_code": resp.StatusCode(),
	}

	if strings.Contains(contentType, "image/jpg") || strings.Contains(contentType, "image/jpeg") {
		// กรณีที่เป็นรูปภาพ แปลงเป็น base64
		imageBase64 := base64.StdEncoding.EncodeToString(resp.Body())
		response["content_type"] = "image/jpg"
		response["data"] = imageBase64
		response["image_size"] = len(resp.Body())
	} else if strings.Contains(contentType, "text/plain") {
		// กรณีที่เป็นข้อความ
		response["content_type"] = "text/plain"
		response["data"] = string(resp.Body())
	} else {
		// กรณีที่ content type ไม่ตรงกับที่กำหนด
		fmt.Printf("Unexpected content type: %s\n", contentType) // Logging
		return c.Status(400).JSON(fiber.Map{
			"error": fmt.Sprintf("Unexpected content type: %s", contentType),
		})
	}

	return c.JSON(response)
}
