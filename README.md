# zeitfuchs-api

Kleiner Speicher-Server für die Zeitfuchs-Werkstatt (Buchhaltung). Speichert nur verschlüsselte Datenblöcke in `globuu-db` (Tabelle `zf_store`). Verschlüsselt wird im Browser mit dem Werkstatt-Passwort; `ZF_AUTH_HASH` ist der SHA-256 des daraus abgeleiteten Zugangs-Tokens.

- `GET /health`
- `GET /zf/:key` – Datenblock lesen
- `PUT /zf/:key` – `{ver, data}` speichern (409 bei Konflikt)
