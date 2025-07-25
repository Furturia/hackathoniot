package public

import (
	"log"
	"net/smtp"

	"github.com/gofiber/fiber/v2"
)

type MailRequest struct {
	To   string `json:"to"`
	Body string `json:"mess"`
}

func HandleMailSendMail(c *fiber.Ctx) error {
	// Parse JSON body
		log.Printf("Request Body: %s", string(c.Body())) // Log request body ที่ได้รับ

	var mailRequest MailRequest
	if err := c.BodyParser(&mailRequest); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Extract values
	to := mailRequest.To
	body := mailRequest.Body

	// Check if required fields are present
	if to == "" || body == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing 'to' or 'body' field",
		})
	}

	// Sender's email and app password
	from := "moomost123@gmail.com"
	pass := "cozf ians qavq ksmo"

	// Create email message
	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: ยืนยันตัวตนสำหรับการเข้าใช้งาน LAB ณ ตึกคณะเทคโนโลยีสารสนเทศ\n\n" +
		body

	// Send email
	err := smtp.SendMail("smtp.gmail.com:587",
		smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
		from, []string{to}, []byte(msg))

	// Handle errors
	if err != nil {
		log.Printf("smtp error: %s", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to send email",
		})
	}

	log.Println("Successfully sent email to " + to)
	return c.JSON(fiber.Map{
		"message": "Email sent successfully to " + to,
	})
}
