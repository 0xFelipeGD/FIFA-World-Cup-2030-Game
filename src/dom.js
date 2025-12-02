// DOM manipulation functions for rendering qualifiers by confederation

/**
 * Clear the qualified teams list
 */
export function clearQualifiedList(listId = "qualifying-teams-list") {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = "";
  }
}

/**
 * Render a single team in the qualified list
 * @param {Object} team - Team object with name, flag, points, etc.
 * @param {number} position - Position in the qualification (1-8)
 */
export function renderTeam(team, position, listId = "qualifying-teams-list") {
  const list = document.getElementById(listId);
  if (!list) return;

  const listItem = document.createElement("li");
  listItem.className = "team-item";

  // Determine qualification method and highlighting
  let qualificationMethod = "";
  const confederation = team.confederation || "";
  let isDirectQualification = false;

  if (confederation === "UEFA") {
    if (position <= 10) {
      qualificationMethod = "Qualified via League A";
      isDirectQualification = true;
    } else if (position <= 14) {
      qualificationMethod = "Qualified via League B";
    } else if (position <= 16) {
      qualificationMethod = "Qualified via League C";
    } else if (position <= 20) {
      qualificationMethod = "Qualified via Play-offs";
    }
  } else if (confederation === "CONCACAF") {
    if (position <= 6) {
      qualificationMethod = "Qualified via League A";
      isDirectQualification = true;
    } else if (position <= 10) {
      qualificationMethod = "Qualified via League B";
    } else if (position <= 12) {
      qualificationMethod = "Qualified via League C";
    }
  } else if (confederation === "CAF" || confederation === "AFC") {
    if (position <= 6) {
      qualificationMethod = "Qualified via League A";
      isDirectQualification = true;
    } else if (position <= 9) {
      qualificationMethod = "Qualified via League B";
    } else if (position <= 11) {
      qualificationMethod = "Qualified via League C";
    }
  } else {
    // CONMEBOL and others
    if (position <= 4) {
      qualificationMethod = "Direct Qualification";
      isDirectQualification = true;
    } else {
      qualificationMethod = "Qualified via Play-ins";
    }
  }

  // Add special class for direct qualification highlighting
  if (isDirectQualification) {
    listItem.classList.add("direct-qualifier");
  }
  listItem.innerHTML = `
    <div class="team-card">
      <span class="team-position">${position}</span>
      <img src="${team.flag}" alt="${team.name} flag" class="team-flag">
      <div class="team-info">
        <h3 class="team-name">${team.name}</h3>
        <p class="team-points">Points: ${
          typeof team.points === "number" ? team.points : "N/A"
        }</p>
        <p class="team-strength">Strength: ${team.strength}</p>
        <p class="team-qualification">${qualificationMethod}</p>
      </div>
    </div>
  `;

  list.appendChild(listItem);
}

/**
 * Render all qualified teams
 * @param {Array} teams - Array of qualified teams
 */
export function renderQualifiedTeams(teams, listId = "qualifying-teams-list") {
  teams.forEach((team, index) => {
    renderTeam(team, index + 1, listId);
  });
}

/**
 * Show loading state
 */
export function showLoading(listId = "qualifying-teams-list") {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = '<li class="loading">Simulating qualifiers...</li>';
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message, listId = "qualifying-teams-list") {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = `<li class="error">Error: ${message}</li>`;
  }
}

/**
 * Enable/disable the qualify button
 * @param {boolean} enabled - Whether the button should be enabled
 */
export function setButtonEnabled(enabled) {
  const button = document.getElementById("qualify-button");
  if (button) {
    button.disabled = !enabled;
    button.textContent = enabled ? "Start Qualification" : "Simulating...";
  }
}

/**
 * Toggle between qualify and reset buttons
 */
export function toggleButtons() {
  const qualifyButton = document.getElementById("qualify-button");
  const resetButton = document.getElementById("reset-button");
  const drawGroupsButton = document.getElementById("draw-groups-button");

  if (qualifyButton && resetButton) {
    qualifyButton.style.display = "none";
    resetButton.style.display = "inline-block";
  }

  if (drawGroupsButton) {
    drawGroupsButton.style.display = "inline-block";
  }
}

/**
 * Show qualify button and hide reset button
 */
export function showQualifyButton() {
  const qualifyButton = document.getElementById("qualify-button");
  const resetButton = document.getElementById("reset-button");
  const drawGroupsButton = document.getElementById("draw-groups-button");

  if (qualifyButton && resetButton) {
    qualifyButton.style.display = "inline-block";
    resetButton.style.display = "none";
  }

  if (drawGroupsButton) {
    drawGroupsButton.style.display = "none";
  }
}

/**
 * Add click event to qualify button
 * @param {Function} callback - Function to call when button is clicked
 */
