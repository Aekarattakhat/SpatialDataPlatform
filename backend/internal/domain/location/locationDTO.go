package location

import "backend/internal/models"

type GeometryRequest struct {
	Type        string    `json:"type" validate:"required"`
	Coordinates []float64 `json:"coordinates" validate:"required"`
}

type PropertiesRequest struct {
	Name string `json:"name" validate:"required"`
}

type CreateLocationRequest struct {
	Type       string            `json:"type" validate:"required"`
	Geometry   GeometryRequest   `json:"geometry" validate:"required"`
	Properties PropertiesRequest `json:"properties" validate:"required"`
}

type UpdatePropertiesRequest struct {
	Name string `json:"name"`
}

type UpdateLocationRequest struct {
	Coordinates []float64             `json:"coordinates"`
	Properties  UpdatePropertiesRequest `json:"properties" validate:"required"`
}

type PaginationRequest struct {
	Page  int `json:"page" validate:"min=1"`
	Limit int `json:"limit" validate:"min=1,max=100"`
}

type PaginationResponse struct {
	Data       []*models.Locations `json:"data"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	Total      int64                `json:"total"`
	TotalPages int                  `json:"totalPages"`
}
