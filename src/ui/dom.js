// Create an element with attributes and children
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "dataset") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Append children
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });

  return element;
}

// Create a team flag image element
function createTeamFlag(team) {
  return createElement("img", {
    src: team.flag,
    alt: `${team.name} flag`,
    className: "team-flag",
  });
}

// Create team info section
function createTeamInfo(team, options = {}) {
  const {
    showPoints = false,
    showStrength = true,
    showQualification = false,
  } = options;

  const children = [createElement("h3", { className: "team-name" }, team.name)];

  if (showPoints) {
    children.push(
      createElement(
        "p",
        { className: "team-points" },
        `Points: ${typeof team.points === "number" ? team.points : "N/A"}`
      )
    );
  }

  if (showStrength) {
    children.push(
      createElement(
        "p",
        { className: "team-strength" },
        `Strength: ${team.strength}`
      )
    );
  }

  if (showQualification && options.qualificationMethod) {
    children.push(
      createElement(
        "p",
        { className: "team-qualification" },
        options.qualificationMethod
      )
    );
  }

  return createElement("div", { className: "team-info" }, children);
}

// Determine qualification method based on confederation and position
function getQualificationMethod(team, position) {
  const confederation = team.confederation || "";
  let qualificationMethod = "";
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
    if (position <= 4) {
      qualificationMethod = "Direct Qualification";
      isDirectQualification = true;
    } else {
      qualificationMethod = "Qualified via Play-ins";
    }
  }

  return { qualificationMethod, isDirectQualification };
}

// Create a team card for qualification view
function createQualificationTeamCard(team, position) {
  const { qualificationMethod, isDirectQualification } = getQualificationMethod(
    team,
    position
  );

  const teamCard = createElement("div", { className: "team-card" }, [
    createElement("span", { className: "team-position" }, String(position)),
    createTeamFlag(team),
    createTeamInfo(team, {
      showPoints: true,
      showQualification: true,
      qualificationMethod,
    }),
  ]);

  const listItem = createElement(
    "li",
    {
      className: isDirectQualification
        ? "team-item direct-qualifier"
        : "team-item",
    },
    [teamCard]
  );

  return listItem;
}

// Create a team card for group view
function createGroupTeamCard(team, position) {
  const isQualified = position < 2; // Top 2 teams qualify

  const teamCard = createElement("div", { className: "team-card" }, [
    createElement("span", { className: "team-position" }, String(position + 1)),
    createTeamFlag(team),
    createTeamInfo(team, { showPoints: false }),
    createElement(
      "span",
      { className: "team-points-badge" },
      String(typeof team.points === "number" ? team.points : 0)
    ),
  ]);

  const listItem = createElement(
    "li",
    {
      className: isQualified ? "team-item qualified-team" : "team-item",
    },
    [teamCard]
  );

  return listItem;
}

const VIEWS = {
  CONFEDERATIONS: "confederations-view",
  GROUPS: "groups-view",
  BRACKET: "bracket-view",
};

// Switch between different views
export function switchView(viewName) {
  Object.values(VIEWS).forEach((view) => {
    const element = document.getElementById(view);
    if (element) {
      element.classList.toggle("hidden", view !== viewName);
    }
  });
}

// Show confederations view
export function showConfederationsView() {
  switchView(VIEWS.CONFEDERATIONS);
}

// Show groups view
export function showGroupsView() {
  switchView(VIEWS.GROUPS);
}

// Show bracket view
export function showBracketView() {
  switchView(VIEWS.BRACKET);
}

// Toggle button visibility using CSS classes
export function toggleButton(buttonId, show) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.toggle("hidden", !show);
  }
}

// Show multiple buttons and hide others
export function setButtonsVisibility(config) {
  Object.entries(config).forEach(([buttonId, visible]) => {
    toggleButton(buttonId, visible);
  });
}

// Show buttons for qualification phase
export function showQualificationButtons() {
  setButtonsVisibility({
    "qualify-button": true,
    "reset-button": false,
    "draw-groups-button": false,
    "redraw-groups-button": false,
    "play-world-cup-button": false,
    "initiate-playoffs-button": false,
  });
}

// Show buttons after qualification
export function showPostQualificationButtons() {
  setButtonsVisibility({
    "qualify-button": false,
    "reset-button": true,
    "draw-groups-button": true,
    "redraw-groups-button": false,
    "play-world-cup-button": false,
    "initiate-playoffs-button": false,
  });
}

