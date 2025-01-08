package endpoint

import (
	"oauth-example/common/fiber/middleware"
	"oauth-example/endpoint/logging"
	"oauth-example/endpoint/profile"
	"oauth-example/endpoint/public"

	"github.com/gofiber/fiber/v2"
)

func Init(router fiber.Router) {
	api := router.Group("/api")

	publicRoutes := api.Group("public")
	loginRoutes := publicRoutes.Group("login")
	loginRoutes.Get("/redirect", public.HandleLoginRedirect)
	loginRoutes.Post("/callback", public.HandleLoginCallback)

	profileRoutes := api.Group("profile", middleware.Jwt())
	profileRoutes.Get("/me", profile.HandleProfileMe)

	loggingRoutes := api.Group("log", middleware.Jwt())
	loggingRoutes.Post("/create", logging.HandleLoggingCreate)
	loggingRoutes.Get("/get", logging.HandleLoggingGetLogs)

	imageRoutes := api.Group("image", middleware.Jwt())
	imageRoutes.Get("/:name",logging.HandleLoggingGetImage)

}
