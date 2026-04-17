package util

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// ValidateStruct validates a struct and returns a BadRequest error if validation fails
func ValidateStruct(s interface{}) *AppError {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	// Parse validation errors
	var errorMessages []string
	for _, err := range err.(validator.ValidationErrors) {
		field := strings.ToLower(err.Field())
		tag := err.Tag()

		switch tag {
		case "required":
			errorMessages = append(errorMessages, field+" is required")
		case "min":
			errorMessages = append(errorMessages, field+" must be at least "+err.Param()+" characters")
		case "max":
			errorMessages = append(errorMessages, field+" must be at most "+err.Param()+" characters")
		case "len":
			errorMessages = append(errorMessages, field+" must be "+err.Param()+" characters")
		case "email":
			errorMessages = append(errorMessages, field+" must be a valid email")
		default:
			errorMessages = append(errorMessages, field+" is invalid")
		}
	}

	return BadRequest(strings.Join(errorMessages, ", "))
}
