package location

import (
	"backend/internal/util"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type LocationHandler struct {
	locationService *LocationService
}

func NewLocationHandler(locationService *LocationService) *LocationHandler {
	return &LocationHandler{
		locationService: locationService,
	}
}

func (h *LocationHandler) GetAllLocations(c echo.Context) error {
	page := 1
	limit := 10

	if pageStr := c.QueryParam("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	response, err := h.locationService.GetAllLocationsPaginated(c.Request().Context(), page, limit)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, response)
}

func (h *LocationHandler) CreateLocation(c echo.Context) error {
	var req CreateLocationRequest
	if err := c.Bind(&req); err != nil {
		return err
	}
	if validationErr := util.ValidateStruct(&req); validationErr != nil {
		return validationErr
	}

	location, err := h.locationService.CreateLocation(c.Request().Context(), &req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, location)
}

func (h *LocationHandler) UpdateLocation(c echo.Context) error {
	id := c.Param("id")
	var req UpdateLocationRequest
	if err := c.Bind(&req); err != nil {
		return err
	}
	if validationErr := util.ValidateStruct(&req); validationErr != nil {
		return validationErr
	}

	location, err := h.locationService.UpdateLocation(c.Request().Context(), id, &req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, location)
}

func (h *LocationHandler) DeleteLocation(c echo.Context) error {
	id := c.Param("id")

	err := h.locationService.DeleteLocation(c.Request().Context(), id)
	if err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}