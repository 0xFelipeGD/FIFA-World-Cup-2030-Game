import {
  renderQualifiedTeams,
  showLoading,
  setButtonEnabled,
  addQualifyButtonListener,
  addResetButtonListener,
  addDrawGroupsButtonListener,
  clearQualifiedList,
  toggleButtons,
  showQualifyButton,
  renderGroups,
  renderSingleGroup,
  showGroupSimulating,
  clearGroups,
  renderRoundOf16,
} from "./dom.js";

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

async function loadDatabase() {
  const response = await fetch("../Database/database.json");
  const data = await response.json();
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

// ============================================================================
// GAME SIMULATION ENGINE
// ============================================================================

function simulateLeague(teams) {
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
  });

  return standings;
}

function simulatePlayoff(team1, team2) {
  const strengthDiff = team1.strength - team2.strength;
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
  let Winner;

  if (random < team1WinProb) {
    Winner = team1;
  } else if (random < team1WinProb + drawProb) {
    Winner = Math.random() < 0.5 ? team1 : team2;
  } else {
    Winner = team2;
  }

  return Winner;
}

// ============================================================================
// CONFEDERATION QUALIFICATION PROCESSES
// ============================================================================

function qualifyCONMEBOL(data) {
  const Teams = processData(data).CONMEBOL;
  const qualifiedTeams = [];

  // League Phase
  const leagueStandings = simulateLeague(Teams);
  qualifiedTeams.push(...leagueStandings.slice(0, 4));
  console.log("The teams directly qualified from the league phase are:");
  console.table(qualifiedTeams);

  // Selection of teams that will play the Play-Ins
  const teamForPlayoffs = leagueStandings.slice(4, 10);
  console.log("The teams that will play the playoffs are:");
  console.table(teamForPlayoffs);

  // Playin- Round 1
  const qualified1 = simulatePlayoff(teamForPlayoffs[0], teamForPlayoffs[1]);
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-In spot goes to: ${qualified1.name}, congratulations!`
  );

  // Playin - Round 2
  const qualified2 = simulatePlayoff(teamForPlayoffs[2], teamForPlayoffs[3]);
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-In spot goes to: ${qualified2.name}, congratulations!`
  );

  // Playin - Round 3
  const qualified3 = simulatePlayoff(teamForPlayoffs[4], teamForPlayoffs[5]);
  qualifiedTeams.push(qualified3);
  console.log(
    `The third Play-In spot goes to: ${qualified3.name}, congratulations!`
  );

  // Determine losing teams for final play-in
  const losers = [
    qualified2 === teamForPlayoffs[2] ? teamForPlayoffs[3] : teamForPlayoffs[2],
    qualified3 === teamForPlayoffs[4] ? teamForPlayoffs[5] : teamForPlayoffs[4],
  ];

  const playinWinner = simulatePlayoff(losers[0], losers[1]);

  // Final playin
  const finalOpponent =
    qualified1 === teamForPlayoffs[0] ? teamForPlayoffs[1] : teamForPlayoffs[0];
  const qualified4 = simulatePlayoff(finalOpponent, playinWinner);
  qualifiedTeams.push(qualified4);
  console.log(
    `The last Play-In spot goes to: ${qualified4.name}, congratulations!`
  );

  return qualifiedTeams;
}

function qualifyCAF(data) {
  const Teams = processData(data).CAF;

  console.log(`CAF teams before filtering: ${Teams.length}`);

  // Filter out host nation (Morocco)
  const filteredTeams = Teams.filter((team) => team.name !== "Morocco");

  console.log(`CAF teams after filtering: ${filteredTeams.length}`);

  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  const qualifiedTeamsC = [];
  filteredTeams.sort((a, b) => b.strength - a.strength);
  const TeamsA = filteredTeams.slice(0, 16);
  const TeamsB = filteredTeams.slice(16, 32);
  const TeamsC = filteredTeams.slice(32, 39);

  // League A
  const leagueStandings = simulateLeague(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 5));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league A are:");
  console.table(qualifiedTeams);

  // League B
  const leagueStandingsB = simulateLeague(TeamsB);
  qualifiedTeams.push(...leagueStandingsB.slice(0, 4));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams directly qualified from the league B are:");
  console.table(qualifiedTeamsB);

  // League C
  const leagueStandingsC = simulateLeague(TeamsC);
  qualifiedTeams.push(...leagueStandingsC.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsC);
  console.log("The teams directly qualified from the league C are:");
  console.table(qualifiedTeamsC);

  return qualifiedTeams;
}

