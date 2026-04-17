export interface Geometry {
  type: string;
  coordinates: [number, number];
}

export interface Properties {
  _id: string;
  name: string;
  _createdAt: string;
  _updatedAt: string;
  [key: string]: any;
}

export interface Feature {
  id: string;
  type: string;
  geometry: Geometry;
  properties: Properties;
}

// Location creation payload
export interface CreateLocationPayload {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
  };
}

// Location update payload (same as create for now)
export interface UpdateLocationPayload extends CreateLocationPayload {}
