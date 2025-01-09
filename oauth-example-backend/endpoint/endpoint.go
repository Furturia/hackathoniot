package endpoint

import (
	"oauth-example/common"
	"oauth-example/endpoint/logging"
	"oauth-example/endpoint/public"
	"oauth-example/type/table"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
)

func Init(router fiber.Router) {
	api := router.Group("/api")

	publicRoutes := api.Group("public")
	loginRoutes := publicRoutes.Group("login")
	loginRoutes.Get("/redirect", public.HandleLoginRedirect)
	loginRoutes.Post("/callback", public.HandleLoginCallback)

	loggingRoutes := api.Group("log")
	loggingRoutes.Get("/get", logging.HandleLoggingGetLogs)

	imageRoutes := api.Group("image")	
	imageRoutes.Get("/:name", logging.HandleLoggingGetImage)

	emailRoutes := api.Group("email")
	emailRoutes.Post("/send", public.HandleMailSendMail)

	api.Post("/profile", public.HandleProfileGetProfile)

	api.Post("/changeRoleAdmin", func(c *fiber.Ctx) error {
		// รับค่า id ที่จะเปลี่ยนแปลง role (ในที่นี้ให้เป็น id = 4)
		id := 4

		// อัปเดตค่า Role เป็น "admin" โดยใช้คำสั่ง UPDATE
		if tx := common.Database.Model(&table.User{}).Where("id = ?", id).Update("role", "admin"); tx.Error != nil {
			return gut.Err(false, "failed to update user role to admin", tx.Error)
		}

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "user role updated to admin",
		})
	})

	api.Post("/changeRoleStd", func(c *fiber.Ctx) error {
		// รับค่า id ที่จะเปลี่ยนแปลง role (ในที่นี้ให้เป็น id = 4)
		id := 4

		// อัปเดตค่า Role เป็น "std" โดยใช้คำสั่ง UPDATE
		if tx := common.Database.Model(&table.User{}).Where("id = ?", id).Update("role", "std"); tx.Error != nil {
			return gut.Err(false, "failed to update user role to std", tx.Error)
		}

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "user role updated to std",
		})
	})

}
