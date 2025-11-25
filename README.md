# Remote Control Agent UI

A minimal mobile-friendly Flask web interface with basic controls (toggle, switch, slider, push button) prepared for later integration with **ingescape**.

## Features
- Toggle and switch components (distinct styling)\n- Slider with live value display\n- Momentary push button with press counter\n- Responsive, touch-friendly layout\n- Placeholder JSON API endpoints for each control

## Project Structure
```
app.py                # Flask application
requirements.txt      # Python dependencies
templates/index.html  # Main HTML template
static/styles.css     # Styling
static/script.js      # Front-end logic
```

## Setup
Create / activate a virtual environment if not already active:
```bash
python -m venv .venv
source .venv/bin/activate
```
Install dependencies:
```bash
pip install -r requirements.txt
```

## Run
```bash
python app.py
```
Navigate to: http://localhost:8000

For LAN/mobile testing: ensure the device is on the same network and use the host machine IP, e.g. `http://192.168.1.42:8000`.

## Integration Points
Replace in-memory `state` dict in `app.py` with ingescape interactions:
- On control POST: send data to ingescape API / bus.
- Optionally implement polling or server-sent events to reflect external changes.

## Notes
- All endpoints return simple JSON payloads; extend schema as needed.
- Keep debug mode off (`debug=False`) in production environments.

## License
See `LICENSE`.
