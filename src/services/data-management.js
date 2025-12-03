// ============================================================================
// DATA MANAGEMENT
// ============================================================================

export async function loadDatabase() {
  const response = await fetch("../database/database.json");
  const data = await response.json();
  return data;
}

export function processData(data) {
  const byconfederations = {};

  data.forEach((country) => {
    const conf = country.confederation;
    if (!byconfederations[conf]) {
      byconfederations[conf] = [];
    }
    byconfederations[conf].push(country);
  });
  const { AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA } = byconfederations;
  return { AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA };
}


