package shared

type Config struct {
	Environment       *bool     `yaml:"environment" validate:"required"`
	FrontendPath      *string   `yaml:"frontend_path" validate:"required"`
	OauthRedirectPath *string   `yaml:"oauth_redirect_path" validate:"required"`
	Port              *string   `yaml:"port" validate:"required"`
	Cors              []*string `yaml:"cors" validate:"required"`
	JWTSecret         *string   `yaml:"jwt_secret" validate:"required"`
	DB                *string   `yaml:"db" validate:"required"`
	OauthEndpoint     *string   `yaml:"oauth_endpoint" validate:"required"`
	OauthClientID     *string   `yaml:"oauth_client_id" validate:"required"`
	OauthClientSecret *string   `yaml:"oauth_client_secret" validate:"required"`
}