function qualifyCONCACAF(data) {
  const Teams = processData(data).CONCACAF;
  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 11);
  const TeamsB = Teams.slice(11, 20);

  // League A
  const leagueStandings = simulateLeague(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 6));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league phase are:");
  console.table(qualifiedTeams);

  // League B
  const leagueStandingsB = simulateLeague(TeamsB);
  qualifiedTeamsB.push(...leagueStandingsB.slice(0, 4));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams qualified for PLayoffs phase are:");
  console.table(qualifiedTeamsB);

  // Playoff- Round 1
  const qualified1 = simulatePlayoff(qualifiedTeamsB[0], qualifiedTeamsB[3]);
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-off spot goes to: ${qualified1.name}, congratulations!`
  );

  // Playin - Round 2
  const qualified2 = simulatePlayoff(qualifiedTeamsB[1], qualifiedTeamsB[2]);
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-off spot goes to: ${qualified2.name}, congratulations!`
  );

  return qualifiedTeams;
}

function qualifyAFC(data) {
  const Teams = processData(data).AFC;
  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  const qualifiedTeamsC = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 16);
  const TeamsB = Teams.slice(16, 32);
  const TeamsC = Teams.slice(32, 39);

  // League A
  const leagueStandings = simulateLeague(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 6));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league A are:");
  console.table(qualifiedTeams);

  // League B
  const leagueStandingsB = simulateLeague(TeamsB);
  qualifiedTeams.push(...leagueStandingsB.slice(0, 4));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams directly qualified from the league B are:");
  console.table(qualifiedTeamsB);

  // League C
  const leagueStandingsC = simulateLeague(TeamsC);
  qualifiedTeams.push(...leagueStandingsC.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsC);
  console.log("The teams directly qualified from the league C are:");
  console.table(qualifiedTeamsC);

  return qualifiedTeams;
}

function qualifyUEFA(data) {
  const Teams = processData(data).UEFA;

  console.log(`UEFA teams before filtering: ${Teams.length}`);

  // Filter out host nations (Portugal and Spain)
  const filteredTeams = Teams.filter(
    (team) => team.name !== "Portugal" && team.name !== "Spain"
  );

  console.log(`UEFA teams after filtering: ${filteredTeams.length}`);

  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  const qualifiedTeamsC = [];
  const qualifiedTeamsforPlayoffs = [];
  const playoffTeams = [];
  filteredTeams.sort((a, b) => b.strength - a.strength);
  const TeamsA = filteredTeams.slice(0, 16);
  const TeamsB = filteredTeams.slice(16, 36);
  const TeamsC = filteredTeams.slice(36, 51);

  // League A
  const leagueStandings = simulateLeague(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 8));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league A are:");
  console.table(qualifiedTeams);
  console.log("The teams that dont make the cut");
  const playoffsATeams = leagueStandings.slice(8, 14);
  console.table(playoffsATeams);

  // League B
  const leagueStandingsB = simulateLeague(TeamsB);
  qualifiedTeams.push(...leagueStandingsB.slice(0, 6));
  qualifiedTeamsB.push(...leagueStandingsB.slice(0, 6));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams directly qualified from the league B are:");
  console.table(qualifiedTeamsB);
  console.log("The teams that dont make the cut");
  const playoffsBTeams = leagueStandingsB.slice(6, 13);
  console.table(playoffsBTeams);

  // League C
  const leagueStandingsC = simulateLeague(TeamsC);
  qualifiedTeams.push(...leagueStandingsC.slice(0, 2));
  qualifiedTeamsC.push(...leagueStandingsC.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsC);
  console.log("The teams directly qualified from the league C are:");
  console.table(qualifiedTeamsC);
  console.log("The teams that dont make the cut");
  const playoffsCTeams = leagueStandingsC.slice(2, 4);
  console.table(playoffsCTeams);

  // Playoffs
  playoffTeams.push(...playoffsATeams, ...playoffsBTeams, ...playoffsCTeams);
  console.log("The teams in the Playoffs are:");
  console.table(playoffTeams);

  //Playoffs League
  const leagueStandingsD = simulateLeague(playoffTeams);
  qualifiedTeamsforPlayoffs.push(...leagueStandingsD.slice(0, 9));
  console.log("The final classification are:");
  console.table(leagueStandingsD);
  console.log("The teams qualified for the playoffs are:");
  console.table(qualifiedTeamsforPlayoffs);

  // Playin- Round 1
  const qualified1 = simulatePlayoff(
    qualifiedTeamsforPlayoffs[0],
    qualifiedTeamsforPlayoffs[8]
  );
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-In spot goes to: ${qualified1.name}, congratulations!`
  );

  // Playin - Round 2
  const qualified2 = simulatePlayoff(
    qualifiedTeamsforPlayoffs[1],
    qualifiedTeamsforPlayoffs[7]
  );
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-In spot goes to: ${qualified2.name}, congratulations!`
  );

  // Playin - Round 3
  const qualified3 = simulatePlayoff(
    qualifiedTeamsforPlayoffs[2],
    qualifiedTeamsforPlayoffs[6]
  );
  qualifiedTeams.push(qualified3);
  console.log(
    `The third Play-In spot goes to: ${qualified3.name}, congratulations!`
  );

  // Playin - Round 4
  const qualified4 = simulatePlayoff(
    qualifiedTeamsforPlayoffs[3],
    qualifiedTeamsforPlayoffs[5]
  );
  qualifiedTeams.push(qualified4);
  console.log(
    `The final Play-In spot goes to: ${qualified4.name}, congratulations!`
  );

  return qualifiedTeams;
}

