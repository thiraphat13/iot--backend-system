import amqp from 'amqplib';

async function startWorker() {
  try {
    // 1. เชื่อมต่อไปยัง RabbitMQ ตัวเดียวกัน
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(rabbitUrl);

    // 2. สร้างช่องสัญญาณและประกาศ Queue (ต้องชื่อตรงกับฝั่ง API)
    const channel = await connection.createChannel();
    const queueName = 'alert_emails';
    await channel.assertQueue(queueName, { durable: true });

    console.log(
      `[*] Waiting for messages in queue: ${queueName}. To exit press CTRL+C`,
    );

    // 3. สั่งให้ Channel ทำการ "Consume" (รอรับข้อมูล)
    channel.consume(
      queueName,
      (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());

          // 4. ลอจิกการทำงาน: Print รับข้อมูล
          console.log(
            `\n[x] Received Alert from ${data.deviceId}. Sending email to admin...`,
          );

          // จำลองความหน่วง 3 วินาที (คุยกับเซิร์ฟเวอร์อีเมล)
          setTimeout(() => {
            console.log(
              `[v] Email sent successfully! (Voltage: ${data.voltage}V)`,
            );

            // 5. ส่งคำสั่ง Acknowledge (ACK) กลับไปบอก RabbitMQ ว่าทำเสร็จแล้ว
            channel.ack(msg);
          }, 3000);
        }
      },
      { noAck: false },
    ); // ปิด Auto-Ack เพื่อให้เราสั่ง ack() เองตอนทำงานเสร็จ
  } catch (error) {
    console.error('Worker Error:', error);
  }
}

startWorker();
