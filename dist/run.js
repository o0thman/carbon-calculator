import { calculate } from './calculator';
import data from './data.json';
console.log('Carbon Footprint Calculator');
console.log('===========================\n');
let totalKwh = 0;
let totalCo2 = 0;
let totalCost = 0;
// Calculate and display results for each device
data.forEach(device => {
    const result = calculate(device);
    console.log(`📊 ${result.device}`);
    console.log(`   Power: ${result.watts}W`);
    console.log(`   Energy: ${result.kwh} kWh`);
    console.log(`   Carbon: ${result.co2} kg CO2`);
    console.log(`   Cost: $${result.cost}`);
    console.log('');
    totalKwh += parseFloat(result.kwh);
    totalCo2 += parseFloat(result.co2);
    totalCost += parseFloat(result.cost);
});
// Display totals
console.log('===========================');
console.log('TOTALS:');
console.log(`   Total Energy: ${totalKwh.toFixed(2)} kWh`);
console.log(`   Total Carbon: ${totalCo2.toFixed(2)} kg CO2`);
console.log(`   Total Cost: $${totalCost.toFixed(2)}`);
console.log('');
console.log(`💡 Equivalent to ${(totalCo2 / 0.42).toFixed(0)} miles driven in a car`);
//# sourceMappingURL=run.js.map