function qualifyOFC(data) {
  const Teams = processData(data).OFC;
  const qualifiedTeams = [];
  const qualifiedweekTeams = [];
  const qualifiedATeams = [];
  const qualifiedBTeams = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 6);
  const TeamsW = Teams.slice(6, 11);

  // League W
  const leagueStandingsW = simulateLeague(TeamsW);
  qualifiedweekTeams.push(...leagueStandingsW.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsW);
  console.log("The teams qualified from the league W are:");
  console.table(qualifiedweekTeams);
  TeamsA.push(...leagueStandingsW.slice(0, 2));

  // Groups formation

  // Shuffle TeamsA array randomly
  const shuffled = [...TeamsA].sort(() => Math.random() - 0.5);
  // Divide into two groups of 4 teams each
  const GroupA = shuffled.slice(0, 4);
  const GroupB = shuffled.slice(4, 8);
  console.log("Group A:");
  console.table(GroupA);
  console.log("Group B:");
  console.table(GroupB);

  // League A
  const leagueStandingsA = simulateLeague(GroupA);
  qualifiedATeams.push(...leagueStandingsA.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsA);
  console.log("The teams qualified from the Group A are:");
  console.table(qualifiedATeams);

  // League B
  const leagueStandingsB = simulateLeague(GroupB);
  qualifiedBTeams.push(...leagueStandingsB.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams qualified from the Group A are:");
  console.table(qualifiedBTeams);

  //Play in 1
  const qualified1 = simulatePlayoff(qualifiedATeams[0], qualifiedBTeams[1]);
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-In spot goes to: ${qualified1.name}, congratulations!`
  );

  //Play in 2
  const qualified2 = simulatePlayoff(qualifiedATeams[1], qualifiedBTeams[0]);
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-In spot goes to: ${qualified2.name}, congratulations!`
  );

  return qualifiedTeams;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let qualifiedTeamsCONMEBOL = [];
let qualifiedTeamsCONCACAF = [];
let qualifiedTeamsUEFA = [];
let qualifiedTeamsCAF = [];
let qualifiedTeamsAFC = [];
let qualifiedTeamsOFC = [];
let currentGroups = [];

// ============================================================================
// QUALIFICATION WORKFLOW
// ============================================================================

