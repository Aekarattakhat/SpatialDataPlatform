package main

import (
	"backend/internal/config"
	"backend/internal/di"
	appMw "backend/internal/middleware"
	"context"
	"log"

	"github.com/labstack/echo/v4"
	echoMw "github.com/labstack/echo/v4/middleware"
)

func main() {
    cfg := config.Load()

    // Initialize MongoDB connection
    mongoClient, err := di.InitMongoDB(cfg.MongoURI, cfg.DBName)
    if err != nil {
        log.Fatalf("Failed to connect to MongoDB: %v", err)
    }
    defer mongoClient.Disconnect(context.Background())

    // Initialize Echo app
    app := echo.New()
    app.Use(echoMw.CORS())
    app.Use(appMw.ErrorHandler())
    app.Use(appMw.Logger())

    // Build dependency injection container
    container := di.BuildContainer(mongoClient, cfg)

    // Setup routes
    SetupRoutes(app, container)

    // Start server
    log.Printf("Server starting on port %s", cfg.Port)
    log.Fatal(app.Start(":" + cfg.Port))
}
