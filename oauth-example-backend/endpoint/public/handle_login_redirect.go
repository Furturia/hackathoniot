package public

import (
	"oauth-example/common"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func HandleLoginRedirect(c *fiber.Ctx) error {
	url := common.Oauth2Config.AuthCodeURL("state", oauth2.AccessTypeOffline, oauth2.SetAuthURLParam("prompt", "login"))
	return c.Redirect(url)
}
