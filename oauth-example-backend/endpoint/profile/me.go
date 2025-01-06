package profile

import (
	"oauth-example/common"
	"oauth-example/type/payload"
	"oauth-example/type/response"
	"oauth-example/type/shared"
	"oauth-example/type/table"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func HandleProfileMe(c *fiber.Ctx) error {
	// read cookie
	l := c.Locals("l").(*jwt.Token).Claims.(*shared.UserClaims)

	user := new(table.User)

	if tx := common.Database.First(user, "id = ?", l.UserId); tx.Error != nil {
		return gut.Err(false, "Failed to get user", tx.Error)
	}

	mappedUser := &payload.Profile{
		Id:        user.Id,
		Oid:       user.Oid,
		Firstname: user.Firstname,
		Lastname:  user.Lastname,
		PhotoUrl:  user.PhotoUrl,
	}

	return c.JSON(response.Success(mappedUser))
}
