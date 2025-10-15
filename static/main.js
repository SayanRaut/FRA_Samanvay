document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE & CONSTANTS ---
    let allStateData = [];
    let selectedState = null;
    const map = L.map('map', {center: [20.5937, 78.9629],zoom: 5,scrollWheelZoom: true, });
    const markersLayer = L.layerGroup().addTo(map);

    // --- DOM ELEMENT REFERENCES ---
    const searchInput = document.getElementById('search-input');
    const filterSlider = document.getElementById('filter-slider');
    const sliderValueSpan = document.getElementById('slider-value');
    const filteredCountSpan = document.getElementById('filtered-count');
    const tableBody = document.getElementById('filtered-table-body');
    const selectedStatePanel = document.getElementById('selected-state-panel');
    const chartCanvas = document.getElementById('top-states-chart').getContext('2d');
    let topStatesChart;

    // --- INITIALIZATION ---
    // This is the updated tile layer for SATELLITE VIEW
    //L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    //    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    //}).addTo(map);

    // Satellite imagery
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri Satellite Imagery'
    }).addTo(map);

    // Overlay state & city labels
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri Boundaries & Places',
    maxZoom: 19
    }).addTo(map);




    // Fetch data from our Flask API and initialize the app
    fetch('/api/states')
        .then(response => response.json())
        .then(data => {
            allStateData = data;
            renderChart(allStateData);
            updateFiltersAndRender();
        });

    // --- EVENT LISTENERS ---
    searchInput.addEventListener('input', updateFiltersAndRender);
    filterSlider.addEventListener('input', () => {
        sliderValueSpan.textContent = filterSlider.value;
        updateFiltersAndRender();
    });

    // --- CORE LOGIC FUNCTIONS ---
    function updateFiltersAndRender() {
        const searchQuery = searchInput.value.toLowerCase();
        const minDisposed = Number(filterSlider.value);

        const filteredData = allStateData.filter(s =>
            s.claims_disposed_percent >= minDisposed &&
            s.state.toLowerCase().includes(searchQuery)
        );

        renderMap(filteredData);
        renderTable(filteredData);
    }

    function selectState(state) {
        selectedState = state;
        updateSidebar();
        // Optional: pan map to selected state
        if (state) {
            map.setView([state.lat, state.lon], 6);
        }
    }

    // --- RENDERING FUNCTIONS ---
    function renderMap(data) {
        markersLayer.clearLayers();
        data.forEach(s => {
            const marker = L.marker([s.lat, s.lon]).addTo(markersLayer);
            marker.on('click', () => selectState(s));

            const popupContent = `
                <div class="text-sm">
                    <strong>${s.state}</strong>
                    <div>Claims: ${s.total_claims.toLocaleString()}</div>
                    <div>Titles: ${s.total_titles.toLocaleString()}</div>
                    <div>Disposed: ${s.claims_disposed_percent}%</div>
                    <div>Land (ha): ${s.total_land?.toLocaleString() ?? 'N/A'}</div>
                </div>`;
            marker.bindPopup(popupContent);

            if (s.total_titles > 0) {
                L.circle([s.lat, s.lon], {
                    radius: Math.max(10000, Math.log(s.total_titles + 1) * 6000),
                    fillOpacity: 0.12,
                    color: '#3388ff',
                    weight: 1
                }).addTo(markersLayer);
            }
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = ''; // Clear existing rows
        filteredCountSpan.textContent = data.length;

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-2 text-gray-500">No states match the current filters.</td></tr>';
            return;
        }

        data.forEach(s => {
            const row = document.createElement('tr');
            row.className = 'cursor-pointer hover:bg-gray-100';
            row.innerHTML = `
                <td class="pr-4 py-1">${s.state}</td>
                <td class="pr-4 py-1">${s.total_claims.toLocaleString()}</td>
                <td class="pr-4 py-1">${s.total_titles.toLocaleString()}</td>
                <td class="pr-4 py-1">${s.claims_disposed_percent}%</td>
            `;
            row.addEventListener('click', () => selectState(s));
            tableBody.appendChild(row);
        });
    }

    function updateSidebar() {
        if (!selectedState) {
            selectedStatePanel.innerHTML = '<p class="text-gray-600">Click a marker on the map to view state details and scheme recommendations.</p>';
            return;
        }

        const recommendations = generateDSSRecommendations(selectedState);
        const recsHtml = recommendations.map(r => `<li><strong>${r.scheme}:</strong> ${r.reason}</li>`).join('');

        selectedStatePanel.innerHTML = `
            <div class="font-bold text-lg">${selectedState.state}</div>
            <div>Claims: ${selectedState.total_claims.toLocaleString()}</div>
            <div>Titles: ${selectedState.total_titles.toLocaleString()}</div>
            <div>Disposed: ${selectedState.claims_disposed_percent}%</div>
            <div>Land (ha): ${selectedState.total_land?.toLocaleString() ?? 'N/A'}</div>

            <div class="mt-4">
                <h4 class="font-semibold">DSS Recommendations</h4>
                <ul class="list-disc pl-5 mt-2 text-sm space-y-1">
                    ${recsHtml.length > 0 ? recsHtml : '<li>No specific recommendations triggered.</li>'}
                </ul>
            </div>
        `;
    }
    
    function renderChart(data) {
        const sortedData = [...data].sort((a, b) => b.total_titles - a.total_titles).slice(0, 8);
        const chartData = {
            labels: sortedData.map(s => s.state.split(' ')[0]),
            datasets: [{
                label: 'Total Titles',
                data: sortedData.map(s => s.total_titles),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        };

        if (topStatesChart) topStatesChart.destroy(); // Destroy previous chart instance

        topStatesChart = new Chart(chartCanvas, {
            type: 'bar',
            data: chartData,
            options: {
                indexAxis: 'y', // This makes the bar chart horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { beginAtZero: true } },
                    y: { grid: { display: false } }
                }
            }
        });
    }
    
    // --- UTILITY FUNCTIONS (Directly ported from React) ---
    function generateDSSRecommendations(stateData) {
        const recs = [];
        if (!stateData) return recs;
        if (stateData.claims_disposed_percent < 60) {
            recs.push({ scheme: 'Claims Acceleration Program', reason: `Low disposal (${stateData.claims_disposed_percent}%) — prioritize document digitization, field verification.` });
        }
        if (!stateData.total_land || stateData.total_land === 0) {
            recs.push({ scheme: 'Land Survey & GIS Validation', reason: 'Missing land records — perform satellite-assisted mapping and ground-truthing.' });
        }
        if (stateData.total_land && stateData.total_land > 1000000) {
            recs.push({ scheme: 'Community Forest Resource Management', reason: 'Large community land — invest in CFR governance and livelihood programs (MGNREGA-linked).' });
        }
        if (stateData.claims_disposed_percent >= 90) {
            recs.push({ scheme: 'Livelihoods & Value-Add', reason: 'High title grant rate — focus on scheme linking: PM-KISAN, skill upskilling, market linkages.' });
        }
        return recs;
    }
});