package endpoint

import (
	"oauth-example/endpoint/logging"
	"oauth-example/endpoint/public"

	"github.com/gofiber/fiber/v2"
)

func Init(router fiber.Router) {
	api := router.Group("/api")

	publicRoutes := api.Group("public")
	loginRoutes := publicRoutes.Group("login")
	loginRoutes.Get("/redirect", public.HandleLoginRedirect)
	loginRoutes.Post("/callback", public.HandleLoginCallback)

	loggingRoutes := api.Group("log")
	loggingRoutes.Post("/create", logging.HandleLoggingCreate)
	loggingRoutes.Get("/get", logging.HandleLoggingGetLogs)

	imageRoutes := api.Group("image")
	imageRoutes.Get("/:name",logging.HandleLoggingGetImage)

}