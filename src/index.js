import {
  renderQualifiedTeams,
  showLoading,
  showError,
  setButtonEnabled,
  addQualifyButtonListener,
  addResetButtonListener,
  addDrawGroupsButtonListener,
  clearQualifiedList,
  toggleButtons,
  showQualifyButton,
} from "./dom.js";

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
  });

  return standings;
}

function Playoffs(team1, team2) {
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

function CONMEBOLQualify(data) {
  const Teams = processData(data).CONMEBOL;
  const qualifiedTeams = [];

  // League Phase
  const leagueStandings = League(Teams);
  qualifiedTeams.push(...leagueStandings.slice(0, 4));
  console.log("The teams directly qualified from the league phase are:");
  console.table(qualifiedTeams);

  // Selection of teams that will play the Play-Ins
  const teamForPlayoffs = leagueStandings.slice(4, 10);
  console.log("The teams that will play the playoffs are:");
  console.table(teamForPlayoffs);

  // Playin- Round 1
  const qualified1 = Playoffs(teamForPlayoffs[0], teamForPlayoffs[1]);
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-In spot goes to: ${qualified1.name}, congratulations!`
  );

  // Playin - Round 2
  const qualified2 = Playoffs(teamForPlayoffs[2], teamForPlayoffs[3]);
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-In spot goes to: ${qualified2.name}, congratulations!`
  );

  // Playin - Round 3
  const qualified3 = Playoffs(teamForPlayoffs[4], teamForPlayoffs[5]);
  qualifiedTeams.push(qualified3);
  console.log(
    `The third Play-In spot goes to: ${qualified3.name}, congratulations!`
  );

  // Determine losing teams for final play-in
  const losers = [
    qualified2 === teamForPlayoffs[2] ? teamForPlayoffs[3] : teamForPlayoffs[2],
    qualified3 === teamForPlayoffs[4] ? teamForPlayoffs[5] : teamForPlayoffs[4],
  ];

  const playinWinner = Playoffs(losers[0], losers[1]);

  // Final playin
  const finalOpponent =
    qualified1 === teamForPlayoffs[0] ? teamForPlayoffs[1] : teamForPlayoffs[0];
  const qualified4 = Playoffs(finalOpponent, playinWinner);
  qualifiedTeams.push(qualified4);
  console.log(
    `The last Play-In spot goes to: ${qualified4.name}, congratulations!`
  );

  return qualifiedTeams;
}

function CAFQualify(data) {
  const Teams = processData(data).CAF;
  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  const qualifiedTeamsC = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 16);
  const TeamsB = Teams.slice(16, 32);
  const TeamsC = Teams.slice(32, 39);

  // League A
  const leagueStandings = League(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 6));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league A are:");
  console.table(qualifiedTeams);

  // League B
  const leagueStandingsB = League(TeamsB);
  qualifiedTeams.push(...leagueStandingsB.slice(0, 4));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams directly qualified from the league B are:");
  console.table(qualifiedTeamsB);

  // League C
  const leagueStandingsC = League(TeamsC);
  qualifiedTeams.push(...leagueStandingsC.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsC);
  console.log("The teams directly qualified from the league C are:");
  console.table(qualifiedTeamsC);

  return qualifiedTeams;
}

function CONCACAFQualify(data) {
  const Teams = processData(data).CONCACAF;
  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 11);
  const TeamsB = Teams.slice(11, 20);

  // League A
  const leagueStandings = League(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 6));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league phase are:");
  console.table(qualifiedTeams);

  // League B
  const leagueStandingsB = League(TeamsB);
  qualifiedTeamsB.push(...leagueStandingsB.slice(0, 4));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams qualified for PLayoffs phase are:");
  console.table(qualifiedTeamsB);

  // Playoff- Round 1
  const qualified1 = Playoffs(qualifiedTeamsB[0], qualifiedTeamsB[3]);
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-off spot goes to: ${qualified1.name}, congratulations!`
  );

  // Playin - Round 2
  const qualified2 = Playoffs(qualifiedTeamsB[1], qualifiedTeamsB[2]);
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-off spot goes to: ${qualified2.name}, congratulations!`
  );

  return qualifiedTeams;
}

function AFCQualify(data) {
  const Teams = processData(data).AFC;
  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  const qualifiedTeamsC = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 16);
  const TeamsB = Teams.slice(16, 32);
  const TeamsC = Teams.slice(32, 39);

  // League A
  const leagueStandings = League(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 6));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league A are:");
  console.table(qualifiedTeams);

  // League B
  const leagueStandingsB = League(TeamsB);
  qualifiedTeams.push(...leagueStandingsB.slice(0, 4));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams directly qualified from the league B are:");
  console.table(qualifiedTeamsB);

  // League C
  const leagueStandingsC = League(TeamsC);
  qualifiedTeams.push(...leagueStandingsC.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsC);
  console.log("The teams directly qualified from the league C are:");
  console.table(qualifiedTeamsC);

  return qualifiedTeams;
}

