export interface Device {
    name: string;
    type: 'server' | 'laptop' | 'desktop';
    cpuPercent?: number;
    watts?: number;
    hours: number;
    location?: string;
}
export declare function calculate(device: Device): {
    device: string;
    watts: string;
    kwh: string;
    co2: string;
    cost: string;
};
export declare function quickCalc(watts: number, hours: number, location?: string): {
    kwh: number;
    co2: number;
};
//# sourceMappingURL=calculator.d.ts.map