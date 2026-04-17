package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Locations struct {
	ID         primitive.ObjectID     `json:"id" bson:"_id"`
	Type       string     `json:"type" bson:"type"`
	Geometry   Geometry   `json:"geometry" bson:"geometry"`
	Properties Properties `json:"properties" bson:"properties"`
}

type Geometry struct {
	Type        string    `json:"type" bson:"type"`
	Coordinates []float64 `json:"coordinates" bson:"coordinates"`
}

type Properties struct {
	Name           string                `json:"name" bson:"name"`

	CreatedAt      time.Time `json:"_createdAt" bson:"_createdAt"`
	UpdatedAt      time.Time `json:"_updatedAt" bson:"_updatedAt"`
}