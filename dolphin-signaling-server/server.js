const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: Number(PORT) });
const clientsById = new Map();

function safeParse(rawMessage) {
  try {
    return JSON.parse(rawMessage.toString());
  } catch {
    return null;
  }
}

wss.on("connection", (ws) => {
  let clientId = null;

  ws.on("message", (rawMessage) => {
    const message = safeParse(rawMessage);
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "register" && typeof message.clientId === "string") {
      clientId = message.clientId;
      clientsById.set(clientId, ws);
      return;
    }

    if (typeof message.to !== "string") {
      return;
    }

    const recipient = clientsById.get(message.to);
    if (!recipient || recipient.readyState !== WebSocket.OPEN) {
      return;
    }

    recipient.send(
      JSON.stringify({
        from: clientId,
        payload: message.payload,
      })
    );
  });

  ws.on("close", () => {
    if (clientId && clientsById.get(clientId) === ws) {
      clientsById.delete(clientId);
    }
  });
});

console.log(`Signaling server listening on ws://localhost:${PORT}`);
