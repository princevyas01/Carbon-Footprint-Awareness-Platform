// List of 30 major Indian cities
export const INDIAN_CITIES = [
  'Ahmedabad',
  'Amritsar',
  'Bangalore',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Dehradun',
  'Delhi',
  'Goa',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Jammu',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Madurai',
  'Mumbai',
  'Nagpur',
  'Patna',
  'Pune',
  'Raipur',
  'Ranchi',
  'Shimla',
  'Srinagar',
  'Thiruvananthapuram',
  'Visakhapatnam',
];

// Distance database (in km) - symmetric lookup using sorted alphabetical keys
const CITY_PAIRS: Record<string, number> = {
  'Delhi-Mumbai': 1148,
  'Bangalore-Mumbai': 845,
  'Chennai-Mumbai': 1036,
  'Kolkata-Mumbai': 1654,
  'Bangalore-Delhi': 1740,
  'Chennai-Delhi': 1754,
  'Delhi-Kolkata': 1305,
  'Bangalore-Chennai': 290,
  'Hyderabad-Mumbai': 711,
  'Delhi-Pune': 1194,
  'Bangalore-Pune': 741,
  'Ahmedabad-Mumbai': 424,
  'Jaipur-Mumbai': 1024,
  'Kochi-Mumbai': 1198,
  'Goa-Mumbai': 451,
  
  // Extra common pairs to enrich the database
  'Bangalore-Hyderabad': 500,
  'Chennai-Hyderabad': 520,
  'Delhi-Jaipur': 240,
  'Delhi-Lucknow': 420,
  'Kolkata-Patna': 470,
  'Ahmedabad-Delhi': 775,
  'Delhi-Srinagar': 640,
  'Guwahati-Kolkata': 530,
  'Bhopal-Delhi': 600,
  'Delhi-Jammu': 500,
  'Delhi-Shimla': 280,
  'Dehradun-Delhi': 200,
  'Bhubaneswar-Kolkata': 360,
  'Kochi-Thiruvananthapuram': 175,
  'Coimbatore-Madurai': 135,
};

/**
 * Returns distance in km between two Indian cities.
 * If not in table, returns a reasonable default based on coordinates or avg. distance (e.g., 1000km).
 */
export function getCityDistance(city1: string, city2: string): number {
  if (!city1 || !city2) return 0;
  if (city1 === city2) return 0;

  const key = [city1, city2].sort().join('-');
  if (CITY_PAIRS[key] !== undefined) {
    return CITY_PAIRS[key];
  }

  // Fallback distance based on a general average of major interstate distances in India
  return 1000;
}
