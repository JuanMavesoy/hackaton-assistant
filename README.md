# Hackaton Assistant (Angular)

Plantilla rápida para hackatón con:
- Widget flotante
- Chat (texto + voz via Web Speech API)
- Avatar visible
- CTA “Aportar ahora” (redirección mock)

## Requisitos
- Node.js 20+ (tienes Node 22)

## Instalar y correr

```bash
cd hackaton-assistant
npm install
npm start
```

## Notas
- Voz: usa `SpeechRecognition` (si el navegador la soporta) y `speechSynthesis` para leer respuestas mock.
- CTA: por defecto redirige a `/donate-mock` (pantalla simple).