function UEFAQualify(data) {
  const Teams = processData(data).UEFA;
  const qualifiedTeams = [];
  const qualifiedTeamsB = [];
  const qualifiedTeamsC = [];
  const qualifiedTeamsforPlayoffs = [];
  const playoffTeams = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 16);
  const TeamsB = Teams.slice(16, 36);
  const TeamsC = Teams.slice(36, 53);

  // League A
  const leagueStandings = League(TeamsA);
  qualifiedTeams.push(...leagueStandings.slice(0, 10));
  console.log("The final classification are:");
  console.table(leagueStandings);
  console.log("The teams directly qualified from the league A are:");
  console.table(qualifiedTeams);
  console.log("The teams that dont make the cut");
  const playoffsATeams = leagueStandings.slice(10, 16);
  console.table(playoffsATeams);

  // League B
  const leagueStandingsB = League(TeamsB);
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
  const leagueStandingsC = League(TeamsC);
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
  const leagueStandingsD = League(playoffTeams);
  qualifiedTeamsforPlayoffs.push(...leagueStandingsD.slice(0, 9));
  console.log("The final classification are:");
  console.table(leagueStandingsD);
  console.log("The teams qualified for the playoffs are:");
  console.table(qualifiedTeamsforPlayoffs);

  // Playin- Round 1
  const qualified1 = Playoffs(
    qualifiedTeamsforPlayoffs[0],
    qualifiedTeamsforPlayoffs[8]
  );
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-In spot goes to: ${qualified1.name}, congratulations!`
  );

  // Playin - Round 2
  const qualified2 = Playoffs(
    qualifiedTeamsforPlayoffs[1],
    qualifiedTeamsforPlayoffs[7]
  );
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-In spot goes to: ${qualified2.name}, congratulations!`
  );

  // Playin - Round 3
  const qualified3 = Playoffs(
    qualifiedTeamsforPlayoffs[2],
    qualifiedTeamsforPlayoffs[6]
  );
  qualifiedTeams.push(qualified3);
  console.log(
    `The third Play-In spot goes to: ${qualified3.name}, congratulations!`
  );

  // Playin - Round 4
  const qualified4 = Playoffs(
    qualifiedTeamsforPlayoffs[3],
    qualifiedTeamsforPlayoffs[5]
  );
  qualifiedTeams.push(qualified4);
  console.log(
    `The final Play-In spot goes to: ${qualified4.name}, congratulations!`
  );

  return qualifiedTeams;
}

// Global variables to store qualified teams
let qualifiedTeamsCONMEBOL = [];
let qualifiedTeamsCONCACAF = [];
let qualifiedTeamsUEFA = [];
let qualifiedTeamsCAF = [];
let qualifiedTeamsAFC = [];
let qualifiedTeamsOFC = [];

function OFCQualify(data) {
  const Teams = processData(data).OFC;
  const qualifiedTeams = [];
  const qualifiedweekTeams = [];
  const qualifiedATeams = [];
  const qualifiedBTeams = [];
  Teams.sort((a, b) => b.strength - a.strength);
  const TeamsA = Teams.slice(0, 6);
  const TeamsW = Teams.slice(6, 11);

  // League W
  const leagueStandingsW = League(TeamsW);
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
  const leagueStandingsA = League(GroupA);
  qualifiedATeams.push(...leagueStandingsA.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsA);
  console.log("The teams qualified from the Group A are:");
  console.table(qualifiedATeams);

  // League B
  const leagueStandingsB = League(GroupB);
  qualifiedBTeams.push(...leagueStandingsB.slice(0, 2));
  console.log("The final classification are:");
  console.table(leagueStandingsB);
  console.log("The teams qualified from the Group A are:");
  console.table(qualifiedBTeams);

  //Play in 1
  const qualified1 = Playoffs(qualifiedATeams[0], qualifiedBTeams[1]);
  qualifiedTeams.push(qualified1);
  console.log(
    `The first Play-In spot goes to: ${qualified1.name}, congratulations!`
  );

  //Play in 2
  const qualified2 = Playoffs(qualifiedATeams[1], qualifiedBTeams[0]);
  qualifiedTeams.push(qualified2);
  console.log(
    `The second Play-In spot goes to: ${qualified2.name}, congratulations!`
  );

  return qualifiedTeams;
}

// Run and Render QUalifications
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
  qualifiedTeamsCONMEBOL = CONMEBOLQualify(data);
  qualifiedTeamsCONCACAF = CONCACAFQualify(data);
  qualifiedTeamsUEFA = UEFAQualify(data);
  qualifiedTeamsCAF = CAFQualify(data);
  qualifiedTeamsAFC = AFCQualify(data);
  qualifiedTeamsOFC = OFCQualify(data);

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
}

// Function to reset and run qualification again
function resetAndQualify() {
  showQualifyButton();
  runQualificationProcess();
}

// Function to Grab and processes qualified Teams
function QualifiedTeamsProcess() {
  const QualifiedTeams = [];
  QualifiedTeams.push(
    ...qualifiedTeamsCONMEBOL,
    ...qualifiedTeamsCONCACAF,
    ...qualifiedTeamsUEFA,
    ...qualifiedTeamsCAF,
    ...qualifiedTeamsAFC,
    ...qualifiedTeamsOFC
  );

  return QualifiedTeams;
}

// Function to draw groups (placeholder)
function drawGroups() {
  console.table(QualifiedTeamsProcess());
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add click event listener to the qualify button
  addQualifyButtonListener(runQualificationProcess);
  // Add click event listener to the reset button
  addResetButtonListener(resetAndQualify);
  // Add click event listener to the draw groups button
  addDrawGroupsButtonListener(drawGroups);
});
