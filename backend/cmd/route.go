package main

import (
	"backend/internal/domain/location"
	"log"

	"github.com/labstack/echo/v4"
	"go.uber.org/dig"
)

func SetupRoutes(app *echo.Echo, container *dig.Container,) {
    api := app.Group("/v1")
    setupLocationRoutes(api, container)
}

func setupLocationRoutes(api *echo.Group, container *dig.Container) {
    err := container.Invoke(func(
        handler *location.LocationHandler,) {

        locationGroup := api.Group("/locations")
        locationGroup.GET("", handler.GetAllLocations)
        locationGroup.POST("", handler.CreateLocation)
        locationGroup.PUT("/:id", handler.UpdateLocation)
        locationGroup.DELETE("/:id", handler.DeleteLocation)

    })
    if err != nil {
        log.Fatalf("Failed to inject location handler: %v", err)
    }
}
