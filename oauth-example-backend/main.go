package main

import (
	"oauth-example/common/config"
	"oauth-example/common/fiber"
	"oauth-example/common/gorm"
	"oauth-example/common/oauth"
)

func main() {
	config.Init()
	gorm.Init()
	oauth.Init()
	fiber.Init()
}
	