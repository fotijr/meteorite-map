/**
 * Meteorite landing data.
 */
export interface BaseMeteoriteLanding {
  name: string;
  id: string;
  nametype: string; //	"Valid"
  recclass: string; //	"L5"
  fall: string; //	"Fell"

  reclat: string; //	"50.775000"
  reclong: string; //	"6.083330"
  geolocation: {
    type: string; //	"Point"
    coordinates: [number, number];
  };
}

export interface UnprocessedMeteoriteLanding extends BaseMeteoriteLanding{
  mass: string; //	"21"
  year: string; // "2002-01-01T00:00:00.000"
}

export interface MeteoriteLanding extends BaseMeteoriteLanding{
  /** Mass, in grams. */
  mass: number;
  year: number;
}
