# DolphinSignaling

## Fase 2: Servidor de señalización

Servidor WebSocket que actúa como puente de texto entre Dolphin (PC) y la PWA (teléfonos) para intercambiar mensajes de señalización WebRTC.

### Ejecutar

```bash
cd dolphin-signaling-server
npm install
npm start
```

### Protocolo mínimo

- Registro de cliente:
  `{"type":"register","clientId":"dolphin-pc"}`
- Reenvío a destinatario:
  `{"to":"dolphin-pc","payload":{"signal":"..."}}`
