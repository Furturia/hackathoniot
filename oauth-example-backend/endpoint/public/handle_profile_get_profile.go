package public

import (
	"context"
	"fmt"
	"oauth-example/common"
	"oauth-example/type/payload"
	"oauth-example/type/shared"
	"oauth-example/type/table"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
)

func HandleProfileGetProfile(c *fiber.Ctx) error {
	body := new(payload.OauthCallback)
	if err := c.BodyParser(body); err != nil {
		return gut.Err(false, "unable to parse body", err)
	}

	// * validate body
	if err := gut.Validate(body); err != nil {
		return gut.Err(false, "invalid body", err)
	}

	println(*body.Code)

	// * exchange code for token
	token, err := common.Oauth2Config.Exchange(context.Background(), *body.Code)
	if err != nil {
		return gut.Err(false, "failed to exchange code for token", err)
	}

	// * parse ID token from OAuth2 token
	userInfo, err := common.OidcProvider.UserInfo(context.TODO(), oauth2.StaticTokenSource(token))
	if err != nil {
		return gut.Err(false, "failed to get user info", err)
	}

	// * parse user claims
	oidcClaims := new(shared.OidcClaims)
	if err := userInfo.Claims(oidcClaims); err != nil {
		return gut.Err(false, "failed to parse user claims", err)
	}

	// * first user with oid
	user := new(table.User)
	if tx := common.Database.First(user, "oid = ?", oidcClaims.Id); tx.Error != nil {
		if tx.Error.Error() != "record not found" {
			return gut.Err(false, "failed to query user", tx.Error)
		}
	}

	// * if user not exist, create new user
	if user.Id == nil {
		user = &table.User{
			Id:        nil,
			Oid:       oidcClaims.Id,
			Firstname: oidcClaims.FirstName,
			Lastname:  oidcClaims.Lastname,
			Email:     oidcClaims.Email,
			CreatedAt: nil,
			UpdatedAt: nil,
		}

		if tx := common.Database.Create(user); tx.Error != nil {
			return gut.Err(false, "failed to create user", tx.Error)
		}
	}

	return c.JSON(fiber.Map{
		"user_id": user.Id,
		"email":   *oidcClaims.Email,
		"name":    fmt.Sprintf("%s", *oidcClaims.FirstName),
	})
}
