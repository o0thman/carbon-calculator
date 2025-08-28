// Carbon Calculator - Browser Version

// Device specifications
const DEVICE_SPECS = {
    server: { min: 200, max: 400 },
    laptop: { min: 20, max: 80 },
    desktop: { min: 50, max: 150 }
};

// Carbon intensity by region (kg CO2 per kWh)
const CARBON_INTENSITY = {
    'US': 0.4,
    'US-CA': 0.2,
    'US-TX': 0.45,
    'EU': 0.3,
    'EU-FR': 0.05,
    'EU-DE': 0.35,
    'CN': 0.6
};

// Map coordinates for each location
const LOCATION_COORDS = {
    'US': { x: 280, y: 220, label: 'US East' },
    'US-CA': { x: 180, y: 240, label: 'US West' },
    'US-TX': { x: 230, y: 260, label: 'US Central' },
    'EU': { x: 600, y: 200, label: 'Europe' },
    'EU-FR': { x: 590, y: 210, label: 'France' },
    'EU-DE': { x: 620, y: 195, label: 'Germany' },
    'CN': { x: 840, y: 290, label: 'Thailand/SEA' }
};

// Store devices
let devices = [];

// Calculate carbon footprint
function calculate(device) {
    let watts = device.watts;
    
    if (!watts && device.cpuPercent !== undefined) {
        const spec = DEVICE_SPECS[device.type];
        watts = spec.min + (device.cpuPercent / 100) * (spec.max - spec.min);
    }
    
    const kwh = (watts * device.hours) / 1000;
    const intensity = CARBON_INTENSITY[device.location] || 0.4;
    const co2 = kwh * intensity;
    const cost = kwh * 0.12;
    
    return {
        watts: watts,
        kwh: kwh,
        co2: co2,
        cost: cost
    };
}

// Update live preview
function updatePreview() {
    const deviceType = document.getElementById('device-type').value;
    const location = document.getElementById('location').value;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    
    let watts;
    const powerMethod = document.querySelector('input[name="power-method"]:checked').value;
    
    if (powerMethod === 'cpu') {
        const cpuPercent = parseFloat(document.getElementById('cpu-percent').value);
        const spec = DEVICE_SPECS[deviceType];
        watts = spec.min + (cpuPercent / 100) * (spec.max - spec.min);
    } else {
        watts = parseFloat(document.getElementById('watts').value) || 0;
    }
    
    const result = calculate({
        type: deviceType,
        location: location,
        watts: watts,
        hours: hours
    });
    
    document.getElementById('preview-watts').textContent = `${result.watts.toFixed(0)}W`;
    document.getElementById('preview-kwh').textContent = `${result.kwh.toFixed(2)} kWh`;
    document.getElementById('preview-co2').textContent = `${result.co2.toFixed(2)} kg CO₂`;
    document.getElementById('preview-cost').textContent = `$${result.cost.toFixed(2)}`;
}

// Add device to list
function addDevice() {
    try {
        const name = document.getElementById('device-name').value;
        if (!name) {
            alert('Please enter a device name');
            return;
        }
        
        const deviceType = document.getElementById('device-type').value;
        const location = document.getElementById('location').value;
        const hours = parseFloat(document.getElementById('hours').value) || 0;
        
        console.log('Adding device:', { name, deviceType, location, hours });
        
        let device = {
            id: Date.now(),
            name: name,
            type: deviceType,
            location: location,
            hours: hours
        };
        
        const powerMethod = document.querySelector('input[name="power-method"]:checked').value;
        
        if (powerMethod === 'cpu') {
            device.cpuPercent = parseFloat(document.getElementById('cpu-percent').value);
        } else {
            device.watts = parseFloat(document.getElementById('watts').value) || 0;
        }
        
        devices.push(device);
        
        console.log('Device added successfully:', device);
        console.log('Total devices:', devices.length);
        
        // Clear form
        document.getElementById('device-name').value = '';
        document.getElementById('cpu-percent').value = 50;
        document.querySelector('.range-value').textContent = '50%';
        document.getElementById('watts').value = '';
        
        renderDevices();
        updateTotals();
        updateMapMarkers();
    } catch (error) {
        console.error('Error adding device:', error);
        alert('Error adding device: ' + error.message);
    }
}