async function runQualificationProcess() {
  // Prepare UI
  setButtonEnabled(false);
  clearQualifiedList("conmebol-teams-list");
  clearQualifiedList("concacaf-teams-list");
  clearQualifiedList("caf-teams-list");
  clearQualifiedList("afc-teams-list");
  clearQualifiedList("uefa-teams-list");
  clearQualifiedList("ofc-teams-list");
  showLoading("conmebol-teams-list");
  showLoading("concacaf-teams-list");
  showLoading("caf-teams-list");
  showLoading("afc-teams-list");
  showLoading("uefa-teams-list");
  showLoading("ofc-teams-list");

  // Load database
  const data = await loadDatabase();

  // Run qualification
  qualifiedTeamsCONMEBOL = qualifyCONMEBOL(data);
  qualifiedTeamsCONCACAF = qualifyCONCACAF(data);
  qualifiedTeamsUEFA = qualifyUEFA(data);
  qualifiedTeamsCAF = qualifyCAF(data);
  qualifiedTeamsAFC = qualifyAFC(data);
  qualifiedTeamsOFC = qualifyOFC(data);

  // Render results in the DOM
  clearQualifiedList("conmebol-teams-list");
  clearQualifiedList("concacaf-teams-list");
  clearQualifiedList("caf-teams-list");
  clearQualifiedList("afc-teams-list");
  clearQualifiedList("uefa-teams-list");
  clearQualifiedList("ofc-teams-list");
  renderQualifiedTeams(qualifiedTeamsAFC, "afc-teams-list");
  renderQualifiedTeams(qualifiedTeamsCAF, "caf-teams-list");
  renderQualifiedTeams(qualifiedTeamsCONMEBOL, "conmebol-teams-list");
  renderQualifiedTeams(qualifiedTeamsCONCACAF, "concacaf-teams-list");
  renderQualifiedTeams(qualifiedTeamsUEFA, "uefa-teams-list");
  renderQualifiedTeams(qualifiedTeamsOFC, "ofc-teams-list");

  setButtonEnabled(true);
  toggleButtons(); // Switch to reset button after qualification

  // Update the title
  const mainTitle = document.getElementById("main-title");
  if (mainTitle) {
    mainTitle.textContent = "Re-Qualify teams or make the Draw";
  }
}

function resetAndQualify() {
  // Reset the title
  const mainTitle = document.getElementById("main-title");
  if (mainTitle) {
    mainTitle.textContent = "Press to Qualify teams";
  }

  showQualifyButton();
  runQualificationProcess();
}

// ============================================================================
// WORLD CUP DRAW SYSTEM
// ============================================================================

function processQualifiedTeams() {
  const QualifiedTeams = [];
  QualifiedTeams.push(
    ...qualifiedTeamsCONMEBOL,
    ...qualifiedTeamsCONCACAF,
    ...qualifiedTeamsUEFA,
    ...qualifiedTeamsCAF,
    ...qualifiedTeamsAFC,
    ...qualifiedTeamsOFC
  );

  QualifiedTeams.forEach((team) => (team.points = 0));
  QualifiedTeams.sort((a, b) => b.strength - a.strength);

  console.log(`Total qualified teams: ${QualifiedTeams.length}`);

  // Pot A will have 13 teams (16 - 3 host nations)
  const A = QualifiedTeams.slice(0, 13);
  const B = QualifiedTeams.slice(13, 29); // 16 teams
  const C = QualifiedTeams.slice(29, 45); // 16 teams
  const D = QualifiedTeams.slice(45, 61); // 16 teams

  console.log(
    `Pot A: ${A.length} teams, Pot B: ${B.length} teams, Pot C: ${C.length} teams, Pot D: ${D.length} teams`
  );

  const Pots = [];
  Pots.push(A, B, C, D);

  return Pots;
}

