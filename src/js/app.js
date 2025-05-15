// Global variables for planet filtering
window.selectedTransitPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
window.selectedNatalPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  console.log('AstroClock App initialized');

  // Get DOM elements
  const birthDateInput = document.getElementById('birth-date');
  const birthHourInput = document.getElementById('birth-hour');
  const birthMinuteInput = document.getElementById('birth-minute');
  const transitDateInput = document.getElementById('transit-date');
  const transitHourInput = document.getElementById('transit-hour');
  const transitMinuteInput = document.getElementById('transit-minute');
  const calculateBtn = document.getElementById('calculate-btn');
  const chartCanvas = document.getElementById('chart-canvas');

  // Set default dates
  const today = new Date();
  const defaultBirthDate = new Date(1991, 11, 17); // December 17, 1991

  // Format dates for input fields
  birthDateInput.value = formatDateForInput(defaultBirthDate);
  transitDateInput.value = formatDateForInput(today);

  // Set default times
  birthHourInput.value = '7';
  birthMinuteInput.value = '27';
  transitHourInput.value = today.getHours().toString();
  transitMinuteInput.value = today.getMinutes().toString();

  // Add event listener for calculate button
  calculateBtn.addEventListener('click', calculateChart);

  // Auto-update transit time every second for real-time updates
  setInterval(updateTransitTime, 1000);
  updateTransitTime();

  // Initial chart calculation
  calculateChart();

  // Initialize tooltip
  setupZodiacTooltip();

  // Start real-time animation of the zodiac
  startZodiacClock();

  // Function to update transit time
  function updateTransitTime() {
    const now = new Date();
    transitDateInput.value = formatDateForInput(now);
    transitHourInput.value = now.getHours().toString();
    transitMinuteInput.value = now.getMinutes().toString();

    // Store seconds and milliseconds for precise calculations
    transitDateInput.dataset.seconds = now.getSeconds();
    transitDateInput.dataset.milliseconds = now.getMilliseconds();

    // Update chart if auto-update is enabled
    if (window.autoUpdateEnabled !== false) {
      calculateChart(true); // Pass true to indicate this is a real-time update
    }
  }

  // Function to format date for input fields (YYYY-MM-DD)
  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Main function to calculate and display the chart
  function calculateChart(isRealTimeUpdate = false) {
    // Get birth date and time
    const birthDate = new Date(birthDateInput.value);
    birthDate.setHours(
      parseInt(birthHourInput.value) || 0,
      parseInt(birthMinuteInput.value) || 0,
      0
    );

    // Get transit date and time
    const transitDate = new Date(transitDateInput.value);

    // Include seconds and milliseconds for precise real-time calculations
    const transitSeconds = parseInt(transitDateInput.dataset.seconds || 0);
    const transitMilliseconds = parseInt(transitDateInput.dataset.milliseconds || 0);

    transitDate.setHours(
      parseInt(transitHourInput.value) || 0,
      parseInt(transitMinuteInput.value) || 0,
      transitSeconds,
      transitMilliseconds
    );

    // Calculate planetary positions
    const birthPositions = calculatePlanetaryPositions(birthDate);
    const transitPositions = calculatePlanetaryPositions(transitDate);

    // Draw full 360° zodiac
    drawFullZodiac(birthPositions, transitPositions);

    // Draw circular proportional zodiac (30° mode)
    drawCircularProportionalZodiac(birthPositions, transitPositions);

    // Update daily aspects planning if not a real-time update
    if (!isRealTimeUpdate && typeof calculateDailyAspects === 'function') {
      calculateDailyAspects();
    }
  }

  // Function to setup tooltip for zodiac charts
  function setupZodiacTooltip() {
    const fullZodiacCanvas = document.getElementById('full-zodiac-canvas');
    const fullZodiacTooltip = document.getElementById('full-zodiac-tooltip');

    const circularZodiacCanvas = document.getElementById('circular-zodiac-canvas');
    const planetTooltip = document.getElementById('planet-tooltip');

    if (fullZodiacCanvas && fullZodiacTooltip) {
      fullZodiacCanvas.addEventListener('mousemove', function(event) {
        handleCanvasMouseMove(event, fullZodiacCanvas, fullZodiacTooltip);
      });

      fullZodiacCanvas.addEventListener('mouseout', function() {
        fullZodiacTooltip.style.display = 'none';
      });
    }

    if (circularZodiacCanvas && planetTooltip) {
      circularZodiacCanvas.addEventListener('mousemove', function(event) {
        handleCanvasMouseMove(event, circularZodiacCanvas, planetTooltip);
      });

      circularZodiacCanvas.addEventListener('mouseout', function() {
        planetTooltip.style.display = 'none';
      });
    }
  }

  // Function to handle mouse move on canvas for tooltips
  function handleCanvasMouseMove(event, canvas, tooltip) {
    if (!canvas.planetData) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if mouse is over any planet
    let hoveredPlanet = null;

    // Check birth planets
    for (const planet of canvas.planetData.birth || []) {
      const dx = x - planet.x;
      const dy = y - planet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= planet.radius) {
        hoveredPlanet = { ...planet, isBirth: true };
        break;
      }
    }

    // Check transit planets if no birth planet is hovered
    if (!hoveredPlanet) {
      for (const planet of canvas.planetData.transit || []) {
        const dx = x - planet.x;
        const dy = y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= planet.radius) {
          hoveredPlanet = { ...planet, isBirth: false };
          break;
        }
      }
    }

    // Show tooltip if a planet is hovered
    if (hoveredPlanet) {
      const planetData = hoveredPlanet.data;
      const planetName = hoveredPlanet.planet.name;
      const sign = planetData.sign;
      const degrees = planetData.degrees;
      const minutes = planetData.minutes;
      const seconds = planetData.seconds;

      tooltip.innerHTML = `
        <div class="tooltip-title">${planetName} ${hoveredPlanet.isBirth ? '(Birth)' : '(Transit)'}</div>
        <div class="tooltip-content">
          <div>${sign} ${degrees}° ${minutes}' ${seconds}"</div>
        </div>
      `;

      tooltip.style.display = 'block';
      tooltip.style.left = (event.clientX - rect.left + 10) + 'px';
      tooltip.style.top = (event.clientY - rect.top + 10) + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  }

  // Function to start real-time zodiac clock
  function startZodiacClock() {
    // Update every second
    setInterval(function() {
      // Only update if auto-update is enabled
      if (window.autoUpdateEnabled !== false) {
        calculateChart(true);
      }
    }, 1000);
  }

  // Function to draw the full 360° zodiac
  function drawFullZodiac(birthPositions, transitPositions) {
    const canvas = document.getElementById('full-zodiac-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get the container dimensions
    const container = canvas.parentElement;
    if (!container) return;

    // Make the canvas a perfect square based on the container width
    const containerWidth = container.offsetWidth;
    const size = Math.min(containerWidth, 600); // Limit maximum size

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Update canvas style to maintain aspect ratio
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const width = size;
    const height = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Store canvas data for tooltip functionality
    canvas.dataset.centerX = centerX;
    canvas.dataset.centerY = centerY;
    canvas.dataset.radius = radius;

    // Initialize planet data for tooltip
    if (!canvas.planetData) {
      canvas.planetData = {
        birth: [],
        transit: []
      };
    } else {
      canvas.planetData.birth = [];
      canvas.planetData.transit = [];
    }

    // Create gradient background
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius * 1.5
    );
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f7f7ff');

    // Clear canvas with gradient background
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw zodiac wheel
    drawZodiacWheel(ctx, centerX, centerY, radius);

    // Draw planets
    drawPlanets(ctx, centerX, centerY, radius, birthPositions, transitPositions, canvas);
  }

  // Function to draw the zodiac wheel
  function drawZodiacWheel(ctx, centerX, centerY, radius) {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw zodiac signs
    for (let i = 0; i < 12; i++) {
      // Calculate angle for this sign (starting from top, going clockwise)
      const startAngle = ((i * 30) - 90) * Math.PI / 180;
      const endAngle = (((i + 1) * 30) - 90) * Math.PI / 180;

      // Draw sign segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Alternate colors for better visibility
      const isEven = i % 2 === 0;
      ctx.fillStyle = isEven ? 'rgba(108, 92, 231, 0.05)' : 'rgba(108, 92, 231, 0.1)';
      ctx.fill();

      // Draw radial lines
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(startAngle),
        centerY + radius * Math.sin(startAngle)
      );
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw sign symbol
      const symbolAngle = ((i * 30) + 15 - 90) * Math.PI / 180;
      const symbolRadius = radius * 0.85;
      const symbolX = centerX + symbolRadius * Math.cos(symbolAngle);
      const symbolY = centerY + symbolRadius * Math.sin(symbolAngle);

      // Get zodiac symbol
      const signName = ZODIAC_SIGNS[i];
      const signSymbol = ZODIAC_SYMBOLS[signName];

      // Draw sign symbol
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'rgba(108, 92, 231, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(signSymbol, symbolX, symbolY);
    }

    // Draw degree markers (every 5 degrees)
    for (let i = 0; i < 72; i++) {
      const angle = (i * 5 - 90) * Math.PI / 180;
      const isMainDegree = i % 6 === 0; // Every 30 degrees (sign boundary)

      const innerMark = isMainDegree ? radius * 0.95 : radius * 0.98;

      ctx.beginPath();
      ctx.moveTo(
        centerX + innerMark * Math.cos(angle),
        centerY + innerMark * Math.sin(angle)
      );
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );

      if (isMainDegree) {
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.5)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.15)';
        ctx.lineWidth = 0.5;
      }

      ctx.stroke();
    }
  }

  // Function to draw planets on the chart
  function drawPlanets(ctx, centerX, centerY, radius, birthPositions, transitPositions, canvas) {
    // Planet colors
    const planetColors = {
      'Sun': '#ff9500',
      'Moon': '#c7c7cc',
      'Mercury': '#5ac8fa',
      'Venus': '#4cd964',
      'Mars': '#ff3b30',
      'Jupiter': '#af52de',
      'Saturn': '#ffcc00',
      'Uranus': '#5ac8fa',
      'Neptune': '#5856d6'
    };

    // Define planets to draw
    const planets = [
      { key: 'sun', name: 'Sun' },
      { key: 'moon', name: 'Moon' },
      { key: 'mercury', name: 'Mercury' },
      { key: 'venus', name: 'Venus' },
      { key: 'mars', name: 'Mars' },
      { key: 'jupiter', name: 'Jupiter' },
      { key: 'saturn', name: 'Saturn' },
      { key: 'uranus', name: 'Uranus' },
      { key: 'neptune', name: 'Neptune' }
    ];

    // Draw birth planets
    drawPlanetSet(ctx, centerX, centerY, radius, birthPositions, planets, false, canvas);

    // Draw transit planets
    drawPlanetSet(ctx, centerX, centerY, radius, transitPositions, planets, true, canvas);
  }

  // Function to draw a set of planets (birth or transit)
  function drawPlanetSet(ctx, centerX, centerY, radius, positions, planets, isTransit, canvas) {
    // Filter planets based on user selection
    const filteredPlanets = planets.filter(planet => {
      if (isTransit) {
        return selectedTransitPlanets.includes(planet.key);
      } else {
        return selectedNatalPlanets.includes(planet.key);
      }
    });

    // Draw each planet
    filteredPlanets.forEach(planet => {
      const planetData = positions[planet.key];
      if (!planetData) return;

      // Calculate position on the chart (adjust angle to start from top, going clockwise)
      const longitude = planetData.siderealLongitude;
      const angle = ((longitude - 90) * Math.PI / 180);

      // Adjust planet radius for better spacing
      const planetRadius = isTransit ? radius * 0.65 : radius * 0.45;
      const x = centerX + planetRadius * Math.cos(angle);
      const y = centerY + planetRadius * Math.sin(angle);

      // Draw planet
      const circleSize = isTransit ? 12 : 15;

      // Add shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Draw main circle
      ctx.beginPath();
      ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();

      // Draw circle border
      ctx.beginPath();
      ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
      ctx.strokeStyle = isTransit ? '#0984e3' : '#d63031'; // Blue for transit, red for natal
      ctx.lineWidth = 2;
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw planet symbol
      const planetSymbol = PLANET_SYMBOLS[planet.name] || planet.name.substring(0, 2);
      ctx.font = isTransit ? 'bold 14px Arial' : 'bold 16px Arial';
      ctx.fillStyle = isTransit ? '#0984e3' : '#d63031'; // Blue for transit, red for natal
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planetSymbol, x, y);

      // Store planet data for tooltip
      if (canvas && canvas.planetData) {
        const planetPosition = {
          planet,
          x,
          y,
          data: planetData,
          radius: circleSize
        };

        if (isTransit) {
          canvas.planetData.transit.push(planetPosition);
        } else {
          canvas.planetData.birth.push(planetPosition);
        }
      }

      // Draw a line from center to the degree on the outer circle
      const degreeAngle = angle;
      const degreeX = centerX + radius * Math.cos(degreeAngle);
      const degreeY = centerY + radius * Math.sin(degreeAngle);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(degreeX, degreeY);
      ctx.strokeStyle = isTransit ? 'rgba(9, 132, 227, 0.3)' : 'rgba(214, 48, 49, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw a small dot at the degree position
      ctx.beginPath();
      ctx.arc(degreeX, degreeY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = isTransit ? '#0984e3' : '#d63031';
      ctx.fill();
    });
  }

  // Function to draw the circular proportional zodiac
  function drawCircularProportionalZodiac(birthPositions, transitPositions) {
    const canvas = document.getElementById('circular-zodiac-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get the container dimensions
    const container = canvas.parentElement;
    if (!container) return;

    // Make the canvas a perfect square based on the container width
    const containerWidth = container.offsetWidth;
    const size = Math.min(containerWidth, 600); // Limit maximum size

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Update canvas style to maintain aspect ratio
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const width = size;
    const height = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Store canvas data for tooltip functionality
    canvas.dataset.centerX = centerX;
    canvas.dataset.centerY = centerY;
    canvas.dataset.radius = radius;

    // Initialize planet data for tooltip
    if (!canvas.planetData) {
      canvas.planetData = {
        birth: [],
        transit: []
      };
    } else {
      canvas.planetData.birth = [];
      canvas.planetData.transit = [];
    }

    // Create gradient background
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius * 1.5
    );
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f7f7ff');

    // Clear canvas with gradient background
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw inner circle
    const innerRadius = radius * 0.6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#6c5ce7';
    ctx.fill();

    // Draw degree markers (every 5 degrees)
    for (let i = 0; i < 72; i++) {
      const angle = (i * 5 - 90) * Math.PI / 180;
      const isMainDegree = i % 6 === 0; // Every 30 degrees

      const innerMark = isMainDegree ? radius * 0.95 : radius * 0.98;

      ctx.beginPath();
      ctx.moveTo(
        centerX + innerMark * Math.cos(angle),
        centerY + innerMark * Math.sin(angle)
      );
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );

      if (isMainDegree) {
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.5)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.15)';
        ctx.lineWidth = 0.5;
      }

      ctx.stroke();
    }

    // Add degree labels (0°, 10°, 20°, 30°)
    const degreeLabels = [0, 10, 20, 30];

    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(108, 92, 231, 0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    degreeLabels.forEach(degree => {
      // Convert degree to angle (multiply by 12 to map 0-30° to 0-360°)
      const labelAngle = ((degree * 12 - 90) * Math.PI / 180);
      const labelRadius = radius + 20;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);

      ctx.fillText(`${degree}°`, labelX, labelY);
    });

    // Define planets to draw
    const planets = [
      { key: 'sun', name: 'Sun' },
      { key: 'moon', name: 'Moon' },
      { key: 'mercury', name: 'Mercury' },
      { key: 'venus', name: 'Venus' },
      { key: 'mars', name: 'Mars' },
      { key: 'jupiter', name: 'Jupiter' },
      { key: 'saturn', name: 'Saturn' },
      { key: 'uranus', name: 'Uranus' },
      { key: 'neptune', name: 'Neptune' }
    ];

    // Draw birth planets
    drawProportionalPlanets(ctx, centerX, centerY, radius, birthPositions, planets, false, canvas);

    // Draw transit planets
    drawProportionalPlanets(ctx, centerX, centerY, radius, transitPositions, planets, true, canvas);
  }

  // Function to draw planets on the proportional zodiac
  function drawProportionalPlanets(ctx, centerX, centerY, radius, positions, planets, isTransit, canvas) {
    // Filter planets based on user selection
    const filteredPlanets = planets.filter(planet => {
      if (isTransit) {
        return selectedTransitPlanets.includes(planet.key);
      } else {
        return selectedNatalPlanets.includes(planet.key);
      }
    });

    // Draw each planet
    filteredPlanets.forEach(planet => {
      const planetData = positions[planet.key];
      if (!planetData) return;

      // Use only the degree within the sign (0-30°) for proportional display
      const degree = parseFloat(planetData.degree);

      // Map degree (0-30°) to angle (0-360°) for the chart
      // We multiply by 12 to make a full circle, and subtract 90 to start from top
      const angle = ((degree * 12 - 90) * Math.PI / 180);

      // Adjust planet radius for better spacing
      const planetRadius = isTransit ? radius * 0.65 : radius * 0.45;
      const x = centerX + planetRadius * Math.cos(angle);
      const y = centerY + planetRadius * Math.sin(angle);

      // Draw planet
      const circleSize = isTransit ? 12 : 15;

      // Add shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Draw main circle
      ctx.beginPath();
      ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();

      // Draw circle border
      ctx.beginPath();
      ctx.arc(x, y, circleSize, 0, 2 * Math.PI);
      ctx.strokeStyle = isTransit ? '#0984e3' : '#d63031'; // Blue for transit, red for natal
      ctx.lineWidth = 2;
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw planet symbol
      const planetSymbol = PLANET_SYMBOLS[planet.name] || planet.name.substring(0, 2);
      ctx.font = isTransit ? 'bold 14px Arial' : 'bold 16px Arial';
      ctx.fillStyle = isTransit ? '#0984e3' : '#d63031'; // Blue for transit, red for natal
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planetSymbol, x, y);

      // Store planet data for tooltip
      if (canvas && canvas.planetData) {
        const planetPosition = {
          planet,
          x,
          y,
          data: planetData,
          radius: circleSize
        };

        if (isTransit) {
          canvas.planetData.transit.push(planetPosition);
        } else {
          canvas.planetData.birth.push(planetPosition);
        }
      }

      // Draw a line from center to the degree on the outer circle
      const degreeAngle = angle;
      const degreeX = centerX + radius * Math.cos(degreeAngle);
      const degreeY = centerY + radius * Math.sin(degreeAngle);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(degreeX, degreeY);
      ctx.strokeStyle = isTransit ? 'rgba(9, 132, 227, 0.3)' : 'rgba(214, 48, 49, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw a small dot at the degree position
      ctx.beginPath();
      ctx.arc(degreeX, degreeY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = isTransit ? '#0984e3' : '#d63031';
      ctx.fill();
    });
  }
});