// Show buttons after groups drawn
export function showPostDrawButtons() {
  setButtonsVisibility({
    "qualify-button": false,
    "reset-button": false,
    "draw-groups-button": false,
    "redraw-groups-button": true,
    "play-world-cup-button": true,
    "initiate-playoffs-button": false,
  });
}

// Show buttons after groups played
export function showPostGroupsButtons() {
  setButtonsVisibility({
    "qualify-button": false,
    "reset-button": false,
    "draw-groups-button": false,
    "redraw-groups-button": true,
    "play-world-cup-button": false,
    "initiate-playoffs-button": true,
  });
}

// Enable/disable a button
export function setButtonEnabled(buttonId, enabled) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = !enabled;
  }
}

// Update button text content
export function setButtonText(buttonId, text) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.textContent = text;
  }
}

// Update main title text
export function setMainTitle(text) {
  const title = document.getElementById("main-title");
  if (title) {
    title.textContent = text;
  }
}

// Clear a list element
export function clearList(listId) {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = "";
  }
}

// Clear all confederation lists
export function clearAllConfederationLists() {
  const confederations = ["conmebol", "concacaf", "caf", "afc", "uefa", "ofc"];
  confederations.forEach((confed) => {
    clearList(`${confed}-teams-list`);
  });
}

// Show loading state in a list
export function showLoading(listId, message = "Simulating qualifiers...") {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = "";
    const loadingItem = createElement("li", { className: "loading" }, message);
    list.appendChild(loadingItem);
  }
}

// Show error message in a list
export function showError(listId, message) {
  const list = document.getElementById(listId);
  if (list) {
    list.innerHTML = "";
    const errorItem = createElement(
      "li",
      { className: "error" },
      `Error: ${message}`
    );
    list.appendChild(errorItem);
  }
}

// Render qualified teams in their confederation lists
export function renderQualifiedTeams(teams, listId) {
  const list = document.getElementById(listId);
  if (!list) return;

  clearList(listId);

  teams.forEach((team, index) => {
    const teamCard = createQualificationTeamCard(team, index + 1);
    list.appendChild(teamCard);
  });
}

// Render all confederation qualification results
export function renderAllQualifications(qualifiedTeams) {
  const {
    conmebol = [],
    concacaf = [],
    caf = [],
    afc = [],
    uefa = [],
    ofc = [],
  } = qualifiedTeams;

  renderQualifiedTeams(conmebol, "conmebol-teams-list");
  renderQualifiedTeams(concacaf, "concacaf-teams-list");
  renderQualifiedTeams(caf, "caf-teams-list");
  renderQualifiedTeams(afc, "afc-teams-list");
  renderQualifiedTeams(uefa, "uefa-teams-list");
  renderQualifiedTeams(ofc, "ofc-teams-list");
}