function performDraw() {
  const maxAttempts = 200;
  let attempt = 0;

  // Define host nations (always in Groups A, B, and C)
  const hostNations = [
    {
      name: "Portugal",
      code: "PT",
      flag: "https://media.api-sports.io/flags/pt.svg",
      confederation: "UEFA",
      strength: 87,
      points: 0,
    },
    {
      name: "Spain",
      code: "ES",
      flag: "https://media.api-sports.io/flags/es.svg",
      confederation: "UEFA",
      strength: 89,
      points: 0,
    },
    {
      name: "Morocco",
      code: "MA",
      flag: "https://media.api-sports.io/flags/ma.svg",
      confederation: "CAF",
      strength: 76,
      points: 0,
    },
  ];

  while (attempt < maxAttempts) {
    attempt++;

    const groups = Array.from({ length: 16 }, () => []);
    const confederationCount = groups.map(() => ({}));

    // Place host nations in Groups A, B, and C
    groups[0].push(hostNations[0]); // Portugal in Group A
    groups[1].push(hostNations[1]); // Spain in Group B
    groups[2].push(hostNations[2]); // Morocco in Group C

    // Initialize confederation counts for host nations
    confederationCount[0]["UEFA"] = 1; // Portugal
    confederationCount[1]["UEFA"] = 1; // Spain
    confederationCount[2]["CAF"] = 1; // Morocco

    console.log(
      `Tentativa ${attempt}: Anfitriões colocados nos grupos A, B, C`
    );

    const Pots = processQualifiedTeams();

    let drawFailed = false;

    // Process each pot sequentially to ensure one team from each pot per group
    for (let potIndex = 0; potIndex < Pots.length; potIndex++) {
      const pot = [...Pots[potIndex]];
      pot.sort(() => Math.random() - 0.5); // Shuffle the pot

      const groupIndices = Array.from({ length: 16 }, (_, i) => i);
      groupIndices.sort(() => Math.random() - 0.5); // Shuffle group order

      const unplacedInPot = [];

      // Try to place each team from this pot
      for (const team of pot) {
        let placed = false;

        for (const groupIndex of groupIndices) {
          // For Pot A (potIndex 0), skip groups 0, 1, 2 (A, B, C) as they already have host nations
          if (potIndex === 0 && groupIndex < 3) continue;

          // Check if this group already has a team from this pot
          // Groups A, B, C already have a team from "pot 0" (host nations), so they need teams from pot 1, 2, 3
          // Other groups need teams from pot 0, 1, 2, 3
          const currentTeamCount = groups[groupIndex].length;

          // For groups A, B, C: they already have 1 team, so at potIndex 0 they should still have 1, at potIndex 1 they should have 2, etc.
          // For other groups: at potIndex 0 they should have 1, at potIndex 1 they should have 2, etc.
          const expectedTeamsAfterThisPot = potIndex + 1;
          if (currentTeamCount >= expectedTeamsAfterThisPot) continue;

          const confCount = confederationCount[groupIndex];
          const confederation = team.confederation;
          const currentConfCount = confCount[confederation] || 0;
          const maxAllowed = confederation === "UEFA" ? 2 : 1;

          if (currentConfCount < maxAllowed) {
            groups[groupIndex].push(team);
            confCount[confederation] = currentConfCount + 1;
            placed = true;
            break;
          }
        }

        if (!placed) {
          unplacedInPot.push(team);
        }
      }

      // If we couldn't place all teams from this pot, restart the draw
      if (unplacedInPot.length > 0) {
        drawFailed = true;
        break;
      }
    }

    if (drawFailed) {
      continue; // Try again
    }

    // Verify that all groups have at least one UEFA team
    const allGroupsHaveUEFA = groups.every((group) =>
      group.some((team) => team.confederation === "UEFA")
    );

    // Verify that all groups have exactly 4 teams (one from each pot)
    const allGroupsComplete = groups.every((group) => group.length === 4);

    if (allGroupsHaveUEFA && allGroupsComplete) {
      console.log(`✅ Sorteio bem-sucedido na tentativa ${attempt}!`);

      // Log verification
      groups.forEach((group, idx) => {
        const groupName = String.fromCharCode(65 + idx);
        const confs = group.map((t) => t.confederation);
        const hasUEFA = confs.includes("UEFA");
        console.log(
          `Grupo ${groupName}: ${confs.join(", ")} - UEFA: ${
            hasUEFA ? "✓" : "✗"
          }`
        );
      });

      return groups;
    }
  }

  // If we couldn't complete the draw after max attempts, return null
  console.error(
    `❌ ERRO: Não foi possível completar o sorteio após ${maxAttempts} tentativas!`
  );
  alert("Erro no sorteio. Por favor, tente novamente.");
  return null;
}

