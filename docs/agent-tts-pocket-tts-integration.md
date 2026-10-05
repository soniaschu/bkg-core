# BKG Agent-TTS + Pocket-TTS

BKG now treats Agent-TTS as the voice layer and Pocket-TTS OpenAI Streaming Server as a local OpenAI-compatible backend.

## Backend

Repository:
https://github.com/teddybear082/pocket-tts-openai_streaming_server

The server provides:

- OpenAI-compatible `POST /v1/audio/speech`
- `GET /v1/voices`
- `GET /health`
- streaming responses
- community voices
- voice cloning
- CPU-oriented local operation
- Docker deployment

## BKG integration

Agent-TTS already has an OpenAI-compatible TTS provider. The integration was tightened so an OpenAI-compatible endpoint can explicitly run without authentication:

```js
options: {
  authRequired: false,
  responseFormat: 'mp3',
  speed: 1.0,
}
```

The Authorization header is only emitted when an API key is actually configured.

This means Pocket-TTS remains a local backend rather than pretending to be OpenAI.

## Architecture

OpenCode -> Agent-TTS -> OpenAI-compatible TTS adapter -> Pocket-TTS -> audio

Agent-TTS remains responsible for parsing OpenCode messages, filtering, queueing, persistence and playback. Pocket-TTS remains responsible for speech synthesis and voices.

This separation keeps the BKG orchestration layer independent of the TTS implementation.
