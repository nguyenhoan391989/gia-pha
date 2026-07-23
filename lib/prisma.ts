import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton - KHỞI TẠO LƯỜI (lazy):
 * chỉ thực sự tạo client khi lần đầu được dùng, để app vẫn chạy được khi
 * CHƯA cấu hình DATABASE_URL (chế độ dữ liệu mẫu / xem thử trên máy local).
 * Vẫn tái sử dụng kết nối giữa các lần hot-reload dev và invoke serverless (Vercel).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

/**
 * Proxy chuyển tiếp mọi truy cập tới client thật, tạo client vào lần dùng đầu tiên.
 * Nhờ vậy `import { prisma }` không tự tạo client lúc nạp module.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});