function drawGroups() {
  // Clear all confederation lists
  clearQualifiedList("conmebol-teams-list");
  clearQualifiedList("concacaf-teams-list");
  clearQualifiedList("caf-teams-list");
  clearQualifiedList("afc-teams-list");
  clearQualifiedList("uefa-teams-list");
  clearQualifiedList("ofc-teams-list");

  // Show loading state
  showLoading("conmebol-teams-list");
  showLoading("concacaf-teams-list");
  showLoading("caf-teams-list");
  showLoading("afc-teams-list");
  showLoading("uefa-teams-list");
  showLoading("ofc-teams-list");

  // Perform the draw
  const groups = performDraw();

  // Clear loading states
  clearQualifiedList("conmebol-teams-list");
  clearQualifiedList("concacaf-teams-list");
  clearQualifiedList("caf-teams-list");
  clearQualifiedList("afc-teams-list");
  clearQualifiedList("uefa-teams-list");
  clearQualifiedList("ofc-teams-list");

  // Check if draw was successful
  if (!groups) {
    // Show error and restore qualified teams
    renderQualifiedTeams(qualifiedTeamsAFC, "afc-teams-list");
    renderQualifiedTeams(qualifiedTeamsCAF, "caf-teams-list");
    renderQualifiedTeams(qualifiedTeamsCONMEBOL, "conmebol-teams-list");
    renderQualifiedTeams(qualifiedTeamsCONCACAF, "concacaf-teams-list");
    renderQualifiedTeams(qualifiedTeamsUEFA, "uefa-teams-list");
    renderQualifiedTeams(qualifiedTeamsOFC, "ofc-teams-list");
    return;
  }

  // Show redraw button and play world cup button
  const resetButton = document.getElementById("reset-button");
  const drawGroupsButton = document.getElementById("draw-groups-button");
  const redrawGroupsButton = document.getElementById("redraw-groups-button");
  const playWorldCupButton = document.getElementById("play-world-cup-button");

  if (resetButton) {
    resetButton.style.display = "none";
  }
  if (drawGroupsButton) {
    drawGroupsButton.style.display = "none";
  }
  if (redrawGroupsButton) {
    redrawGroupsButton.style.display = "inline-block";
  }
  if (playWorldCupButton) {
    playWorldCupButton.style.display = "inline-block";
  }

  // Update the title
  const mainTitle = document.getElementById("main-title");
  if (mainTitle) {
    mainTitle.textContent = "Re-Draw or Play the Cup";
  }

  // Store the groups globally
  currentGroups = groups;

  // Render the groups
  renderGroups(groups);
}

function redrawGroups() {
  drawGroups();
}

// ============================================================================
// WORLD CUP GROUP STAGE SIMULATION
// ============================================================================

async function playWorldCupGroups() {
  // Check if we have groups drawn
  if (!currentGroups || currentGroups.length === 0) {
    alert("Erro: Nenhum grupo sorteado. Por favor, faça o sorteio primeiro.");
    return;
  }

  // Disable buttons during simulation
  const playWorldCupButton = document.getElementById("play-world-cup-button");
  const redrawGroupsButton = document.getElementById("redraw-groups-button");

  if (playWorldCupButton) {
    playWorldCupButton.disabled = true;
  }
  if (redrawGroupsButton) {
    redrawGroupsButton.disabled = true;
  }

  // Update the title
  const mainTitle = document.getElementById("main-title");
  if (mainTitle) {
    mainTitle.textContent = "Simulating Groups...";
  }

  // Create a deep copy of current groups to avoid mutating the original
  const groupsToPlay = currentGroups.map((group) =>
    group.map((team) => ({ ...team, points: 0 }))
  );

  // Simulate and render each group progressively
  const updatedGroups = [];

  for (let i = 0; i < groupsToPlay.length; i++) {
    // Show "Simulando..." for current group
    showGroupSimulating(i);

    // Wait for 0.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate the league for this group
    const simulatedGroup = simulateLeague(groupsToPlay[i]);
    updatedGroups.push(simulatedGroup);

    // Render the simulated group
    renderSingleGroup(simulatedGroup, i);
  }

  // Store the updated groups
  currentGroups = updatedGroups;

  // Re-enable buttons
  if (playWorldCupButton) {
    playWorldCupButton.disabled = false;
  }
  if (redrawGroupsButton) {
    redrawGroupsButton.disabled = false;
  }

  // Hide the "Play World Cup Groups" button and show "Initiate Playoffs" button
  const initiatePlayoffsButton = document.getElementById(
    "initiate-playoffs-button"
  );

  if (playWorldCupButton) {
    playWorldCupButton.style.display = "none";
  }
  if (initiatePlayoffsButton) {
    initiatePlayoffsButton.style.display = "inline-block";
  }

  // Change the redraw button function to replay groups
  if (redrawGroupsButton) {
    // Remove old event listener by cloning the button
    const newRedrawButton = redrawGroupsButton.cloneNode(true);
    redrawGroupsButton.parentNode.replaceChild(
      newRedrawButton,
      redrawGroupsButton
    );
    // Add new event listener to replay groups
    newRedrawButton.addEventListener("click", replayWorldCupGroups);
  }

  // Update the title
  if (mainTitle) {
    mainTitle.textContent = "Groups Complete - Ready for Playoffs";
  }
}

