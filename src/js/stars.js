/**
 * Stars.js - Fixed stars data and calculations for AstroClock
 * This file contains data for fixed stars and functions for calculating their positions.
 */

// Define fixed stars data (name, longitude, latitude, magnitude)
const FIXED_STARS = [
  { name: "Alpheratz", longitude: 14.18, latitude: 29.11, magnitude: 2.06, constellation: "Andromeda" },
  { name: "Hamal", longitude: 7.89, latitude: 9.93, magnitude: 2.00, constellation: "Aries" },
  { name: "Aldebaran", longitude: 69.86, latitude: -5.47, magnitude: 0.85, constellation: "Taurus" },
  { name: "Rigel", longitude: 78.63, latitude: -31.09, magnitude: 0.12, constellation: "Orion" },
  { name: "Betelgeuse", longitude: 88.79, latitude: 16.51, magnitude: 0.50, constellation: "Orion" },
  { name: "Sirius", longitude: 104.07, latitude: -39.61, magnitude: -1.46, constellation: "Canis Major" },
  { name: "Procyon", longitude: 115.32, latitude: -15.95, magnitude: 0.38, constellation: "Canis Minor" },
  { name: "Pollux", longitude: 116.33, latitude: 6.68, magnitude: 1.14, constellation: "Gemini" },
  { name: "Regulus", longitude: 149.74, latitude: 0.46, magnitude: 1.35, constellation: "Leo" },
  { name: "Spica", longitude: 203.67, latitude: -2.06, magnitude: 1.04, constellation: "Virgo" },
  { name: "Arcturus", longitude: 213.91, latitude: 30.74, magnitude: -0.04, constellation: "Boötes" },
  { name: "Antares", longitude: 248.97, latitude: -4.57, magnitude: 1.09, constellation: "Scorpius" },
  { name: "Vega", longitude: 278.48, latitude: 38.78, magnitude: 0.03, constellation: "Lyra" },
  { name: "Altair", longitude: 301.29, latitude: 8.88, magnitude: 0.77, constellation: "Aquila" },
  { name: "Fomalhaut", longitude: 342.25, latitude: -29.62, magnitude: 1.16, constellation: "Piscis Austrinus" }
];

// Function to calculate precession of equinoxes
function calculatePrecession(longitude, latitude, epoch) {
  // Simplified precession calculation
  // Assumes a precession rate of about 50.3 arcseconds per year
  const currentEpoch = new Date().getFullYear();
  const yearsSinceEpoch = currentEpoch - epoch;
  
  // Convert precession rate from arcseconds to degrees
  const precessionRate = 50.3 / 3600;
  
  // Calculate precession in longitude
  const precessionLongitude = precessionRate * yearsSinceEpoch;
  
  // Return precessed coordinates
  return {
    longitude: (longitude + precessionLongitude) % 360,
    latitude: latitude
  };
}

// Function to get fixed star position by name
function getFixedStarPosition(starName) {
  const star = FIXED_STARS.find(s => s.name.toLowerCase() === starName.toLowerCase());
  if (!star) return null;
  
  // Calculate precessed position (J2000 epoch)
  const precessed = calculatePrecession(star.longitude, star.latitude, 2000);
  
  return {
    name: star.name,
    constellation: star.constellation,
    longitude: precessed.longitude,
    latitude: precessed.latitude,
    magnitude: star.magnitude
  };
}

// Function to get all fixed stars positions
function getAllFixedStarsPositions() {
  return FIXED_STARS.map(star => {
    const precessed = calculatePrecession(star.longitude, star.latitude, 2000);
    
    return {
      name: star.name,
      constellation: star.constellation,
      longitude: precessed.longitude,
      latitude: precessed.latitude,
      magnitude: star.magnitude
    };
  });
}

// Function to find stars near a specific longitude
function getStarsNearLongitude(longitude, orb = 1.0) {
  const allStars = getAllFixedStarsPositions();
  
  return allStars.filter(star => {
    const diff = Math.abs(star.longitude - longitude);
    return diff <= orb || diff >= (360 - orb);
  });
}

// Export functions for use in other modules
window.getFixedStarPosition = getFixedStarPosition;
window.getAllFixedStarsPositions = getAllFixedStarsPositions;
window.getStarsNearLongitude = getStarsNearLongitude;
