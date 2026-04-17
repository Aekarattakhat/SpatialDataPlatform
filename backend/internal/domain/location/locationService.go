package location

import (
	"backend/internal/models"
	"backend/internal/util"
	"context"
	"math"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type LocationService struct {
	repo *LocationRepository
}

func NewLocationService(repo *LocationRepository) *LocationService {
	return &LocationService{
		repo: repo,
	}
}

func (s *LocationService) GetAllLocations(ctx context.Context) ([]*models.Locations, error) {
    locations,err := s.repo.GetAllLocations(ctx)
    if err != nil {
        return nil, util.Internal("failed to get locations", err)
    }
    return locations, nil
}

func (s *LocationService) GetAllLocationsPaginated(ctx context.Context, page, limit int) (*PaginationResponse, error) {
	locations, total, err := s.repo.GetAllLocationsPaginated(ctx, page, limit)
	if err != nil {
		return nil, util.Internal("failed to get locations", err)
	}

	if locations == nil {
		locations = []*models.Locations{}
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &PaginationResponse{
		Data:       locations,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (s *LocationService) CreateLocation(ctx context.Context, req *CreateLocationRequest) (*models.Locations, error) {
	location := &models.Locations{
		ID: primitive.NewObjectID(),
		Type: req.Type,
		Geometry: models.Geometry{
			Type:        req.Geometry.Type,
			Coordinates: req.Geometry.Coordinates,
		},
		Properties: models.Properties{
			Name:      req.Properties.Name,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	err := s.repo.Create(ctx, location)
	if err != nil {
		return nil, util.Internal("failed to create location", err)
	}
	return location, nil
}

func (s *LocationService) UpdateLocation(ctx context.Context, id string, req *UpdateLocationRequest) (*models.Locations, error) {
	location, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, util.Internal("failed to get location", err)
	}

	if req.Coordinates != nil {
		location.Geometry.Coordinates = req.Coordinates
	}
	if req.Properties.Name != "" {
		location.Properties.Name = req.Properties.Name
	}
	location.Properties.UpdatedAt = time.Now()

	err = s.repo.UpdateLocation(ctx, location)
	if err != nil {
		return nil, util.Internal("failed to update location", err)
	}
	return location, nil
}

func (s *LocationService) DeleteLocation(ctx context.Context, id string) error {
	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return util.Internal("failed to get location", err)
	}

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return util.Internal("failed to delete location", err)
	}
	return nil
}

