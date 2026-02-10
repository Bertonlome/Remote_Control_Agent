from flask import Flask, render_template, send_from_directory, jsonify, request
import signal as sig_module
import time
import sys
import os
import threading
import logging
from echo import *

app = Flask(__name__)

# Suppress Flask's default request logging for /api/state to reduce console clutter
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Initial/default state for all controls
initial_state = {
    "left_engine_glass": True,  # True = with glass, False = without glass
    "right_engine_glass": True,
}

# Current state (starts as copy of initial state)
state = initial_state.copy()
reset_counter = 0  # Increments each time reset is called

# Add route to serve images
@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('images', filename)

port = 5670
agent_name = "Remote_Control_Agent"
device = "A7500_NETGEAR" 
verbose = False
is_interrupted = False

def signal_handler(signal_received, frame):
    global is_interrupted
    print("\n" + "=" * 50)
    print("Shutting down Remote Control Agent...")
    print("=" * 50)
    is_interrupted = True
    
    # Stop Ingescape agent
    try:
        igs.stop()
        print("✓ Ingescape agent stopped")
    except Exception as e:
        print(f"⚠ Error stopping Ingescape: {e}")
    
    print("Exiting...")
    sys.exit(0)

def on_agent_event_callback(event, uuid, name, event_data, my_data):
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    # add code here if needed

def on_freeze_callback(is_frozen, my_data):
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    # add code here if needed

def bool_input_callback(io_type, name, value_type, value, my_data):
    if name == "master_warning":
        time.sleep(0.1)
        # add code here if needed
    elif name == "master_caution":
        time.sleep(0.1)
        # add code here if needed
    elif name == "l_eng_fire":
        time.sleep(0.1)
        # add code here if needed
    elif name == "r_eng_fire":
        time.sleep(0.1)
        # add code here if needed

def int_input_callback(io_type, name, value_type, value, my_data):
    if name == "fire_warn_test":
        time.sleep(0.1)
        # add code here if needed

def impulsion_input_callback(io_type, name, value_type, value, my_data):
    if name == "reset":
        time.sleep(0.1)
        # Reset to initial state
        global state, reset_counter
        state = initial_state.copy()
        reset_counter += 1
        print(f"State reset to defaults (reset #{reset_counter})")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state")
def get_state():
    return jsonify({"state": state, "reset_counter": reset_counter})

@app.route("/api/update_engine", methods=["POST"])
def update_engine():
    global state
    data = request.get_json(silent=True) or {}
    side = data.get("side")  # "left" or "right"
    has_glass = data.get("has_glass", True)
    
    if side in ["left", "right"]:
        state_key = f"{side}_engine_glass"
        state[state_key] = has_glass
        return jsonify({"ok": True, "state": state})
    return jsonify({"ok": False, "error": "Invalid side"}), 400

@app.route("/api/reset", methods=["POST"])
def reset_state():
    global state, reset_counter
    state = initial_state.copy()
    reset_counter += 1
    return jsonify({"ok": True, "state": state, "reset_counter": reset_counter})

if __name__ == "__main__":
    print("=" * 50)
    print("Starting Remote Control Agent")
    print("=" * 50)
    
    # Initialize Ingescape agent
    igs.agent_set_name(agent_name)
    igs.definition_set_version("1.0")
    igs.log_set_console(verbose)
    igs.log_set_file(True, None)
    igs.log_set_stream(verbose)
    igs.set_command_line(sys.executable + " " + " ".join(sys.argv))

    agent = Echo()

    igs.observe_agent_events(on_agent_event_callback, agent)
    igs.observe_freeze(on_freeze_callback, agent)

    igs.log_set_console(True)
    igs.log_set_console_level(igs.LOG_INFO)

    igs.input_create("reset", igs.IMPULSION_T, None)
    igs.input_create("master_warning", igs.BOOL_T , None)
    igs.input_create("master_caution", igs.BOOL_T , None)
    igs.input_create("l_eng_fire", igs.BOOL_T , None)
    igs.input_create("r_eng_fire", igs.BOOL_T , None)
    igs.input_create("fire_warn_test", igs.INTEGER_T , None)

    igs.output_create("master_warning", igs.IMPULSION_T , None)
    igs.output_create("master_caution", igs.IMPULSION_T , None)
    igs.output_create("l_eng_fire_button", igs.IMPULSION_T , None)
    igs.output_create("r_eng_fire_button", igs.IMPULSION_T , None)
    igs.output_create("fire_warn_test", igs.INTEGER_T , None)

    igs.observe_input("reset", impulsion_input_callback, None)
    igs.observe_input("master_warning", bool_input_callback, None)
    igs.observe_input("master_caution", bool_input_callback, None)
    igs.observe_input("l_eng_fire", bool_input_callback, None)
    igs.observe_input("r_eng_fire", bool_input_callback, None)
    igs.observe_input("fire_warn_test", int_input_callback, None)

    try:
        igs.start_with_device(device, port)
    except Exception as e:
        print(f"❌ Failed to start Ingescape agent: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print("✓ Ingescape agent started")
    print("✓ Starting Flask web server on http://0.0.0.0:8000")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    # Register signal handler after everything is initialized
    sig_module.signal(sig_module.SIGINT, signal_handler)
    
    try:
        app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        print("\n" + "=" * 50)
        print("Shutting down Remote Control Agent...")
        print("=" * 50)
        try:
            igs.stop()
            print("✓ Ingescape agent stopped")
        except:
            pass
        print("Exiting...")
        sys.exit(0)