import axios from 'axios';
import {
  MeteoriteLanding,
  UnprocessedMeteoriteLanding,
} from '../models/meteorites';

export async function getMeteoriteLandings(): Promise<MeteoriteLanding[]> {
  const results = await axios.get<UnprocessedMeteoriteLanding[]>(
    '/meteorite-landings.json'
  );
  const landings =  results.data.map((m) => ({
    ...m,
    year: new Date(m.year).getFullYear(),
    mass: +m.mass,
  }));
  landings.sort((a,b) => a.year - b.year);
  return landings;
}
