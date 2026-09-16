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
  const cleanupRegistration = () => {
    if (clientId && clientsById.get(clientId) === ws) {
      clientsById.delete(clientId);
    }
  };

  ws.on("message", (rawMessage) => {
    const message = safeParse(rawMessage);
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "register" && typeof message.clientId === "string") {
      const registeredSocket = clientsById.get(message.clientId);
      if (registeredSocket && registeredSocket !== ws) {
        if (registeredSocket.readyState !== WebSocket.OPEN) {
          clientsById.delete(message.clientId);
        } else {
          return;
        }
      }

      if (clientId && clientsById.get(clientId) === ws) {
        clientsById.delete(clientId);
      }
      clientId = message.clientId;
      clientsById.set(clientId, ws);
      return;
    }

    if (!clientId) {
      return;
    }

    if (typeof message.to !== "string") {
      return;
    }

    const recipient = clientsById.get(message.to);
    if (!recipient || recipient.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      recipient.send(
        JSON.stringify({
          from: clientId,
          payload: message.payload,
        }),
        (error) => {
          if (error && recipient.readyState !== WebSocket.OPEN) {
            clientsById.delete(message.to);
          }
        }
      );
    } catch {
      if (recipient.readyState !== WebSocket.OPEN) {
        clientsById.delete(message.to);
      }
    }
  });

  ws.on("close", cleanupRegistration);
  ws.on("error", () => {
    if (ws.readyState !== WebSocket.OPEN) {
      cleanupRegistration();
    }
  });
});

console.log(`Signaling server listening on ws://localhost:${PORT}`);