// Update markers on the map
function updateMapMarkers() {
    const markersGroup = document.getElementById('device-markers');
    markersGroup.innerHTML = '';
    
    // Group devices by location
    const devicesByLocation = {};
    devices.forEach(device => {
        if (!devicesByLocation[device.location]) {
            devicesByLocation[device.location] = [];
        }
        devicesByLocation[device.location].push(device);
    });
    
    // Add marker for each location with devices
    Object.keys(devicesByLocation).forEach(location => {
        const coords = LOCATION_COORDS[location];
        if (!coords) return;
        
        const deviceCount = devicesByLocation[location].length;
        const result = devicesByLocation[location].reduce((acc, device) => {
            const calc = calculate(device);
            return acc + parseFloat(calc.co2);
        }, 0);
        
        // Create marker group
        const markerHTML = `
            <g class="device-marker" data-location="${location}">
                <circle cx="${coords.x}" cy="${coords.y}" r="${8 + deviceCount * 2}" 
                        fill="#22c55e" opacity="0.3" />
                <circle cx="${coords.x}" cy="${coords.y}" r="${6 + deviceCount}" 
                        fill="#22c55e" opacity="0.6">
                    <animate attributeName="r" 
                             values="${6 + deviceCount};${8 + deviceCount * 1.5};${6 + deviceCount}" 
                             dur="3s" 
                             repeatCount="indefinite"/>
                </circle>
                <circle cx="${coords.x}" cy="${coords.y}" r="3" fill="#fff"/>
                <text x="${coords.x}" y="${coords.y - 15}" 
                      fill="#22c55e" font-size="12" text-anchor="middle" font-weight="bold">
                    ${deviceCount}
                </text>
                <text x="${coords.x}" y="${coords.y + 25}" 
                      fill="#a3a3a3" font-size="10" text-anchor="middle">
                    ${result.toFixed(1)} kg CO₂
                </text>
            </g>
        `;
        
        markersGroup.innerHTML += markerHTML;
    });
}

// Render device cards
function renderDevices() {
    const grid = document.getElementById('devices-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (devices.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = devices.map(device => {
        const result = calculate(device);
        return `
            <div class="device-card">
                <button class="remove-btn" onclick="removeDevice(${device.id})">×</button>
                <div class="device-header">
                    <div class="device-name">${device.name}</div>
                </div>
                <div class="device-type">${device.type} • ${device.location}</div>
                <div class="device-stats">
                    <div class="device-stat">
                        <span class="device-stat-label">Energy</span>
                        <span class="device-stat-value">${result.kwh.toFixed(2)} kWh</span>
                    </div>
                    <div class="device-stat">
                        <span class="device-stat-label">Carbon</span>
                        <span class="device-stat-value">${result.co2.toFixed(2)} kg</span>
                    </div>
                    <div class="device-stat">
                        <span class="device-stat-label">Power</span>
                        <span class="device-stat-value">${result.watts.toFixed(0)}W</span>
                    </div>
                    <div class="device-stat">
                        <span class="device-stat-label">Cost</span>
                        <span class="device-stat-value">$${result.cost.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Remove device
function removeDevice(id) {
    devices = devices.filter(d => d.id !== id);
    renderDevices();
    updateTotals();
    updateMapMarkers();
}

// Update total statistics
function updateTotals() {
    let totalKwh = 0;
    let totalCo2 = 0;
    let totalCost = 0;
    
    devices.forEach(device => {
        const result = calculate(device);
        totalKwh += result.kwh;
        totalCo2 += result.co2;
        totalCost += result.cost;
    });
    
    // Update hero stats
    document.getElementById('total-co2').textContent = totalCo2.toFixed(2);
    document.getElementById('total-kwh').textContent = totalKwh.toFixed(2);
    document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;
    
    // Update environmental impact
    const milesEquivalent = (totalCo2 / 0.42).toFixed(0);
    const yearlyTons = ((totalCo2 * 365) / 1000).toFixed(2);
    const treesNeeded = (totalCo2 * 365 / 21).toFixed(0);
    
    document.getElementById('miles-equivalent').textContent = milesEquivalent;
    document.getElementById('yearly-total').textContent = yearlyTons;
    document.getElementById('trees-needed').textContent = treesNeeded;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // CPU slider
    const cpuSlider = document.getElementById('cpu-percent');
    cpuSlider.addEventListener('input', function() {
        document.querySelector('.range-value').textContent = `${this.value}%`;
        updatePreview();
    });
    
    // Power method toggle
    document.querySelectorAll('input[name="power-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'cpu') {
                document.getElementById('cpu-group').style.display = 'block';
                document.getElementById('watts-group').style.display = 'none';
            } else {
                document.getElementById('cpu-group').style.display = 'none';
                document.getElementById('watts-group').style.display = 'block';
            }
            updatePreview();
        });
    });
    
    // All inputs trigger preview update
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // Load sample data
    loadSampleData();
    
    // Initial preview
    updatePreview();
});

// Load sample data for demo
function loadSampleData() {
    const sampleDevices = [
        {
            id: 1,
            name: "Production Server Thailand",
            type: "server",
            cpuPercent: 45,
            hours: 24,
            location: "CN"  // Using CN for Thailand/SEA
        },
        {
            id: 2,
            name: "East Coast Server",
            type: "server",
            cpuPercent: 60,
            hours: 24,
            location: "US"
        },
        {
            id: 3,
            name: "Developer Laptop",
            type: "laptop",
            cpuPercent: 40,
            hours: 8,
            location: "US-CA"
        }
    ];
    
    devices = sampleDevices;
    renderDevices();
    updateTotals();
    updateMapMarkers();
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});