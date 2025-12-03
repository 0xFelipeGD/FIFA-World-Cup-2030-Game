# 📊 Stats Viewer - Statistics Visualizer

This directory contains interactive HTML files for visualizing World Cup 2030 qualification simulation statistics.

## 📁 File Structure

```
Stats-Viewer/
├── index.html          # Main page
├── styles.css          # Page styles
├── script.js           # Logic and visualizations
└── README.md           # This file
```

## 🚀 How to Use

1. **Generate statistical logs** (if not already generated):

   ```bash
   node src/Services/confederation-stats-log.js --runs=100000
   ```

2. **Open the visualizer**:

   - Navigate to `Tests/Stats-Viewer/`
   - Open the `index.html` file in your browser
   - Or use a local server (recommended):

     ```bash
     # With Python 3
     cd Tests/Stats-Viewer
     python -m http.server 8000

     # With Node.js (if http-server is installed)
     npx http-server
     ```

3. **Navigate through confederations**:
   - Click the buttons at the top to switch between CONMEBOL, CONCACAF, CAF, AFC, UEFA and OFC
   - View detailed statistics for each team
   - Analyze probability charts

## 📈 Visual Features

### Team Cards

- **Strength**: Visual indicator of each team's strength
- **Position Bars**: Percentage probability for each position
- **Category Colors**:
  - 🟢 Green: Top 30% (best positions)
  - 🟡 Yellow: Middle 30-60%
  - 🔴 Red: Bottom 60-100%

### Charts

1. **1st Place Probability**: Top 10 teams with the highest chance of finishing first
2. **Position Distribution**: Distribution curve of the 5 strongest teams

## 🎨 Features

- ✅ Responsive design (mobile-friendly)
- ✅ Smooth animations
- ✅ Interactive charts (Chart.js)
- ✅ Intuitive navigation between confederations
- ✅ Automatic colors by position category
- ✅ Detailed information for each simulation

## 📊 Data Used

The visualizers read JSON files generated at:

- `Tests/conmebol-log.json`
- `Tests/concacaf-log.json`
- `Tests/caf-log.json`
- `Tests/afc-log.json`
- `Tests/uefa-log.json`
- `Tests/ofc-log.json`

## 🔧 Technologies

- HTML5
- CSS3 (Grid, Flexbox, Gradients, Animations)
- JavaScript (ES6+)
- Chart.js (for charts)

## 💡 Tips

- Use a modern browser (Chrome, Firefox, Edge) for the best experience
- If data doesn't load, verify that JSON files exist in the `Tests/` folder
- For better performance, use a local HTTP server instead of opening HTML directly

---

**Last update**: December 2025
