package middleware

import (
	"backend/internal/util"
	"net/http"

	"github.com/labstack/echo/v4"
)

// ErrorHandler is a custom error handler middleware
func ErrorHandler() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            err := next(c)
            
            if err != nil {
                // Handle AppError
                if appErr, ok := err.(*util.AppError); ok {
                    appErr.Send(c.Response())
                    return nil
                }
                
                switch e := err.(type) {
                case *echo.HTTPError:
                    return c.JSON(e.Code, map[string]string{"error": e.Message.(string)})
                default:
                    return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
                }
            }
            
            return nil
        }
    }
}

// Logger is a simple logging middleware
func Logger() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            // Log request
            println(c.Request().Method, c.Request().URL.Path)
            return next(c)
        }
    }
}
