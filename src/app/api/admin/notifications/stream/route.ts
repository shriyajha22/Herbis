import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {}
      };

      try {
        const initial = await prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        const unreadCount = initial.filter((n) => !n.read).length;
        sendEvent({ type: 'initial', notifications: initial, unreadCount });
      } catch (err) {}

      const interval = setInterval(async () => {
        try {
          const latest = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
          });
          const unreadCount = latest.filter((n) => !n.read).length;
          sendEvent({ type: 'update', notifications: latest, unreadCount, timestamp: Date.now() });
        } catch (e) {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch (err) {}
        }
      }, 5000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
