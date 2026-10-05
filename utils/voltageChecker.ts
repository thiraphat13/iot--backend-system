// utils/voltageChecker.ts
export function checkVoltage(voltage: number): string {
  if (voltage > 250) return 'CRITICAL';
  if (voltage >= 220 && voltage <= 250) return 'NORMAL';
  return 'LOW';
}
