package payload

type LoggingPayload struct {
	ImageName string `json:"image_name" validate:"required"`
}
