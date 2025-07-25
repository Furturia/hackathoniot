package common

import (
	"oauth-example/type/shared"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

var Config *shared.Config
var Database *gorm.DB
var Oauth2Config *oauth2.Config
var OidcProvider *oidc.Provider
