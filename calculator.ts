// Ultra-simple carbon calculator - complete implementation in < 50 lines

export interface Device {
  name: string
  type: 'server' | 'laptop' | 'desktop'
  cpuPercent?: number
  watts?: number
  hours: number
  location?: string
}

// Device power specifications (min and max watts)
const DEVICE_SPECS = {
  server: { min: 200, max: 400 },
  laptop: { min: 20, max: 80 },
  desktop: { min: 50, max: 150 }
}

// Carbon intensity by region (kg CO2 per kWh)
const CARBON_INTENSITY: Record<string, number> = {
  'US': 0.4,
  'US-CA': 0.2,    // California (cleaner energy)
  'US-TX': 0.45,   // Texas (more fossil fuels)
  'EU': 0.3,
  'EU-FR': 0.05,   // France (nuclear)
  'EU-DE': 0.35,   // Germany
  'CN': 0.6,       // China
  'DEFAULT': 0.4
}

// Main calculation function
export function calculate(device: Device) {
  // Get watts (from direct value or calculate from CPU percentage)
  let watts = device.watts
  if (!watts && device.cpuPercent !== undefined) {
    const spec = DEVICE_SPECS[device.type]
    watts = spec.min + (device.cpuPercent / 100) * (spec.max - spec.min)
  }
  
  // Calculate energy consumption
  const kwh = (watts * device.hours) / 1000
  
  // Get carbon intensity for the location
  const intensity = CARBON_INTENSITY[device.location || 'DEFAULT'] || CARBON_INTENSITY.DEFAULT
  
  // Calculate CO2 emissions
  const co2 = kwh * intensity
  
  return {
    device: device.name,
    watts: watts.toFixed(0),
    kwh: kwh.toFixed(2),
    co2: co2.toFixed(2),
    cost: (kwh * 0.12).toFixed(2)  // Assuming $0.12/kWh average
  }
}

// Simple helper: Calculate carbon from just watts and hours
export function quickCalc(watts: number, hours: number, location = 'DEFAULT') {
  const kwh = (watts * hours) / 1000
  const co2 = kwh * (CARBON_INTENSITY[location] || CARBON_INTENSITY.DEFAULT)
  return { kwh, co2 }
}