export function addQualifyButtonListener(callback) {
  const button = document.getElementById("qualify-button");
  if (button) {
    button.addEventListener("click", callback);
  }
}

/**
 * Add click event to reset button
 * @param {Function} callback - Function to call when button is clicked
 */
export function addResetButtonListener(callback) {
  const button = document.getElementById("reset-button");
  if (button) {
    button.addEventListener("click", callback);
  }
}

/**
 * Add click event to draw groups button
 * @param {Function} callback - Function to call when button is clicked
 */
export function addDrawGroupsButtonListener(callback) {
  const button = document.getElementById("draw-groups-button");
  if (button) {
    button.addEventListener("click", callback);
  }
}

/**
 * Render the groups after draw
 * @param {Array} groups - Array of 16 groups (A-P), each containing 4 teams
 */
export function renderGroups(groups) {
  const sectionsGrid = document.querySelector(".sections-grid");
  if (!sectionsGrid) return;

  // Clear existing content
  sectionsGrid.innerHTML = "";

  // Group names from A to P
  const groupNames = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
  ];

  // Render each group
  groups.forEach((group, index) => {
    const groupName = groupNames[index];
    const groupSection = document.createElement("section");
    groupSection.className = "confed-section";
    groupSection.id = `group-${groupName.toLowerCase()}-section`;

    const groupTitle = document.createElement("h3");
    groupTitle.className = "section-title";
    groupTitle.textContent = `Group ${groupName}`;

    const teamsList = document.createElement("ul");
    teamsList.className = "teams-list";
    teamsList.id = `group-${groupName.toLowerCase()}-teams-list`;

    // Add teams to the group
    group.forEach((team, teamIndex) => {
      const listItem = document.createElement("li");
      listItem.className = "team-item";

      // Add qualifier class for top 2 teams
      if (teamIndex < 2) {
        listItem.classList.add("qualified-team");
      }

      listItem.innerHTML = `
        <div class="team-card">
          <span class="team-position">${teamIndex + 1}</span>
          <img src="${team.flag}" alt="${team.name} flag" class="team-flag">
          <div class="team-info">
            <h3 class="team-name">${team.name}</h3>
            <p class="team-strength">STR: ${team.strength}</p>
          </div>
          <span class="team-points-badge">${
            typeof team.points === "number" ? team.points : 0
          }</span>
        </div>
      `;

      teamsList.appendChild(listItem);
    });

    groupSection.appendChild(groupTitle);
    groupSection.appendChild(teamsList);
    sectionsGrid.appendChild(groupSection);
  });
}

/**
 * Render a single group with simulated results
 * @param {Array} group - Array of 4 teams
 * @param {number} groupIndex - Index of the group (0-15)
 */
export function renderSingleGroup(group, groupIndex) {
  const sectionsGrid = document.querySelector(".sections-grid");
  if (!sectionsGrid) return;

  const groupNames = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
  ];

  const groupName = groupNames[groupIndex];
  const existingSection = document.getElementById(
    `group-${groupName.toLowerCase()}-section`
  );

  if (existingSection) {
    // Update existing section
    const teamsList = existingSection.querySelector(".teams-list");
    if (teamsList) {
      teamsList.innerHTML = "";

      group.forEach((team, teamIndex) => {
        const listItem = document.createElement("li");
        listItem.className = "team-item";

        // Add qualifier class for top 2 teams
        if (teamIndex < 2) {
          listItem.classList.add("qualified-team");
        }

        listItem.innerHTML = `
          <div class="team-card">
            <span class="team-position">${teamIndex + 1}</span>
            <img src="${team.flag}" alt="${team.name} flag" class="team-flag">
            <div class="team-info">
              <h3 class="team-name">${team.name}</h3>
              <p class="team-strength">STR: ${team.strength}</p>
            </div>
            <span class="team-points-badge">${
              typeof team.points === "number" ? team.points : 0
            }</span>
          </div>
        `;

        teamsList.appendChild(listItem);
      });
    }
  }
}

/**
 * Show "Simulando..." text in a specific group section
 * @param {number} groupIndex - Index of the group (0-15)
 */
export function showGroupSimulating(groupIndex) {
  const groupNames = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
  ];

  const groupName = groupNames[groupIndex];
  const section = document.getElementById(
    `group-${groupName.toLowerCase()}-section`
  );

  if (section) {
    const teamsList = section.querySelector(".teams-list");
    if (teamsList) {
      teamsList.innerHTML = '<li class="loading">Simulating...</li>';
    }
  }
}

/**
 * Clear all groups from the sections grid
 */
export function clearGroups() {
  const sectionsGrid = document.querySelector(".sections-grid");
  if (sectionsGrid) {
    sectionsGrid.innerHTML = "";
  }
}

/**
 * Render the Round of 16 matches in bracket format
 * @param {Array} matches - Array of 16 matches, each containing 2 teams
 */