async function replayWorldCupGroups() {
  // Check if we have groups drawn
  if (!currentGroups || currentGroups.length === 0) {
    alert("Erro: Nenhum grupo sorteado. Por favor, faça o sorteio primeiro.");
    return;
  }

  // Disable buttons during simulation
  const redrawGroupsButton = document.getElementById("redraw-groups-button");
  const initiatePlayoffsButton = document.getElementById(
    "initiate-playoffs-button"
  );

  if (redrawGroupsButton) {
    redrawGroupsButton.disabled = true;
  }
  if (initiatePlayoffsButton) {
    initiatePlayoffsButton.disabled = true;
  }

  // Update the title
  const mainTitle = document.getElementById("main-title");
  if (mainTitle) {
    mainTitle.textContent = "Simulando grupos...";
  }

  // Create a deep copy of current groups to avoid mutating the original
  // Reset points for all teams
  const groupsToPlay = currentGroups.map((group) =>
    group.map((team) => ({ ...team, points: 0 }))
  );

  // Simulate and render each group progressively
  const updatedGroups = [];

  for (let i = 0; i < groupsToPlay.length; i++) {
    // Show "Simulando..." for current group
    showGroupSimulating(i);

    // Wait for 0.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate the league for this group
    const simulatedGroup = simulateLeague(groupsToPlay[i]);
    updatedGroups.push(simulatedGroup);

    // Render the simulated group
    renderSingleGroup(simulatedGroup, i);
  }

  // Store the updated groups
  currentGroups = updatedGroups;

  // Re-enable buttons
  if (redrawGroupsButton) {
    redrawGroupsButton.disabled = false;
  }
  if (initiatePlayoffsButton) {
    initiatePlayoffsButton.disabled = false;
  }

  // Update the title
  if (mainTitle) {
    mainTitle.textContent = "Groups Complete - Ready for Playoffs";
  }
}

// ============================================================================
// KNOCKOUT STAGE (PLAYOFFS)
// ============================================================================

function initiatePlayoffs() {
  const firsts = currentGroups.map((group) => group[0]);
  const seconds = currentGroups.map((group) => group[1]);

  // Shuffle both arrays randomly
  firsts.sort(() => Math.random() - 0.5);
  seconds.sort(() => Math.random() - 0.5);

  //define matches
  const matches = [];
  matches.push([firsts[0], seconds[0]]);
  matches.push([firsts[1], seconds[1]]);
  matches.push([firsts[2], seconds[2]]);
  matches.push([firsts[3], seconds[3]]);
  matches.push([firsts[4], seconds[4]]);
  matches.push([firsts[5], seconds[5]]);
  matches.push([firsts[6], seconds[6]]);
  matches.push([firsts[7], seconds[7]]);
  matches.push([firsts[8], seconds[8]]);
  matches.push([firsts[9], seconds[9]]);
  matches.push([firsts[10], seconds[10]]);
  matches.push([firsts[11], seconds[11]]);
  matches.push([firsts[12], seconds[12]]);
  matches.push([firsts[13], seconds[13]]);
  matches.push([firsts[14], seconds[14]]);
  matches.push([firsts[15], seconds[15]]);

  // Clear the groups display
  clearGroups();

  // Render the Round of 16 matches
  renderRoundOf16(matches);

  // Update the title
  const mainTitle = document.getElementById("main-title");
  if (mainTitle) {
    mainTitle.textContent = "Round of 16 - Knockout Stage";
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Add click event listener to the qualify button
  addQualifyButtonListener(runQualificationProcess);
  // Add click event listener to the reset button
  addResetButtonListener(resetAndQualify);
  // Add click event listener to the draw groups button
  addDrawGroupsButtonListener(drawGroups);
  // Add click event listener to the redraw groups button
  const redrawGroupsButton = document.getElementById("redraw-groups-button");
  if (redrawGroupsButton) {
    redrawGroupsButton.addEventListener("click", redrawGroups);
  }
  // Add click event listener to the play world cup button
  const playWorldCupButton = document.getElementById("play-world-cup-button");
  if (playWorldCupButton) {
    playWorldCupButton.addEventListener("click", playWorldCupGroups);
  }
  // Add click event listener to the initiate playoffs button
  const initiatePlayoffsButton = document.getElementById(
    "initiate-playoffs-button"
  );
  if (initiatePlayoffsButton) {
    initiatePlayoffsButton.addEventListener("click", initiatePlayoffs);
  }
});
