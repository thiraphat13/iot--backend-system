# Stage 1: Dependencies & Builder
FROM node:20-alpine AS builder
WORKDIR /app

# คัดลอกไฟล์จัดการแพ็กเกจ
COPY package.json package-lock.json ./
RUN npm ci

# คัดลอก Source Code ทั้งหมด
COPY . .

# สร้าง Prisma Contract สำหรับ Prisma 8 RC
RUN npx prisma contract emit

# Build Next.js
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# คัดลอกเฉพาะไฟล์ที่จำเป็นจาก builder stage มาใช้งาน (ลบ next.config.mjs ออกแล้ว)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# กำหนดจุด Run ของ API
CMD ["node", "server.js"]