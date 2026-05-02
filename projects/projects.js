import { fetchJSON, renderProjects, BASE_PATH } from '../global.js';
const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

renderProjects(projects, projectsContainer, 'h2');

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let query = '';
let selectedYear = null;

function getFilteredProjects() {
  if (!query) return projects;
  return projects.filter(project =>
    Object.values(project).join(' ').toLowerCase().includes(query)
  );
}
function renderPieChart() {
  const filtered = getFilteredProjects();

  // If selectedYear no longer exists in filtered data, clear it
  const availableYears = d3.rollups(filtered, v => v.length, d => d.year).map(([y]) => String(y));
  if (selectedYear !== null && !availableYears.includes(String(selectedYear))) {
    selectedYear = null;
  }

  const visibleProjects = selectedYear
    ? filtered.filter(p => String(p.year) === String(selectedYear))
    : filtered;

  const rolledData = d3.rollups(visibleProjects, v => v.length, d => d.year);
  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map(d => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', String(data[idx].label) === String(selectedYear) ? 'selected' : '')
      .on('click', () => {
        selectedYear = String(selectedYear) === String(data[idx].label) ? null : data[idx].label;
        renderPieChart();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', String(d.label) === String(selectedYear) ? 'legend-item selected' : 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });

  renderProjects(visibleProjects, projectsContainer, 'h2');
}
 
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  renderPieChart();
});

renderPieChart();


