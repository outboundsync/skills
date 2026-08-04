# Changelog

All notable changes to this project are documented in this file.

This project uses Calendar Versioning with tags in the format `YYYY.MM.DD.N`.

<!-- release entries -->

## Unreleased

### Features

- Add `api` Agent Skill — OutboundSync API v1 umbrella (auth, vocabulary, discovery, routing).
- Add `sync-monitoring` Agent Skill — Sync Monitoring Webhooks/events diagnose; mutations only after explicit confirmation.
- Add `omnichannel-campaigns` Agent Skill — email + LinkedIn/social sequence planning.
- Update `preflight` for Sources vs Sync Monitoring disambiguation and reply-relays advisory.

### Security

- Document multi-skill `OUTBOUNDSYNC_API_KEY` usage and write-on-confirm protocol for `sync-monitoring`.
