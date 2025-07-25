package oauth

import (
	"context"
	"net/url"
	"oauth-example/common"

	"github.com/bsthun/gut"
	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

func Init() {
	redirectUrl, err := url.JoinPath(*common.Config.FrontendPath, *common.Config.OauthRedirectPath)
	if err != nil {
		gut.Fatal("Failed to join URL path", err)
	}

	common.OidcProvider, err = oidc.NewProvider(context.Background(), *common.Config.OauthEndpoint)
	if err != nil {
		gut.Fatal("Failed to create OIDC provider", err)
	}

	common.Oauth2Config = &oauth2.Config{
		ClientID:     *common.Config.OauthClientID,
		ClientSecret: *common.Config.OauthClientSecret,
		RedirectURL:  redirectUrl,
		Endpoint:     common.OidcProvider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}
}
