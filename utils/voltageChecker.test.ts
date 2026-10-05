// utils/voltageChecker.test.ts
import { checkVoltage } from './voltageChecker';

describe('Voltage Checker Logic', () => {
  // เคส 1: ส่งค่า 260 ต้องคืนค่า 'CRITICAL'
  it('should return CRITICAL when voltage is over 250', () => {
    // Arrange: เตรียมข้อมูล
    const testVoltage = 260;

    // Act: เรียกใช้งานฟังก์ชัน
    const result = checkVoltage(testVoltage);

    // Assert: ตรวจสอบผลลัพธ์
    expect(result).toBe('CRITICAL');
  });

  // เคส 2: ส่งค่า 230 ต้องคืนค่า 'NORMAL'[cite: 4]
  it('should return NORMAL when voltage is between 220 and 250', () => {
    const testVoltage = 230;
    const result = checkVoltage(testVoltage);
    expect(result).toBe('NORMAL');
  });

  // เคส 3: ส่งค่า 200 ต้องคืนค่า 'LOW'[cite: 4]
  it('should return LOW when voltage is under 220', () => {
    const testVoltage = 200;
    const result = checkVoltage(testVoltage);
    expect(result).toBe('LOW');
  });
});
