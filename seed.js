async function sendBulkData() {
  const url = 'http://localhost:3000/api/telemetry';

  console.log('🚀 กำลังเริ่มยิงข้อมูลจำลอง 100 รายการ...');

  for (let i = 1; i <= 100; i++) {
    const payload = {
      device_id: `DEV-${Math.floor(Math.random() * 5) + 1}`,
      voltage: parseFloat((210 + Math.random() * 20).toFixed(2)),
      current: parseFloat((1 + Math.random() * 9).toFixed(2)),
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(`Error at record ${i}:`, err.message);
    }
  }

  console.log('✅ บันทึกข้อมูลจำลองสำเร็จ 100 รายการ!');
}

sendBulkData();
