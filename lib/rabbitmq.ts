import amqp from 'amqplib';

interface AlertMessage {
  deviceId: string;
  voltage: number;
  time: string;
}

// 1. เปลี่ยนจาก amqp.Connection เป็น amqp.ChannelModel
let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

export async function getRabbitMQChannel() {
  if (channel) return channel;

  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    // 2. รับค่าตามปกติได้เลย (ลบ as unknown as ออก)
    connection = await amqp.connect(rabbitUrl);

    channel = await connection.createChannel();
    await channel!.assertQueue('alert_emails', { durable: true });

    return channel;
  } catch (error) {
    console.error('RabbitMQ Connection Error:', error);
    throw error;
  }
}

export async function publishAlertEmail(message: AlertMessage) {
  const ch = await getRabbitMQChannel();

  if (!ch) {
    console.error('RabbitMQ channel is not ready');
    return;
  }

  ch.sendToQueue('alert_emails', Buffer.from(JSON.stringify(message)));
}
