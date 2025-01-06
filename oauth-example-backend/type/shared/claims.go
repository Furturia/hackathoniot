package shared

type OidcClaims struct {
	Id        *string `json:"sub"`
	FirstName *string `json:"name"`
	Lastname  *string `json:"family_name"`
	Picture   *string `json:"picture"`
	Email     *string `json:"email"`
}

func (o *OidcClaims) Valid() error {
	return nil
}

type UserClaims struct {
	UserId *uint64 `json:"userId"`
}

func (u *UserClaims) Valid() error {
	return nil
}
