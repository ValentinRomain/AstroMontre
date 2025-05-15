/**
 * Ephemerides.js - Simplified ephemerides calculations for AstroClock
 * This file contains functions for calculating planetary positions
 * and other astronomical data.
 */

// Function to calculate Julian Date from a JavaScript Date object
function getJulianDate(date) {
  // Get the date components
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-based
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  // Calculate the Julian Date
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) -
           Math.floor(3 * (Math.floor((year + (month - 9) / 7) / 100) + 1) / 4) +
           Math.floor(275 * month / 9) + day + 1721028.5;

  // Add time of day
  jd += (hour + minute / 60 + second / 3600) / 24;

  return jd;
}

// Function to calculate Ayanamsa (Lahiri)
function calculateAyanamsa(jd) {
  // Simplified Lahiri ayanamsa calculation
  // Reference date: January 1, 1900 at 12:00 UTC
  const jd1900 = 2415020.0;
  const ayanamsa1900 = 22.46; // Lahiri ayanamsa on Jan 1, 1900
  const precessionRate = 50.27 / 3600; // Precession rate in degrees per year

  // Calculate years since 1900
  const yearsSince1900 = (jd - jd1900) / 365.25;

  // Calculate current ayanamsa
  const ayanamsa = ayanamsa1900 + precessionRate * yearsSince1900;

  return ayanamsa;
}

// Define planet data for calculations
const SUN = {
  meanLongitude0: 280.46,
  meanLongitudeRate: 0.9856474,
  eccentricity: 0.016709,
  perihelion: 282.94
};

const MOON = {
  meanLongitude0: 218.32,
  meanLongitudeRate: 13.17639,
  eccentricity: 0.0549,
  perihelion: 83.28
};

const MERCURY = {
  meanLongitude0: 252.25,
  meanLongitudeRate: 4.09233,
  eccentricity: 0.205631,
  perihelion: 77.46
};

const VENUS = {
  meanLongitude0: 181.98,
  meanLongitudeRate: 1.60213,
  eccentricity: 0.006773,
  perihelion: 131.53
};

const MARS = {
  meanLongitude0: 355.43,
  meanLongitudeRate: 0.5240207,
  eccentricity: 0.093405,
  perihelion: 336.04
};

const JUPITER = {
  meanLongitude0: 34.35,
  meanLongitudeRate: 0.0830853,
  eccentricity: 0.048498,
  perihelion: 14.75
};

const SATURN = {
  meanLongitude0: 50.07,
  meanLongitudeRate: 0.033459,
  eccentricity: 0.055546,
  perihelion: 92.43
};

const URANUS = {
  meanLongitude0: 314.05,
  meanLongitudeRate: 0.011698,
  eccentricity: 0.047318,
  perihelion: 170.96
};

const NEPTUNE = {
  meanLongitude0: 304.34,
  meanLongitudeRate: 0.005965,
  eccentricity: 0.008606,
  perihelion: 44.97
};

// Function to calculate planet longitude
function calculatePlanetLongitude(planet, jd) {
  // Calculate the mean longitude of the planet
  const meanLongitude = (planet.meanLongitude0 + planet.meanLongitudeRate * (jd - 2451545.0)) % 360;

  // Add a simple approximation of the equation of center
  const equationOfCenter = planet.eccentricity * Math.sin((meanLongitude - planet.perihelion) * Math.PI / 180) * 180 / Math.PI;

  // Calculate the true longitude
  let trueLongitude = (meanLongitude + equationOfCenter) % 360;
  if (trueLongitude < 0) trueLongitude += 360;

  return trueLongitude;
}

// Function to calculate aspect between two planets
function calculateAspect(longitude1, longitude2) {
  // Calculate the angular separation
  let angle = Math.abs(longitude1 - longitude2);
  if (angle > 180) angle = 360 - angle;

  // Define aspect types and their orbs
  const aspects = [
    { type: 'conjunction', angle: 0, orb: 8 },
    { type: 'opposition', angle: 180, orb: 8 },
    { type: 'trine', angle: 120, orb: 6 },
    { type: 'square', angle: 90, orb: 6 },
    { type: 'sextile', angle: 60, orb: 4 },
    { type: 'quincunx', angle: 150, orb: 3 },
    { type: 'semisextile', angle: 30, orb: 2 },
    { type: 'quintile', angle: 72, orb: 2 },
    { type: 'biquintile', angle: 144, orb: 2 }
  ];

  // Check if the angle matches any aspect
  for (const aspect of aspects) {
    if (Math.abs(angle - aspect.angle) <= aspect.orb) {
      return {
        type: aspect.type,
        angle: aspect.angle,
        exactAngle: angle.toFixed(2),
        orb: Math.abs(angle - aspect.angle).toFixed(2)
      };
    }
  }

  return null; // No aspect found
}

// Export functions for use in other modules
window.getJulianDate = getJulianDate;
window.calculateAyanamsa = calculateAyanamsa;
window.calculatePlanetLongitude = calculatePlanetLongitude;
window.calculateAspect = calculateAspect;
