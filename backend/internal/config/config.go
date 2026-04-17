package config

import (
    "os"
    
    _ "github.com/joho/godotenv/autoload"
)

type Config struct {
    Port     string
    MongoURI string
    DBName   string
}

func Load() Config {
    return Config{
        Port:     getEnv("PORT", "8080"),
        MongoURI: getEnv("MONGO_URI", "mongodb://localhost:27017"),
        DBName:   getEnv("DB_NAME", "spatial_db"),
    }
}

func getEnv(key, fallback string) string {
    if value, exists := os.LookupEnv(key); exists {
        return value
    }
    return fallback
}
