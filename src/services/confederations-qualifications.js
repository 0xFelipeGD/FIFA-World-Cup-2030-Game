import { loadDatabase, processData } from "./data-management.js";
import { simulateLeague, simulatePlayoff } from "./football.js";

// ============================================================================
// CONFEDERATION QUALIFICATION PROCESSES
// ============================================================================

export function qualifyCONMEBOL(data) {
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

export function qualifyCAF(data) {
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

export function qualifyCONCACAF(data) {
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

export function qualifyAFC(data) {
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

export function qualifyUEFA(data) {
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

export function qualifyOFC(data) {
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
