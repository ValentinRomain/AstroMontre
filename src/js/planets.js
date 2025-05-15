/**
 * Planetary calculations based on Paul Schlyter's algorithm
 * http://stjarnhimlen.se/comp/ppcomp.html
 */

// Constants
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Sidereal zodiac signs (make global for access from other scripts)
window.ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Planet symbols for display (make global for access from other scripts)
window.PLANET_SYMBOLS = {
  "Sun": "☉",
  "Moon": "☽",
  "Mercury": "☿",
  "Venus": "♀",
  "Mars": "♂",
  "Jupiter": "♃",
  "Saturn": "♄",
  "Uranus": "♅",
  "Neptune": "♆",
  "Pluto": "♇"
};

// Zodiac symbols for display (make global for access from other scripts)
window.ZODIAC_SYMBOLS = {
  "Aries": "♈",
  "Taurus": "♉",
  "Gemini": "♊",
  "Cancer": "♋",
  "Leo": "♌",
  "Virgo": "♍",
  "Libra": "♎",
  "Scorpio": "♏",
  "Sagittarius": "♐",
  "Capricorn": "♑",
  "Aquarius": "♒",
  "Pisces": "♓"
};

// Calculate day number from date
function getDayNumber(date) {
  // Convert date to year, month, day
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-based
  const day = date.getDate();
  const ut = date.getUTCHours() + date.getUTCMinutes() / 60.0 + date.getUTCSeconds() / 3600.0;

  // Calculate day number
  let d = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
          Math.floor(275 * month / 9) + day - 730530;

  // Add time of day
  d = d + ut / 24.0;

  return d;
}

// Normalize angle to range 0-360 degrees
function normalizeAngle(angle) {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

// Calculate the obliquity of the ecliptic
function getObliquityOfEcliptic(d) {
  return 23.4393 - 3.563E-7 * d;
}

// Calculate Sun's position
function getSunPosition(d) {
  // Orbital elements of the Sun
  const N = 0.0;
  const i = 0.0;
  const w = normalizeAngle(282.9404 + 4.70935E-5 * d);
  const a = 1.000000; // AU
  const e = 0.016709 - 1.151E-9 * d;
  const M = normalizeAngle(356.0470 + 0.9856002585 * d);

  // Eccentric anomaly
  const E = M + e * RAD_TO_DEG * Math.sin(M * DEG_TO_RAD) * (1.0 + e * Math.cos(M * DEG_TO_RAD));

  // Sun's distance and true anomaly
  const xv = Math.cos(E * DEG_TO_RAD) - e;
  const yv = Math.sqrt(1.0 - e * e) * Math.sin(E * DEG_TO_RAD);

  const v = Math.atan2(yv, xv) * RAD_TO_DEG;
  const r = Math.sqrt(xv * xv + yv * yv);

  // Sun's true longitude
  const lonSun = normalizeAngle(v + w);

  // Convert to ecliptic rectangular coordinates
  const xs = r * Math.cos(lonSun * DEG_TO_RAD);
  const ys = r * Math.sin(lonSun * DEG_TO_RAD);

  // Apply sidereal correction (Ayanamsa)
  // Using Lahiri Ayanamsa (approximately 24 degrees in 2023)
  const ayanamsa = 24.0;
  const siderealLonSun = normalizeAngle(lonSun - ayanamsa);

  // Calculate zodiac sign and degree
  const sign = Math.floor(siderealLonSun / 30);
  const degree = siderealLonSun % 30;

  // Calculate degrees, minutes, and seconds
  const degrees = Math.floor(degree);
  const minutesFloat = (degree - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);

  return {
    longitude: lonSun,
    siderealLongitude: siderealLonSun,
    distance: r,
    sign: ZODIAC_SIGNS[sign],
    degree: degree.toFixed(2),
    degrees: degrees,
    minutes: minutes,
    seconds: seconds,
    x: xs,
    y: ys
  };
}

// Calculate Moon's position
function getMoonPosition(d) {
  // Orbital elements of the Moon
  const N = normalizeAngle(125.1228 - 0.0529538083 * d);
  const i = 5.1454;
  const w = normalizeAngle(318.0634 + 0.1643573223 * d);
  const a = 60.2666; // Earth radii
  const e = 0.054900;
  const M = normalizeAngle(115.3654 + 13.0649929509 * d);

  // Eccentric anomaly (first approximation)
  let E = M + e * RAD_TO_DEG * Math.sin(M * DEG_TO_RAD) * (1.0 + e * Math.cos(M * DEG_TO_RAD));

  // Refine using iteration
  let E0 = 0;
  let count = 0;
  do {
    E0 = E;
    E = E0 - (E0 - e * RAD_TO_DEG * Math.sin(E0 * DEG_TO_RAD) - M) / (1 - e * Math.cos(E0 * DEG_TO_RAD));
    count++;
  } while (Math.abs(E - E0) > 0.001 && count < 10);

  // Moon's distance and true anomaly
  const xv = a * (Math.cos(E * DEG_TO_RAD) - e);
  const yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(E * DEG_TO_RAD));

  const v = Math.atan2(yv, xv) * RAD_TO_DEG;
  const r = Math.sqrt(xv * xv + yv * yv);

  // Moon's position in 3D space
  const xh = r * (Math.cos(N * DEG_TO_RAD) * Math.cos((v + w) * DEG_TO_RAD) -
                  Math.sin(N * DEG_TO_RAD) * Math.sin((v + w) * DEG_TO_RAD) * Math.cos(i * DEG_TO_RAD));
  const yh = r * (Math.sin(N * DEG_TO_RAD) * Math.cos((v + w) * DEG_TO_RAD) +
                  Math.cos(N * DEG_TO_RAD) * Math.sin((v + w) * DEG_TO_RAD) * Math.cos(i * DEG_TO_RAD));
  const zh = r * (Math.sin((v + w) * DEG_TO_RAD) * Math.sin(i * DEG_TO_RAD));

  // Ecliptic longitude and latitude
  const lonEcl = Math.atan2(yh, xh) * RAD_TO_DEG;
  const latEcl = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)) * RAD_TO_DEG;

  // Apply sidereal correction (Ayanamsa)
  const ayanamsa = 24.0;
  const siderealLonEcl = normalizeAngle(lonEcl - ayanamsa);

  // Calculate zodiac sign and degree
  const sign = Math.floor(siderealLonEcl / 30);
  const degree = siderealLonEcl % 30;

  // Calculate degrees, minutes, and seconds
  const degrees = Math.floor(degree);
  const minutesFloat = (degree - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);

  return {
    longitude: normalizeAngle(lonEcl),
    latitude: latEcl,
    siderealLongitude: siderealLonEcl,
    distance: r,
    sign: ZODIAC_SIGNS[sign],
    degree: degree.toFixed(2),
    degrees: degrees,
    minutes: minutes,
    seconds: seconds,
    x: xh,
    y: yh,
    z: zh
  }

