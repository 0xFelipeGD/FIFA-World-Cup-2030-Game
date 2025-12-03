// Global state
let currentConfederation = "conmebol";
let confederationData = {};

// Load all confederation data
async function loadAllData() {
  const confederations = ["conmebol", "concacaf", "caf", "afc", "uefa", "ofc"];

  for (const conf of confederations) {
    try {
      const response = await fetch(`../${conf}-log.json`);
      if (response.ok) {
        confederationData[conf] = await response.json();
      } else {
        console.error(`Failed to load ${conf}-log.json`);
      }
    } catch (error) {
      console.error(`Error loading ${conf} data:`, error);
    }
  }
}

// Initialize the page
async function init() {
  await loadAllData();
  setupNavigation();
  displayConfederation("conmebol");
}

// Setup navigation buttons
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      navButtons.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      btn.classList.add("active");

      const confederation = btn.dataset.confederation;
      currentConfederation = confederation;
      displayConfederation(confederation);
    });
  });
}

// Display confederation statistics
function displayConfederation(confederation) {
  const data = confederationData[confederation];

  if (!data) {
    document.getElementById("stats-container").innerHTML = `
            <div class="loading">Data not found for ${confederation.toUpperCase()}</div>
        `;
    return;
  }

  // Update footer info
  document.getElementById("generated-date").textContent = new Date(
    data.generatedAt
  ).toLocaleString("en-US");
  document.getElementById("total-runs").textContent =
    data.runs.toLocaleString("en-US");

  // Build the stats display
  const container = document.getElementById("stats-container");
  container.innerHTML = `
        <div class="stats-header">
            <div class="stats-info">
                <h2>${confederation.toUpperCase()}</h2>
                <div class="info-badges">
                    <span class="badge">${
                      Object.keys(data.positions).length
                    } Teams</span>
                    <span class="badge">${data.runs.toLocaleString(
                      "en-US"
                    )} Simulations</span>
                </div>
            </div>
        </div>
        <div class="team-cards" id="team-cards"></div>
        <div class="charts-section">
            <div class="chart-container">
                <h3>1st Place Probability</h3>
                <div class="chart-wrapper">
                    <canvas id="firstPlaceChart"></canvas>
                </div>
            </div>
            <div class="chart-container">
                <h3>Position Distribution - Top 5 Teams</h3>
                <div class="chart-wrapper">
                    <canvas id="positionDistChart"></canvas>
                </div>
            </div>
        </div>
    `;

  renderTeamCards(data.positions);
  renderCharts(data.positions);
}

// Render team cards with position bars
function renderTeamCards(positions) {
  const cardsContainer = document.getElementById("team-cards");

  Object.entries(positions).forEach(([teamName, stats]) => {
    const { strength, ...positionData } = stats;

    const card = document.createElement("div");
    card.className = "team-card";

    // Create position bars
    const positionBars = Object.entries(positionData)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([position, percentage]) => {
        const posClass = getPositionClass(
          parseInt(position),
          Object.keys(positionData).length
        );
        return `
                    <div class="position-row">
                        <span class="position-label">${position}º</span>
                        <div class="bar-container ${posClass}">
                            <div class="bar-fill" style="width: ${percentage}%">
                                ${
                                  percentage > 5
                                    ? `<span class="bar-percentage">${percentage}%</span>`
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                `;
      })
      .join("");

    card.innerHTML = `
            <div class="team-header">
                <div class="team-info">
                    <h3>${teamName}</h3>
                    <span class="team-strength">Strength: ${strength}</span>
                </div>
            </div>
            <div class="position-bars">
                ${positionBars}
            </div>
        `;

    cardsContainer.appendChild(card);
  });
}

// Get position class for coloring
function getPositionClass(position, totalPositions) {
  const topThreshold = Math.ceil(totalPositions * 0.3);
  const midThreshold = Math.ceil(totalPositions * 0.6);

  if (position <= topThreshold) return "top-position";
  if (position <= midThreshold) return "mid-position";
  return "bottom-position";
}

// Render charts
let firstPlaceChartInstance = null;
let positionDistChartInstance = null;

function renderCharts(positions) {
  // Destroy existing charts if they exist
  if (firstPlaceChartInstance) {
    firstPlaceChartInstance.destroy();
  }
  if (positionDistChartInstance) {
    positionDistChartInstance.destroy();
  }

  // First place probabilities
  const firstPlaceData = Object.entries(positions)
    .map(([team, stats]) => ({
      team,
      percentage: stats["1"] || 0,
      strength: stats.strength,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  const ctx1 = document.getElementById("firstPlaceChart").getContext("2d");
  firstPlaceChartInstance = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: firstPlaceData.map((d) => d.team),
      datasets: [
        {
          label: "Probability (%)",
          data: firstPlaceData.map((d) => d.percentage),
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.y.toFixed(2)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });

  // Position distribution for top 5 teams
  const top5Teams = Object.entries(positions)
    .sort((a, b) => b[1].strength - a[1].strength)
    .slice(0, 5);

  const allPositions = Object.keys(top5Teams[0][1])
    .filter((k) => k !== "strength")
    .sort((a, b) => parseInt(a) - parseInt(b));

  const datasets = top5Teams.map(([team, stats], index) => {
    const colors = [
      "rgba(102, 126, 234, 0.8)",
      "rgba(118, 75, 162, 0.8)",
      "rgba(40, 167, 69, 0.8)",
      "rgba(255, 193, 7, 0.8)",
      "rgba(220, 53, 69, 0.8)",
    ];

    return {
      label: team,
      data: allPositions.map((pos) => stats[pos] || 0),
      backgroundColor: colors[index],
      borderColor: colors[index].replace("0.8", "1"),
      borderWidth: 2,
    };
  });

  const ctx2 = document.getElementById("positionDistChart").getContext("2d");
  positionDistChartInstance = new Chart(ctx2, {
    type: "line",
    data: {
      labels: allPositions.map((p) => `${p}º`),
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(
                2
              )}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);
