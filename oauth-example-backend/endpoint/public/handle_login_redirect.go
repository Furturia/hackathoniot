package public

import (
	"oauth-example/common"

	"github.com/gofiber/fiber/v2"
)

func HandleLoginRedirect(c *fiber.Ctx) error {
	url := common.Oauth2Config.AuthCodeURL("state")
	return c.Redirect(url)
}