export function renderRoundOf16(matches) {
  const sectionsGrid = document.querySelector(".sections-grid");
  if (!sectionsGrid) return;

  // Clear existing content and add bracket class
  sectionsGrid.innerHTML = "";
  sectionsGrid.className = "bracket-container";

  // Create single bracket structure with all 16 matches
  const bracketHTML = `
    <div class="bracket single-bracket">
      <!-- Round of 16 - Left Side -->
      <div class="bracket-round round-of-16">
        <h3 class="round-title">Round of 16</h3>
        <div class="matches-column">
          ${createMatchHTML(matches[0], 0)}
          ${createMatchHTML(matches[1], 1)}
          ${createMatchHTML(matches[2], 2)}
          ${createMatchHTML(matches[3], 3)}
          ${createMatchHTML(matches[4], 4)}
          ${createMatchHTML(matches[5], 5)}
          ${createMatchHTML(matches[6], 6)}
          ${createMatchHTML(matches[7], 7)}
        </div>
      </div>

      <!-- Quarter Finals - Left Side -->
      <div class="bracket-round quarter-finals">
        <h3 class="round-title">Quarter Finals</h3>
        <div class="matches-column">
          ${createEmptyMatchHTML(0)}
          ${createEmptyMatchHTML(1)}
          ${createEmptyMatchHTML(2)}
          ${createEmptyMatchHTML(3)}
        </div>
      </div>

      <!-- Semi Finals - Left Side -->
      <div class="bracket-round semi-finals">
        <h3 class="round-title">Semi Finals</h3>
        <div class="matches-column">
          ${createEmptyMatchHTML(0)}
          ${createEmptyMatchHTML(1)}
        </div>
      </div>

      <!-- Final and Third Place -->
      <div class="bracket-round final-round">
        <div class="final-container">
          <div class="bracket-round final">
            <h3 class="round-title">Final</h3>
            <div class="matches-column">
              ${createEmptyMatchHTML(0, true)}
            </div>
          </div>
          <div class="bracket-round third-place">
            <h3 class="round-title">3rd Place</h3>
            <div class="matches-column">
              ${createEmptyMatchHTML(0, false, true)}
            </div>
          </div>
        </div>
      </div>

      <!-- Semi Finals - Right Side -->
      <div class="bracket-round semi-finals">
        <h3 class="round-title">Semi Finals</h3>
        <div class="matches-column">
          ${createEmptyMatchHTML(2)}
          ${createEmptyMatchHTML(3)}
        </div>
      </div>

      <!-- Quarter Finals - Right Side -->
      <div class="bracket-round quarter-finals">
        <h3 class="round-title">Quarter Finals</h3>
        <div class="matches-column">
          ${createEmptyMatchHTML(4)}
          ${createEmptyMatchHTML(5)}
          ${createEmptyMatchHTML(6)}
          ${createEmptyMatchHTML(7)}
        </div>
      </div>

      <!-- Round of 16 - Right Side -->
      <div class="bracket-round round-of-16">
        <h3 class="round-title">Round of 16</h3>
        <div class="matches-column">
          ${createMatchHTML(matches[8], 8)}
          ${createMatchHTML(matches[9], 9)}
          ${createMatchHTML(matches[10], 10)}
          ${createMatchHTML(matches[11], 11)}
          ${createMatchHTML(matches[12], 12)}
          ${createMatchHTML(matches[13], 13)}
          ${createMatchHTML(matches[14], 14)}
          ${createMatchHTML(matches[15], 15)}
        </div>
      </div>
    </div>
  `;

  sectionsGrid.innerHTML = bracketHTML;
}

/**
 * Create HTML for a match with teams
 */
function createMatchHTML(match, matchIndex) {
  return `
    <div class="bracket-match" data-match="${matchIndex}">
      <div class="bracket-team">
        <img src="${match[0].flag}" alt="${match[0].name}" class="bracket-flag">
        <span class="bracket-team-name">${match[0].name}</span>
      </div>
      <div class="bracket-team">
        <img src="${match[1].flag}" alt="${match[1].name}" class="bracket-flag">
        <span class="bracket-team-name">${match[1].name}</span>
      </div>
    </div>
  `;
}

/**
 * Create HTML for an empty match slot
 */
function createEmptyMatchHTML(
  matchIndex,
  isFinal = false,
  isThirdPlace = false
) {
  const extraClass = isFinal
    ? " final-match"
    : isThirdPlace
    ? " third-place-match"
    : "";
  return `
    <div class="bracket-match empty-match${extraClass}" data-match="${matchIndex}">
      <div class="bracket-team empty-team">
        <span class="bracket-team-name">TBD</span>
      </div>
      <div class="bracket-team empty-team">
        <span class="bracket-team-name">TBD</span>
      </div>
    </div>
  `;
}
