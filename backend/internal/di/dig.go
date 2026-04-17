package di

import (
	"context"
	"log"

	"backend/internal/config"
	"backend/internal/domain/location"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/dig"
)

func InitMongoDB(uri, dbName string) (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		return nil, err
	}

	log.Println("Successfully connected to MongoDB")
	return client, nil
}

func BuildContainer(mongoClient *mongo.Client, cfg config.Config) *dig.Container {
	container := dig.New()

	// Provide config
	if err := container.Provide(func() config.Config {
		return cfg
	}); err != nil {
		log.Fatalf("Failed to provide config: %v", err)
	}
	if err := container.Provide(func(cfg config.Config) string {
		return cfg.DBName
	}); err != nil {
		log.Fatalf("Failed to provide database name: %v", err)
	}

	// Provide MongoDB client
	if err := container.Provide(func() *mongo.Client {
		return mongoClient
	}); err != nil {
		log.Fatalf("Failed to provide MongoDB client: %v", err)
	}

	// Provide repository - dig will auto-inject both mongo.Client and string (dbName)
	if err := container.Provide(location.NewLocationRepository); err != nil {
		log.Fatalf("Failed to provide location repository: %v", err)
	}

	// Provide service
	if err := container.Provide(location.NewLocationService); err != nil {
		log.Fatalf("Failed to provide location service: %v", err)
	}

	// Provide handler
	if err := container.Provide(location.NewLocationHandler); err != nil {
		log.Fatalf("Failed to provide location handler: %v", err)
	}

	return container
}
