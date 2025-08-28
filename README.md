# Carbon Calculator - Ultra Simple Version

A minimalist carbon footprint calculator for local infrastructure. Start with just 3 files, grow as needed.

## Quick Start

```bash
# Install dependencies
npm install

# Run the calculator
npm start
```

## Core Files

- **`calculator.ts`** - The entire calculation logic (< 50 lines)
- **`data.json`** - Your devices and usage data
- **`run.ts`** - Entry point that runs calculations

## How It Works

### 1. Simple Direct Calculation
```typescript
import { quickCalc } from './calculator'

// Calculate: 300W device running for 24 hours
const result = quickCalc(300, 24)
console.log(`CO2: ${result.co2} kg`)
```

### 2. Device-Based Calculation
```typescript
import { calculate } from './calculator'

const result = calculate({
  name: "My Server",
  type: "server",
  cpuPercent: 45,  // 45% CPU usage
  hours: 24,       // Running 24 hours
  location: "US"   // US carbon intensity
})
```

## Input Data Format

Edit `data.json` to add your devices:

```json
{
  "name": "Device Name",
  "type": "server|laptop|desktop",
  "cpuPercent": 50,     // CPU usage % (or use watts directly)
  "watts": 300,         // Direct power consumption
  "hours": 24,          // Hours of operation
  "location": "US"      // Region for carbon intensity
}
```

## Supported Regions

- `US` - United States average (0.4 kg CO2/kWh)
- `US-CA` - California (0.2 kg CO2/kWh)
- `US-TX` - Texas (0.45 kg CO2/kWh)
- `EU` - Europe average (0.3 kg CO2/kWh)
- `EU-FR` - France (0.05 kg CO2/kWh)
- `EU-DE` - Germany (0.35 kg CO2/kWh)
- `CN` - China (0.6 kg CO2/kWh)

## Optional Add-Ons

### Add CLI Support
Create `cli.ts`:
```typescript
import { quickCalc } from './calculator'

const watts = Number(process.argv[2])
const hours = Number(process.argv[3])
const result = quickCalc(watts, hours)

console.log(`Energy: ${result.kwh} kWh`)
console.log(`Carbon: ${result.co2} kg CO2`)
```

Usage: `npm run cli 300 24`

### Add Web API
Create `server.ts`:
```typescript
import express from 'express'
import { calculate } from './calculator'

const app = express()
app.use(express.json())

app.post('/calculate', (req, res) => {
  const result = calculate(req.body)
  res.json(result)
})

app.listen(3000)
console.log('API running on http://localhost:3000')
```

Usage: `npm run server`

### Add CSV Export
Create `export.ts`:
```typescript
import { calculate } from './calculator'
import data from './data.json'
import fs from 'fs'

const results = data.map(device => calculate(device))
const csv = 'Device,kWh,CO2,Cost\n' + 
  results.map(r => `${r.device},${r.kwh},${r.co2},${r.cost}`).join('\n')

fs.writeFileSync('results.csv', csv)
console.log('Exported to results.csv')
```

## Growing the Project

Start minimal, add only what you need:

1. **Day 1**: Just use `calculator.ts` directly
2. **Week 1**: Add data validation
3. **Week 2**: Add database storage
4. **Month 1**: Add web interface
5. **Month 2**: Add real-time monitoring

## Formula

The core calculation:
```
Energy (kWh) = Power (Watts) × Time (Hours) / 1000
CO2 (kg) = Energy (kWh) × Carbon Intensity (kg CO2/kWh)
```

For CPU-based calculation:
```
Watts = MinWatts + (CPU% / 100) × (MaxWatts - MinWatts)
```

## License

MIT - Use freely for any purpose