// Calculate planet position (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune)
function getPlanetPosition(planet, d) {
  let N, i, w, a, e, M;

  // Set orbital elements based on planet
  switch (planet) {
    case "Mercury":
      N = normalizeAngle(48.3313 + 3.24587E-5 * d);
      i = 7.0047 + 5.00E-8 * d;
      w = normalizeAngle(29.1241 + 1.01444E-5 * d);
      a = 0.387098; // AU
      e = 0.205635 + 5.59E-10 * d;
      M = normalizeAngle(168.6562 + 4.0923344368 * d);
      break;
    case "Venus":
      N = normalizeAngle(76.6799 + 2.46590E-5 * d);
      i = 3.3946 + 2.75E-8 * d;
      w = normalizeAngle(54.8910 + 1.38374E-5 * d);
      a = 0.723330; // AU
      e = 0.006773 - 1.302E-9 * d;
      M = normalizeAngle(48.0052 + 1.6021302244 * d);
      break;
    case "Mars":
      N = normalizeAngle(49.5574 + 2.11081E-5 * d);
      i = 1.8497 - 1.78E-8 * d;
      w = normalizeAngle(286.5016 + 2.92961E-5 * d);
      a = 1.523688; // AU
      e = 0.093405 + 2.516E-9 * d;
      M = normalizeAngle(18.6021 + 0.5240207766 * d);
      break;
    case "Jupiter":
      N = normalizeAngle(100.4542 + 2.76854E-5 * d);
      i = 1.3030 - 1.557E-7 * d;
      w = normalizeAngle(273.8777 + 1.64505E-5 * d);
      a = 5.20256; // AU
      e = 0.048498 + 4.469E-9 * d;
      M = normalizeAngle(19.8950 + 0.0830853001 * d);
      break;
    case "Saturn":
      N = normalizeAngle(113.6634 + 2.38980E-5 * d);
      i = 2.4886 - 1.081E-7 * d;
      w = normalizeAngle(339.3939 + 2.97661E-5 * d);
      a = 9.55475; // AU
      e = 0.055546 - 9.499E-9 * d;
      M = normalizeAngle(316.9670 + 0.0334442282 * d);
      break;
    case "Uranus":
      N = normalizeAngle(74.0005 + 1.3978E-5 * d);
      i = 0.7733 + 1.9E-8 * d;
      w = normalizeAngle(96.6612 + 3.0565E-5 * d);
      a = 19.18171 - 1.55E-8 * d; // AU
      e = 0.047318 + 7.45E-9 * d;
      M = normalizeAngle(142.5905 + 0.011725806 * d);
      break;
    case "Neptune":
      N = normalizeAngle(131.7806 + 3.0173E-5 * d);
      i = 1.7700 - 2.55E-7 * d;
      w = normalizeAngle(272.8461 - 6.027E-6 * d);
      a = 30.05826 + 3.313E-8 * d; // AU
      e = 0.008606 + 2.15E-9 * d;
      M = normalizeAngle(260.2471 + 0.005995147 * d);
      break;
    default:
      return null;
  }

  // Eccentric anomaly (first approximation)
  let E = M + e * RAD_TO_DEG * Math.sin(M * DEG_TO_RAD) * (1.0 + e * Math.cos(M * DEG_TO_RAD));

  // Refine using iteration for higher eccentricity
  if (e > 0.05) {
    let E0 = 0;
    let count = 0;
    do {
      E0 = E;
      E = E0 - (E0 - e * RAD_TO_DEG * Math.sin(E0 * DEG_TO_RAD) - M) / (1 - e * Math.cos(E0 * DEG_TO_RAD));
      count++;
    } while (Math.abs(E - E0) > 0.001 && count < 10);
  }

  // Planet's distance and true anomaly
  const xv = a * (Math.cos(E * DEG_TO_RAD) - e);
  const yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(E * DEG_TO_RAD));

  const v = Math.atan2(yv, xv) * RAD_TO_DEG;
  const r = Math.sqrt(xv * xv + yv * yv);

  // Planet's position in 3D space (heliocentric)
  const xh = r * (Math.cos(N * DEG_TO_RAD) * Math.cos((v + w) * DEG_TO_RAD) -
                  Math.sin(N * DEG_TO_RAD) * Math.sin((v + w) * DEG_TO_RAD) * Math.cos(i * DEG_TO_RAD));
  const yh = r * (Math.sin(N * DEG_TO_RAD) * Math.cos((v + w) * DEG_TO_RAD) +
                  Math.cos(N * DEG_TO_RAD) * Math.sin((v + w) * DEG_TO_RAD) * Math.cos(i * DEG_TO_RAD));
  const zh = r * (Math.sin((v + w) * DEG_TO_RAD) * Math.sin(i * DEG_TO_RAD));

  // Ecliptic longitude and latitude
  const lonEcl = normalizeAngle(Math.atan2(yh, xh) * RAD_TO_DEG);
  const latEcl = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)) * RAD_TO_DEG;

  // Get Sun's position to convert to geocentric
  const sun = getSunPosition(d);

  // Convert to geocentric coordinates
  const xg = xh + sun.x;
  const yg = yh + sun.y;
  const zg = zh; // Sun is always in the ecliptic plane

  // Geocentric ecliptic longitude and latitude
  const lonEclGeo = normalizeAngle(Math.atan2(yg, xg) * RAD_TO_DEG);
  const latEclGeo = Math.atan2(zg, Math.sqrt(xg * xg + yg * yg)) * RAD_TO_DEG;

  // Apply sidereal correction (Ayanamsa)
  const ayanamsa = 24.0;
  const siderealLonEcl = normalizeAngle(lonEclGeo - ayanamsa);

  // Calculate zodiac sign and degree
  const sign = Math.floor(siderealLonEcl / 30);
  const degree = siderealLonEcl % 30;

  // Calculate degrees, minutes, and seconds
  const degrees = Math.floor(degree);
  const minutesFloat = (degree - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);

  return {
    longitude: lonEclGeo,
    latitude: latEclGeo,
    siderealLongitude: siderealLonEcl,
    distance: Math.sqrt(xg * xg + yg * yg + zg * zg),
    sign: ZODIAC_SIGNS[sign],
    degree: degree.toFixed(2),
    degrees: degrees,
    minutes: minutes,
    seconds: seconds,
    x: xg,
    y: yg,
    z: zg
  };
}

// Calculate all planetary positions for a given date (make global for access from other scripts)
window.calculatePlanetaryPositions = function(date) {
  const d = getDayNumber(date);

  return {
    date: date,
    sun: getSunPosition(d),
    moon: getMoonPosition(d),
    mercury: getPlanetPosition("Mercury", d),
    venus: getPlanetPosition("Venus", d),
    mars: getPlanetPosition("Mars", d),
    jupiter: getPlanetPosition("Jupiter", d),
    saturn: getPlanetPosition("Saturn", d),
    uranus: getPlanetPosition("Uranus", d),
    neptune: getPlanetPosition("Neptune", d)
  };
}
