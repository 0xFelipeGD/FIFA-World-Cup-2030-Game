import { readFile, writeFile } from "fs/promises";
import { mkdir } from "fs/promises";

async function loadDatabase() {
  // Resolve database relative to this file to avoid cwd issues
  const dbUrl = new URL("../../Database/database.json", import.meta.url);
  const data = JSON.parse(await readFile(dbUrl, "utf-8"));
  return data;
}

function processData(data) {
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

function League(teams) {
  const standings = teams.map((team) => ({
    ...team,
    points: 0,
  }));

  for (let i = 0; i < standings.length; i++) {
    for (let j = i + 1; j < standings.length; j++) {
      const team1 = standings[i];
      const team2 = standings[j];

      let strengthDiff = team1.strength - team2.strength;
      let team1WinProb;
      let drawProb;

      switch (true) {
        case strengthDiff <= -80:
          team1WinProb = 0.05;
          drawProb = 0.1;
          break;
        case strengthDiff > -80 && strengthDiff <= -60:
          team1WinProb = 0.1;
          drawProb = 0.15;
          break;
        case strengthDiff > -60 && strengthDiff <= -40:
          team1WinProb = 0.15;
          drawProb = 0.2;
          break;
        case strengthDiff > -40 && strengthDiff <= -25:
          team1WinProb = 0.2;
          drawProb = 0.25;
          break;
        case strengthDiff > -25 && strengthDiff <= -15:
          team1WinProb = 0.25;
          drawProb = 0.3;
          break;
        case strengthDiff > -15 && strengthDiff <= -8:
          team1WinProb = 0.28;
          drawProb = 0.35;
          break;
        case strengthDiff > -8 && strengthDiff <= -3:
          team1WinProb = 0.3;
          drawProb = 0.38;
          break;
        case strengthDiff > -3 && strengthDiff < 0:
          team1WinProb = 0.32;
          drawProb = 0.4;
          break;
        case strengthDiff >= 0 && strengthDiff < 3:
          team1WinProb = 0.38;
          drawProb = 0.4;
          break;
        case strengthDiff >= 3 && strengthDiff < 8:
          team1WinProb = 0.42;
          drawProb = 0.38;
          break;
        case strengthDiff >= 8 && strengthDiff < 15:
          team1WinProb = 0.45;
          drawProb = 0.35;
          break;
        case strengthDiff >= 15 && strengthDiff < 25:
          team1WinProb = 0.5;
          drawProb = 0.3;
          break;
        case strengthDiff >= 25 && strengthDiff < 40:
          team1WinProb = 0.55;
          drawProb = 0.25;
          break;
        case strengthDiff >= 40 && strengthDiff < 60:
          team1WinProb = 0.65;
          drawProb = 0.2;
          break;
        case strengthDiff >= 60 && strengthDiff < 80:
          team1WinProb = 0.75;
          drawProb = 0.15;
          break;
        case strengthDiff >= 80:
          team1WinProb = 0.85;
          drawProb = 0.1;
          break;
        default:
          team1WinProb = 0.33;
          drawProb = 0.34;
          break;
      }

      const random = Math.random();

      if (random < team1WinProb) {
        team1.points += 3;
      } else if (random < team1WinProb + drawProb) {
        team1.points += 1;
        team2.points += 1;
      } else {
        team2.points += 3;
      }
    }
  }

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return 0;
  });

  return standings;
}

async function generateConfederationLog(confederation, teams, runs = 1000000) {
  if (!teams || teams.length === 0) {
    console.log(`No teams found for ${confederation}. Skipping...`);
    return;
  }

  console.log(
    `\n🔄 Generating log for ${confederation} (${runs} simulations)...`
  );

  const positionsCount = new Map();

  // Initialize map with team strength reference
  const teamStrengthMap = new Map();
  teams.forEach((team) => {
    teamStrengthMap.set(team.name, team.strength);
    positionsCount.set(team.name, {});
  });

  // Run simulations
  for (let r = 0; r < runs; r++) {
    const standings = League(teams);
    for (let i = 0; i < standings.length; i++) {
      const team = standings[i];
      const teamName = team.name;
      const countsObj = positionsCount.get(teamName);
      const posKey = String(i + 1);
      countsObj[posKey] = (countsObj[posKey] || 0) + 1;
    }

    // Progress indicator
    if ((r + 1) % 100000 === 0) {
      const pct = (((r + 1) / runs) * 100).toFixed(1);
      process.stdout.write(`\r   Progress: ${pct}%`);
    }
  }

  console.log(`\r   Progress: 100.0% ✓`);

  const totalPositions = teams.length;

  // Build positions object inserting teams from strongest to weakest
  const sortedTeams = [...teams].sort(
    (a, b) => (b.strength ?? 0) - (a.strength ?? 0)
  );

  const positions = {};
  for (const team of sortedTeams) {
    const teamName = team.name;
    const counts = positionsCount.get(teamName);
    const pctByPos = {};

    for (let pos = 1; pos <= totalPositions; pos++) {
      const key = String(pos);
      const count = counts[key] || 0;
      const pct = (count / runs) * 100;
      pctByPos[key] = Math.round(pct * 100) / 100;
    }

    positions[teamName] = {
      strength: team.strength,
      ...pctByPos,
    };
  }

  const log = {
    runs,
    confederation,
    generatedAt: new Date().toISOString(),
    positions,
  };

  // Ensure Tests directory exists
  const testsDir = new URL("../../Tests", import.meta.url);
  try {
    await mkdir(testsDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }

  const filename = `${confederation.toLowerCase()}-log.json`;
  const outUrl = new URL(`../../Tests/${filename}`, import.meta.url);
  await writeFile(outUrl, JSON.stringify(log, null, 2), "utf-8");
  console.log(`   ✅ Saved to: Tests/${filename}`);
}

async function generateAllConfederationLogs({ runs = 1000000 } = {}) {
  console.log("=".repeat(60));
  console.log("  CONFEDERATION STATISTICS LOG GENERATOR");
  console.log("=".repeat(60));
  console.log(
    `  Total simulations per confederation: ${runs.toLocaleString()}`
  );
  console.log("=".repeat(60));

  const data = await loadDatabase();
  const confederations = processData(data);

  const confederationList = [
    { name: "CONMEBOL", teams: confederations.CONMEBOL },
    { name: "CONCACAF", teams: confederations.CONCACAF },
    { name: "CAF", teams: confederations.CAF },
    { name: "AFC", teams: confederations.AFC },
    { name: "UEFA", teams: confederations.UEFA },
    { name: "OFC", teams: confederations.OFC },
  ];

  for (const { name, teams } of confederationList) {
    await generateConfederationLog(name, teams, runs);
  }

  console.log("\n" + "=".repeat(60));
  console.log("  ✅ ALL LOGS GENERATED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\nGenerated files:");
  console.log("  - Tests/conmebol-log.json");
  console.log("  - Tests/concacaf-log.json");
  console.log("  - Tests/caf-log.json");
  console.log("  - Tests/afc-log.json");
  console.log("  - Tests/uefa-log.json");
  console.log("  - Tests/ofc-log.json");
  console.log("=".repeat(60) + "\n");
}

// Parse CLI args: --runs=N
const runsArg = process.argv.find((arg) => arg.startsWith("--runs="));
const runs = runsArg ? parseInt(runsArg.split("=")[1], 10) : 1000000;

generateAllConfederationLogs({ runs }).catch((err) => {
  console.error("Error generating confederation logs:", err);
  process.exit(1);
});
