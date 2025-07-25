package config

import (
	"oauth-example/common"
	"oauth-example/type/shared"
	"os"

	"github.com/bsthun/gut"
	"gopkg.in/yaml.v3"
)

func Init() {
	config := new(shared.Config)

	yml, err := os.ReadFile("config.yml")

	if err != nil {
		gut.Fatal("Failed to read config.yml", err)
	}

	if err := yaml.Unmarshal(yml, config); err != nil {
		gut.Fatal("Failed to unmarshal config.yml", err)
	}

	if err := gut.Validate(config); err != nil {
		gut.Fatal("Invalid config.yml", err)
	}

	common.Config = config
}
