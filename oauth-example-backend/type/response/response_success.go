package response

type SuccessResponse struct {
	Success bool    `json:"success"`
	Code    *string `json:"code,omitempty"`
	Message *string `json:"message,omitempty"`
	Data    any     `json:"data,omitempty"`
}

func Success(args1 any, args2 ...any) *SuccessResponse {
	if message, ok := args1.(string); ok {
		if len(args2) == 0 {
			return &SuccessResponse{
				Success: true,
				Message: &message,
			}
		}
		if message2, ok := args2[0].(string); ok {
			return &SuccessResponse{
				Success: true,
				Code:    &message,
				Message: &message2,
			}
		} else {
			return &SuccessResponse{
				Success: true,
				Code:    &message,
				Data:    &message2,
			}
		}
	}
	return &SuccessResponse{
		Success: true,
		Data:    args1,
	}
}
