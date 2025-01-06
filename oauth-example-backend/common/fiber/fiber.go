package fiber

import (
	"log"
	"oauth-example/common"
	"oauth-example/common/fiber/middleware"
	"oauth-example/endpoint"
	"oauth-example/type/response"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func Init() {
	app := fiber.New(fiber.Config{
		AppName:       "OAuth Example",
		ErrorHandler:  HandleError,
		Prefork:       false,
		StrictRouting: true,
		Network:       fiber.NetworkTCP,
	})

	app.Use(logger.New())
	app.Use(middleware.Recover())
	app.Use(middleware.Cors())

	app.All("/", func(c *fiber.Ctx) error {
		return c.JSON(response.Success("Welcome to OAuth Example"))
	})

	endpoint.Init(app)

	app.Use(HandleNotFound)

	err := app.Listen(*common.Config.Port)
	if err != nil {
		log.Fatal("Failed to start server: ", err)

	}
}
