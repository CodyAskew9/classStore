import net from "node:net";

function portInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close(() => resolve(false));
    });
    server.listen(port);
  });
}

const busy = await portInUse(3000);
if (busy) {
  console.error("\nBuild blocked: something is listening on port 3000 (likely `npm run dev`).");
  console.error("Stop the dev server first, then run `npm run build` again.\n");
  process.exit(1);
}
