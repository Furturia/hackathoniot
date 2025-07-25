package fiber

import (
	"errors"
	"oauth-example/type/response"

	"github.com/bsthun/gut"
	"github.com/gofiber/fiber/v2"
)

func HandleError(c *fiber.Ctx, err error) error {
	// Case of *fiber.Error
	var fiberErr *fiber.Error
	if errors.As(err, &fiberErr) {
		return c.Status(fiberErr.Code).JSON(response.ErrorResponse{
			Success: false,
			Message: &fiberErr.Message,
		})
	}

	// Case of ErrorInstance
	var respErr *gut.ErrorInstance
	if errors.As(err, &respErr) {
		if respErr != nil {
			return c.Status(fiber.StatusBadRequest).JSON(&response.ErrorResponse{
				Success: false,
				Code:    &respErr.Errors[0].Code,
				Message: &respErr.Errors[0].Message,
				Error:   gut.Ptr(respErr.Error()),
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(&response.ErrorResponse{
			Success: false,
			Code:    &respErr.Errors[0].Code,
			Message: &respErr.Errors[0].Message,
			Error:   gut.Ptr(respErr.Error()),
		})
	}

	return c.Status(fiber.StatusInternalServerError).JSON(&response.ErrorResponse{
		Success: false,
		Code:    gut.Ptr("UNKNOWN_SERVER_ERROR"),
		Message: gut.Ptr("Unknown server error"),
		Error:   gut.Ptr(err.Error()),
	})
}
