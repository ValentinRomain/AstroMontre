/**
 * Daily-aspects.js - Functions for calculating and displaying daily astrological aspects
 * This file contains functions for calculating aspects between planets throughout the day.
 */

// Global variables for aspect filtering
let aspectOrb = 0.5; // Default orb value in degrees
let selectedAspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx', 'semisextile', 'quintile', 'biquintile'];
let customAspects = []; // Array to store custom aspects

// Define aspect angles and their names
const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0, orb: 8, symbol: '☌' },
  { name: 'opposition', angle: 180, orb: 8, symbol: '☍' },
  { name: 'trine', angle: 120, orb: 6, symbol: '△' },
  { name: 'square', angle: 90, orb: 6, symbol: '□' },
  { name: 'sextile', angle: 60, orb: 4, symbol: '⚹' },
  { name: 'quincunx', angle: 150, orb: 3, symbol: '⚻' },
  { name: 'semisextile', angle: 30, orb: 2, symbol: '⚺' },
  { name: 'quintile', angle: 72, orb: 2, symbol: 'Q' },
  { name: 'biquintile', angle: 144, orb: 2, symbol: 'bQ' }
];

// Function to calculate daily aspects
function calculateDailyAspects() {
  console.log("Calculating daily aspects...");
  
  // Get DOM elements
  const currentDateElement = document.getElementById('current-date');
  const aspectsOrbHeader = document.getElementById('aspects-orb-header');
  const dailyAspectsBody = document.getElementById('daily-aspects-body');
  const aspectOrbSlider = document.getElementById('aspect-orb-slider');
  const orbValueDisplay = document.getElementById('orb-value');
  
  // If any element is missing, return
  if (!dailyAspectsBody || !aspectOrbSlider || !orbValueDisplay) {
    console.warn("Required DOM elements for daily aspects not found");
    return;
  }
  
  // Get orb value from slider
  aspectOrb = parseFloat(aspectOrbSlider.value);
  orbValueDisplay.textContent = aspectOrb + '°';
  
  if (aspectsOrbHeader) {
    aspectsOrbHeader.textContent = `Aspects orb ${aspectOrb}°`;
  }
  
  // Get current date and set to midnight
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Update current date display
  if (currentDateElement) {
    currentDateElement.textContent = `Date du jour : ${formatDate(today)} ${formatTime(today)}`;
  }
  
  // Get birth date from inputs
  const birthDateInput = document.getElementById('birth-date');
  const birthHourInput = document.getElementById('birth-hour');
  const birthMinuteInput = document.getElementById('birth-minute');
  
  if (!birthDateInput || !birthHourInput || !birthMinuteInput) {
    console.warn("Birth date inputs not found");
    return;
  }
  
  const birthDate = new Date(birthDateInput.value);
  birthDate.setHours(
    parseInt(birthHourInput.value) || 0,
    parseInt(birthMinuteInput.value) || 0,
    0
  );
  
  // Calculate birth positions
  const birthPositions = window.calculatePlanetaryPositions(birthDate);
  
  // Clear previous aspects
  if (dailyAspectsBody) {
    dailyAspectsBody.innerHTML = '';
  }
  
  // Get selected transit and natal planets
  const selectedTransitPlanets = window.selectedTransitPlanets || ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const selectedNatalPlanets = window.selectedNatalPlanets || ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  
  // Get selected aspects from checkboxes
  selectedAspects = [];
  document.querySelectorAll('.aspects-filter input[type="checkbox"]:checked').forEach(checkbox => {
    selectedAspects.push(checkbox.value);
  });
  
  // Calculate aspects for each hour of the day
  const dailyAspects = [];
  
  // For each transit planet
  selectedTransitPlanets.forEach(transitPlanetKey => {
    // For each natal planet
    selectedNatalPlanets.forEach(natalPlanetKey => {
      // Get natal planet position
      const natalPlanet = birthPositions[natalPlanetKey];
      if (!natalPlanet) return;
      
      // Create aspect row
      const aspectRow = document.createElement('tr');
      const aspectLabel = document.createElement('td');
      aspectLabel.className = 'aspect-label';
      aspectLabel.textContent = `${getPlanetSymbol(transitPlanetKey)} → ${getPlanetSymbol(natalPlanetKey)}`;
      aspectRow.appendChild(aspectLabel);
      
      // Calculate aspects for each hour
      let hasAspects = false;
      
      for (let hour = 0; hour <= 24; hour++) {
        const hourCell = document.createElement('td');
        hourCell.className = 'hour-cell';
        
        // Calculate transit positions for this hour
        const transitTime = new Date(currentDate);
        transitTime.setHours(hour);
        const transitPositions = window.calculatePlanetaryPositions(transitTime);
        
        // Get transit planet position
        const transitPlanet = transitPositions[transitPlanetKey];
        if (!transitPlanet) {
          aspectRow.appendChild(hourCell);
          continue;
        }
        
        // Calculate aspect
        const aspect = calculateAspectBetweenPlanets(
          transitPlanet.siderealLongitude,
          natalPlanet.siderealLongitude,
          aspectOrb
        );
        
        // If aspect found and it's in the selected aspects list
        if (aspect && selectedAspects.includes(aspect.type)) {
          hasAspects = true;
          hourCell.textContent = aspect.symbol;
          hourCell.className += ' has-aspect';
          hourCell.dataset.aspect = aspect.type;
          hourCell.dataset.orb = aspect.orb;
          hourCell.title = `${aspect.name} (${aspect.orb}°)`;
          
          // Add to daily aspects array
          dailyAspects.push({
            transitPlanet: transitPlanetKey,
            natalPlanet: natalPlanetKey,
            hour: hour,
            aspect: aspect
          });
        }
        
        // Highlight current hour
        const currentHour = today.getHours();
        if (hour === currentHour) {
          hourCell.className += ' current-hour';
        }
        
        aspectRow.appendChild(hourCell);
      }
      
      // Only add row if it has aspects
      if (hasAspects && dailyAspectsBody) {
        dailyAspectsBody.appendChild(aspectRow);
      }
    });
  });
  
  // If no aspects found, show message
  if (dailyAspectsBody && dailyAspectsBody.children.length === 0) {
    const noAspectsRow = document.createElement('tr');
    const noAspectsCell = document.createElement('td');
    noAspectsCell.colSpan = 26; // 1 for label + 25 for hours (0-24)
    noAspectsCell.textContent = 'No aspects found with the current settings.';
    noAspectsCell.className = 'no-aspects';
    noAspectsRow.appendChild(noAspectsCell);
    dailyAspectsBody.appendChild(noAspectsRow);
  }
}

