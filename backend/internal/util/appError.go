package util

import (
	"encoding/json"
	"log"
	"net/http"
)

// AppError represents an application error
type AppError struct {
	Message    string `json:"error"`
	StatusCode int    `json:"-"`
	Err        error  `json:"-"` // Optional internal error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Message
}

// NewAppError creates a new AppError
func NewAppError(msg string, statusCode int, err ...error) *AppError {
	var realErr error
	if len(err) > 0 {
		realErr = err[0]
	}
	return &AppError{Message: msg, StatusCode: statusCode, Err: realErr}
}

// Send sends the error as JSON response and logs the real error
func (e *AppError) Send(w http.ResponseWriter) {
	// Log the real error if it exists
	if e.Err != nil {
		log.Printf("Error: %s - %v", e.Message, e.Err)
	} else {
		log.Printf("Error: %s", e.Message)
	}

	// Set content type and status code
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(e.StatusCode)

	// Send JSON response
	json.NewEncoder(w).Encode(map[string]string{
		"error": e.Message,
	})
}

// Common helper constructors

func BadRequest(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusBadRequest, err...)
}

func Unauthorized(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusUnauthorized, err...)
}

func Forbidden(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusForbidden, err...)
}

func NotFound(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusNotFound, err...)
}

func Conflict(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusConflict, err...)
}

func TooManyRequests(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusTooManyRequests, err...)
}

func Internal(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusInternalServerError, err...)
}

func NotImplemented(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusNotImplemented, err...)
}

func ServiceUnavailable(msg string, err ...error) *AppError {
	return NewAppError(msg, http.StatusServiceUnavailable, err...)
}
