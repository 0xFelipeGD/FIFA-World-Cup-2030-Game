// ============================================================================
// IMPORTS
// ============================================================================
import { loadDatabase } from "./services/data-management.js";
import {
  qualifyCONMEBOL,
  qualifyCAF,
  qualifyCONCACAF,
  qualifyAFC,
  qualifyUEFA,
  qualifyOFC,
} from "./services/confederations-qualifications.js";
import { simulateLeague } from "./services/football.js";
import {
  clearAllConfederationLists,
  renderAllQualifications,
  showLoading,
  setButtonEnabled,
  setMainTitle,
  showPostQualificationButtons,
  showQualificationButtons,
  addButtonListener,
  replaceButtonListener,
  renderGroups,
  updateGroup,
  showGroupSimulating,
  showPostDrawButtons,
  showPostGroupsButtons,
  renderRoundOf8,
  showConfederationsView,
} from "./ui/dom.js";

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
  setButtonEnabled("qualify-button", false);
  clearAllConfederationLists();

  const confederations = ["conmebol", "concacaf", "caf", "afc", "uefa", "ofc"];
  confederations.forEach((confed) => {
    showLoading(`${confed}-teams-list`);
  });

  // Load database
  const data = await loadDatabase();

  // Run qualification
  qualifiedTeamsCONMEBOL = qualifyCONMEBOL(data);
  qualifiedTeamsCONCACAF = qualifyCONCACAF(data);
  qualifiedTeamsUEFA = qualifyUEFA(data);
  qualifiedTeamsCAF = qualifyCAF(data);
  qualifiedTeamsAFC = qualifyAFC(data);
  qualifiedTeamsOFC = qualifyOFC(data);

  // Render results
  renderAllQualifications({
    conmebol: qualifiedTeamsCONMEBOL,
    concacaf: qualifiedTeamsCONCACAF,
    caf: qualifiedTeamsCAF,
    afc: qualifiedTeamsAFC,
    uefa: qualifiedTeamsUEFA,
    ofc: qualifiedTeamsOFC,
  });

  // Update UI state
  showConfederationsView();
  setButtonEnabled("qualify-button", true);
  showPostQualificationButtons();
  setMainTitle("Re-Qualify teams or make the Draw");
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

  // Pot A will have 13 teams (16 - 3 host nations)
  const A = QualifiedTeams.slice(0, 13);
  const B = QualifiedTeams.slice(13, 29); // 16 teams
  const C = QualifiedTeams.slice(29, 45); // 16 teams
  const D = QualifiedTeams.slice(45, 61); // 16 teams
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
  // Show loading state
  clearAllConfederationLists();
  const confederations = ["conmebol", "concacaf", "caf", "afc", "uefa", "ofc"];
  confederations.forEach((confed) => {
    showLoading(`${confed}-teams-list`);
  });

  // Perform the draw
  const groups = performDraw();

  // Check if draw was successful
  if (!groups) {
    // Restore qualified teams on error
    renderAllQualifications({
      conmebol: qualifiedTeamsCONMEBOL,
      concacaf: qualifiedTeamsCONCACAF,
      caf: qualifiedTeamsCAF,
      afc: qualifiedTeamsAFC,
      uefa: qualifiedTeamsUEFA,
      ofc: qualifiedTeamsOFC,
    });
    return;
  }

  // Store and render groups
  currentGroups = groups;
  renderGroups(groups);

  // Update UI state
  showPostDrawButtons();
  setMainTitle("Re-Draw or Play the Cup");
}

// ============================================================================
// WORLD CUP GROUP STAGE SIMULATION
// ============================================================================

async function playWorldCupGroups() {
  // Validate groups exist
  if (!currentGroups || currentGroups.length === 0) {
    alert("Erro: Nenhum grupo sorteado. Por favor, faça o sorteio primeiro.");
    return;
  }

  // Disable buttons during simulation
  setButtonEnabled("play-world-cup-button", false);
  setButtonEnabled("redraw-groups-button", false);
  setMainTitle("Simulating Groups...");

  // Prepare groups for simulation
  const groupsToPlay = currentGroups.map((group) =>
    group.map((team) => ({ ...team, points: 0 }))
  );

  // Simulate each group progressively
  const updatedGroups = [];

  for (let i = 0; i < groupsToPlay.length; i++) {
    // Show loading
    showGroupSimulating(i);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate and render
    const simulatedGroup = simulateLeague(groupsToPlay[i]);
    updatedGroups.push(simulatedGroup);
    updateGroup(simulatedGroup, i);
  }

  // Update state
  currentGroups = updatedGroups;

  // Re-enable buttons and update UI
  setButtonEnabled("play-world-cup-button", true);
  setButtonEnabled("redraw-groups-button", true);
  showPostGroupsButtons();
  setMainTitle("Groups Complete - Ready for Playoffs");

  // Replace redraw button listener to replay groups
  replaceButtonListener("redraw-groups-button", playWorldCupGroups);
}

// ============================================================================
// KNOCKOUT STAGE (PLAYOFFS)
// ============================================================================

function initiatePlayoffs() {
  // Extract winners and runners-up
  const firsts = currentGroups.map((group) => group[0]);
  const seconds = currentGroups.map((group) => group[1]);

  // Shuffle randomly
  firsts.sort(() => Math.random() - 0.5);
  seconds.sort(() => Math.random() - 0.5);

  // Create matches
  const matches = firsts.map((first, index) => [first, seconds[index]]);

  // Render bracket and update UI
  renderRoundOf8(matches);
  setMainTitle("Round of 8 - Knockout Stage");
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Setup all button event listeners
  addButtonListener("qualify-button", runQualificationProcess);
  addButtonListener("reset-button", runQualificationProcess);
  addButtonListener("draw-groups-button", drawGroups);
  addButtonListener("redraw-groups-button", drawGroups);
  addButtonListener("play-world-cup-button", playWorldCupGroups);
  addButtonListener("initiate-playoffs-button", initiatePlayoffs);
});
