package middleware

import (
	"oauth-example/common"
	"oauth-example/type/shared"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
)

func Jwt() fiber.Handler {
	conf := jwtware.Config{
		SigningKey:  []byte(*common.Config.JWTSecret),
		TokenLookup: "cookie:login",
		ContextKey:  "l",
		Claims:      new(shared.UserClaims),
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return gut.Err(false, "JWT validation failure", err)
		},
	}

	return jwtware.New(conf)
}
