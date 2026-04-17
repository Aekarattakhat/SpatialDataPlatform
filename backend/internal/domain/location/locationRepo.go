package location

import (
	"backend/internal/models"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type LocationRepository struct {
	db *mongo.Database
}

func NewLocationRepository(mongoClient *mongo.Client, dbName string) *LocationRepository {
	return &LocationRepository{
		db: mongoClient.Database(dbName),
	}
}

func (r *LocationRepository) Create(ctx context.Context, location *models.Locations) error {
	collection := r.db.Collection("locations")
	_, err := collection.InsertOne(ctx, location)
	return err
}

func (r *LocationRepository) GetAllLocations(ctx context.Context) ([]*models.Locations, error) {
	collection := r.db.Collection("locations")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var locations []*models.Locations
	for cursor.Next(ctx) {
		var location models.Locations
		if err := cursor.Decode(&location); err != nil {
			return nil, err
		}
		locations = append(locations, &location)
	}

	return locations, nil

}

func (r *LocationRepository) GetAllLocationsPaginated(ctx context.Context, page, limit int) ([]*models.Locations, int64, error) {
	collection := r.db.Collection("locations")
	
	skip := int64((page - 1) * limit)
	limit64 := int64(limit)
	
	total, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, 0, err
	}

	cursor, err := collection.Find(ctx, bson.M{}, 
		&options.FindOptions{
			Skip:  &skip,
			Limit: &limit64,
		},
	)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var locations []*models.Locations
	for cursor.Next(ctx) {
		var location models.Locations
		if err := cursor.Decode(&location); err != nil {
			return nil, 0, err
		}
		locations = append(locations, &location)
	}

	return locations, total, nil
}

func (r *LocationRepository) GetByID(ctx context.Context, id string) (*models.Locations, error) {
	collection := r.db.Collection("locations")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var location models.Locations
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&location)
	if err != nil {
		return nil, err
	}

	return &location, nil
}

func (r *LocationRepository) UpdateLocation(ctx context.Context, location *models.Locations) error {
	collection := r.db.Collection("locations")
	_, err := collection.UpdateOne(ctx, bson.M{"_id": location.ID}, bson.M{"$set": location})
	return err
}

func (r *LocationRepository) Delete(ctx context.Context, id string) error {
	collection := r.db.Collection("locations")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}
