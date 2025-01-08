package payload

type Profile struct {
	Id        *uint64 `json:"id"`
	Oid       *string `json:"oid"`
	Firstname *string `json:"firstname"`
	Lastname  *string `json:"lastname"`
}
	