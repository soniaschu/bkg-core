import { createServer } from "node:net";

async function findAvailablePort(fromPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.listen(fromPort, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      server.close(() => resolve(port));
    });
    server.on("error", () => resolve(findAvailablePort(fromPort + 1)));
  });
}

export async function occupyConsecutivePorts(count: number): Promise<{ start: number; servers: Bun.Server[] }> {
  const servers: Bun.Server[] = [];
  let currentPort = await findAvailablePort(0);

  for (let i = 0; i < count; i++) {
    const port = currentPort + i;
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port,
      fetch: () => new Response("ok"),
    });

    if (server.port !== port) {
      currentPort = await findAvailablePort(port + 1);
      const retryServer = Bun.serve({
        hostname: "127.0.0.1",
        port: currentPort,
        fetch: () => new Response("ok"),
      });
      servers.push(retryServer);
      currentPort = currentPort + 1;
    } else {
      servers.push(server);
    }
  }

  return { start: servers[0]!.port, servers };
}

export function closeServer(server: Bun.Server): Promise<void> {
  server.stop(true);
  return Promise.resolve();
}