const GROUP_NAMES = [
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

// Create a group section element
function createGroupSection(groupName, teams) {
  const teamsList = createElement("ul", {
    className: "teams-list",
    id: `group-${groupName.toLowerCase()}-teams-list`,
  });

  teams.forEach((team, index) => {
    const teamCard = createGroupTeamCard(team, index);
    teamsList.appendChild(teamCard);
  });

  const section = createElement(
    "section",
    {
      className: "confed-section",
      id: `group-${groupName.toLowerCase()}-section`,
    },
    [
      createElement("h3", { className: "section-title" }, `Group ${groupName}`),
      teamsList,
    ]
  );

  return section;
}

// Render all groups
export function renderGroups(groups) {
  const groupsView = document.getElementById("groups-view");
  if (!groupsView) return;

  groupsView.innerHTML = "";
  groupsView.className = "sections-grid";

  groups.forEach((group, index) => {
    const groupName = GROUP_NAMES[index];
    const groupSection = createGroupSection(groupName, group);
    groupsView.appendChild(groupSection);
  });

  showGroupsView();
}

// Update a single group after simulation
export function updateGroup(group, groupIndex) {
  const groupName = GROUP_NAMES[groupIndex];
  const teamsList = document.getElementById(
    `group-${groupName.toLowerCase()}-teams-list`
  );

  if (teamsList) {
    teamsList.innerHTML = "";
    group.forEach((team, index) => {
      const teamCard = createGroupTeamCard(team, index);
      teamsList.appendChild(teamCard);
    });
  }
}

// Show simulating message in a group
export function showGroupSimulating(groupIndex) {
  const groupName = GROUP_NAMES[groupIndex];
  const teamsList = document.getElementById(
    `group-${groupName.toLowerCase()}-teams-list`
  );

  if (teamsList) {
    teamsList.innerHTML = "";
    const loadingItem = createElement(
      "li",
      { className: "loading" },
      "Simulating..."
    );
    teamsList.appendChild(loadingItem);
  }
}

// Create a bracket team element
function createBracketTeam(team, isEmpty = false) {
  if (isEmpty) {
    return createElement("div", { className: "bracket-team empty-team" }, [
      createElement("span", { className: "bracket-team-name" }, "TBD"),
    ]);
  }

  return createElement("div", { className: "bracket-team" }, [
    createElement("img", {
      src: team.flag,
      alt: team.name,
      className: "bracket-flag",
    }),
    createElement("span", { className: "bracket-team-name" }, team.name),
  ]);
}

// Create a bracket match element
function createBracketMatch(
  teams,
  matchIndex,
  isEmpty = false,
  isSpecial = ""
) {
  const classes = ["bracket-match"];
  if (isEmpty) classes.push("empty-match");
  if (isSpecial === "final") classes.push("final-match");
  if (isSpecial === "third-place") classes.push("third-place-match");

  return createElement(
    "div",
    {
      className: classes.join(" "),
      dataset: { match: String(matchIndex) },
    },
    teams.map((team) => createBracketTeam(team, isEmpty))
  );
}

// Create a bracket round
function createBracketRound(title, matches, roundClass) {
  const matchesColumn = createElement(
    "div",
    { className: "matches-column" },
    matches
  );

  return createElement("div", { className: `bracket-round ${roundClass}` }, [
    createElement("h3", { className: "round-title" }, title),
    matchesColumn,
  ]);
}

// Render Round of 8 bracket
export function renderRoundOf8(matches) {
  const bracketView = document.getElementById("bracket-view");
  if (!bracketView) return;

  bracketView.innerHTML = "";
  bracketView.className = "bracket-container";

  // Create matches for left side (0-7)
  const leftMatches = matches
    .slice(0, 8)
    .map((match, i) => createBracketMatch(match, i));

  // Create matches for right side (8-15)
  const rightMatches = matches
    .slice(8, 16)
    .map((match, i) => createBracketMatch(match, i + 8));

  // Create empty matches for next rounds
  const quarterFinalsEmpty = Array.from({ length: 8 }, (_, i) =>
    createBracketMatch([{}, {}], i, true)
  );

  const semiFinalsEmpty = Array.from({ length: 4 }, (_, i) =>
    createBracketMatch([{}, {}], i, true)
  );

  const finalEmpty = createBracketMatch([{}, {}], 0, true, "final");
  const thirdPlaceEmpty = createBracketMatch([{}, {}], 0, true, "third-place");

  // Build the bracket structure
  const bracket = createElement(
    "div",
    { className: "bracket single-bracket" },
    [
      // Left side
      createBracketRound("Round of 8", leftMatches, "round-of-8"),
      createBracketRound(
        "Quarter Finals",
        quarterFinalsEmpty.slice(0, 4),
        "quarter-finals"
      ),
      createBracketRound(
        "Semi Finals",
        semiFinalsEmpty.slice(0, 2),
        "semi-finals"
      ),

      // Center (Final and Third Place)
      createElement("div", { className: "bracket-round final-round" }, [
        createElement("div", { className: "final-container" }, [
          createElement("div", { className: "bracket-round final" }, [
            createElement("h3", { className: "round-title" }, "Final"),
            createElement("div", { className: "matches-column" }, [finalEmpty]),
          ]),
          createElement("div", { className: "bracket-round third-place" }, [
            createElement("h3", { className: "round-title" }, "3rd Place"),
            createElement("div", { className: "matches-column" }, [
              thirdPlaceEmpty,
            ]),
          ]),
        ]),
      ]),

      // Right side
      createBracketRound(
        "Semi Finals",
        semiFinalsEmpty.slice(2, 4),
        "semi-finals"
      ),
      createBracketRound(
        "Quarter Finals",
        quarterFinalsEmpty.slice(4, 8),
        "quarter-finals"
      ),
      createBracketRound("Round of 8", rightMatches, "round-of-8"),
    ]
  );

  bracketView.appendChild(bracket);
  showBracketView();
}

// Add event listener to a button
export function addButtonListener(buttonId, callback) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", callback);
  }
}

// Replace event listener on a button (removes old listeners)
export function replaceButtonListener(buttonId, callback) {
  const button = document.getElementById(buttonId);
  if (button) {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener("click", callback);
  }
}
