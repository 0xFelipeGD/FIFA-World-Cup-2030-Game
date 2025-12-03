// ============================================================================
// GAME SIMULATION ENGINE
// ============================================================================

export function simulateLeague(teams) {
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

export function simulatePlayoff(team1, team2) {
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