// Function to calculate aspect between two planets
function calculateAspectBetweenPlanets(longitude1, longitude2, orb) {
  // Calculate the angular separation
  let angle = Math.abs(longitude1 - longitude2);
  if (angle > 180) angle = 360 - angle;
  
  // Check for aspects
  for (const aspectType of ASPECT_TYPES) {
    if (Math.abs(angle - aspectType.angle) <= orb) {
      return {
        type: aspectType.name,
        name: aspectType.name,
        angle: aspectType.angle,
        symbol: aspectType.symbol,
        orb: Math.abs(angle - aspectType.angle).toFixed(2)
      };
    }
  }
  
  // Check for custom aspects
  for (const customAspect of customAspects) {
    if (Math.abs(angle - customAspect.angle) <= orb) {
      return {
        type: customAspect.id,
        name: customAspect.name,
        angle: customAspect.angle,
        symbol: customAspect.symbol || '✧',
        orb: Math.abs(angle - customAspect.angle).toFixed(2)
      };
    }
  }
  
  return null; // No aspect found
}

// Helper function to get planet symbol
function getPlanetSymbol(planetKey) {
  const planetNames = {
    'sun': 'Sun',
    'moon': 'Moon',
    'mercury': 'Mercury',
    'venus': 'Venus',
    'mars': 'Mars',
    'jupiter': 'Jupiter',
    'saturn': 'Saturn',
    'uranus': 'Uranus',
    'neptune': 'Neptune'
  };
  
  const planetName = planetNames[planetKey];
  return window.PLANET_SYMBOLS[planetName] || planetKey;
}

// Helper function to format date (DD/MM/YYYY)
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to format time (HH:MM)
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Export function for use in other modules
window.calculateDailyAspects = calculateDailyAspects;
