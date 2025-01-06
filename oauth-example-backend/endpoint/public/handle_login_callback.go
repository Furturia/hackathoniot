package public

import (
	"context"
	"oauth-example/common"
	"oauth-example/type/payload"
	"oauth-example/type/response"
	"oauth-example/type/shared"
	"oauth-example/type/table"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/oauth2"
)

func HandleLoginCallback(c *fiber.Ctx) error {
	// * parse body
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
			PhotoUrl:  oidcClaims.Picture,
			CreatedAt: nil,
			UpdatedAt: nil,
		}

		if tx := common.Database.Create(user); tx.Error != nil {
			return gut.Err(false, "failed to create user", tx.Error)
		}
	}

	// * generate jwt token
	claims := &shared.UserClaims{
		UserId: user.Id,
	}

	// Sign JWT token
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedJwtToken, err := jwtToken.SignedString([]byte(*common.Config.JWTSecret))
	if err != nil {
		return gut.Err(false, "failed to sign jwt token", err)
	}

	// * set cookie
	c.Cookie(&fiber.Cookie{
		Name:     "login",
		Value:    signedJwtToken,
		Path:     "/",      // Ensure it's accessible across the application
		SameSite: "Strict", // Adjust based on your needs
	})

	return c.JSON(response.Success(map[string]string{
		"token": signedJwtToken,
	}))
}
