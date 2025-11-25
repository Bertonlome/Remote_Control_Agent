from flask import Flask, render_template, request, jsonify
import signal as sig_module
import time
import sys
import os
import threading
from echo import *

app = Flask(__name__)

port = 5670
agent_name = "Remote_Control_Agent"
device = "wlp0s20f3" 
verbose = False
is_interrupted = False

def signal_handler(signal_received, frame):
    global is_interrupted
    print("\n", sig_module.strsignal(signal_received), sep="")
    is_interrupted = True

def on_agent_event_callback(event, uuid, name, event_data, my_data):
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    # add code here if needed

def on_freeze_callback(is_frozen, my_data):
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    # add code here if needed

# In-memory state placeholders (replace with ingescape integration later)
state = {
    "toggle1": False,
    "toggle2": False,
    "toggle3": False,
    "toggle4": False,
    "slider": 0.0,
    "button1_presses": 0,
    "button2_presses": 0,
    "button3_presses": 0,
    "button4_presses": 0,
    "joystick1_x": 0.0,
    "joystick1_y": 0.0,
    "joystick2_x": 0.0,
    "joystick2_y": 0.0,
    "joystick1_invert_x": False,
    "joystick1_invert_y": False,
    "joystick2_invert_x": False,
    "joystick2_invert_y": False,
    "int_value": 0,
    "string_value": "",
    "double_value": 0.0,
    "bool_value": False,
}

@app.route("/")
def index():
    return render_template("index.html", state=state)

@app.post("/api/toggle1")
def api_toggle1():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["toggle1"]))
    state["toggle1"] = value
    agent.toggle_1_o = value
    return jsonify({"ok": True, "toggle1": state["toggle1"]})

@app.post("/api/toggle2")
def api_toggle2():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["toggle2"]))
    state["toggle2"] = value
    agent.toggle_2_o = value
    return jsonify({"ok": True, "toggle2": state["toggle2"]})

@app.post("/api/toggle3")
def api_toggle3():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["toggle3"]))
    state["toggle3"] = value
    agent.toggle_3_o = value
    return jsonify({"ok": True, "toggle3": state["toggle3"]})

@app.post("/api/toggle4")
def api_toggle4():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["toggle4"]))
    state["toggle4"] = value
    agent.toggle_4_o = value
    return jsonify({"ok": True, "toggle4": state["toggle4"]})

@app.post("/api/slider")
def api_slider():
    data = request.get_json(silent=True) or {}
    try:
        value = float(data.get("value", state["slider"]))
    except (TypeError, ValueError):
        value = state["slider"]
    value = max(0.0, min(1.0, value))
    state["slider"] = value
    agent.slider_o = value
    return jsonify({"ok": True, "slider": state["slider"]})

@app.post("/api/button1")
def api_button1():
    state["button1_presses"] += 1
    agent.button_1_o = True
    return jsonify({"ok": True, "button1_presses": state["button1_presses"]})

@app.post("/api/button2")
def api_button2():
    state["button2_presses"] += 1
    agent.button_2_o = True
    return jsonify({"ok": True, "button2_presses": state["button2_presses"]})

@app.post("/api/button3")
def api_button3():
    state["button3_presses"] += 1
    agent.button_3_o = True
    return jsonify({"ok": True, "button3_presses": state["button3_presses"]})

@app.post("/api/button4")
def api_button4():
    state["button4_presses"] += 1
    agent.button_4_o = True
    return jsonify({"ok": True, "button4_presses": state["button4_presses"]})

@app.post("/api/joystick1")
def api_joystick1():
    data = request.get_json(silent=True) or {}
    try:
        x = float(data.get("x", 0.0))
        y = float(data.get("y", 0.0))
        # Clamp values between -1 and 1
        x = max(-1.0, min(1.0, x))
        y = max(-1.0, min(1.0, y))
    except (TypeError, ValueError):
        x, y = 0.0, 0.0
    state["joystick1_x"] = x
    state["joystick1_y"] = y
    # Apply inversions
    final_x = -x if state["joystick1_invert_x"] else x
    final_y = -y if state["joystick1_invert_y"] else y
    agent.joystick_1_x_o = final_x
    agent.joystick_1_y_o = final_y
    return jsonify({"ok": True, "joystick1_x": x, "joystick1_y": y})

@app.post("/api/joystick2")
def api_joystick2():
    data = request.get_json(silent=True) or {}
    try:
        x = float(data.get("x", 0.0))
        y = float(data.get("y", 0.0))
        # Clamp values between -1 and 1
        x = max(-1.0, min(1.0, x))
        y = max(-1.0, min(1.0, y))
    except (TypeError, ValueError):
        x, y = 0.0, 0.0
    state["joystick2_x"] = x
    state["joystick2_y"] = y
    # Apply inversions
    final_x = -x if state["joystick2_invert_x"] else x
    final_y = -y if state["joystick2_invert_y"] else y
    agent.joystick_2_x_o = final_x
    agent.joystick_2_y_o = final_y
    return jsonify({"ok": True, "joystick2_x": x, "joystick2_y": y})

@app.post("/api/joystick1_invert_x")
def api_joystick1_invert_x():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["joystick1_invert_x"]))
    state["joystick1_invert_x"] = value
    return jsonify({"ok": True, "joystick1_invert_x": state["joystick1_invert_x"]})

@app.post("/api/joystick1_invert_y")
def api_joystick1_invert_y():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["joystick1_invert_y"]))
    state["joystick1_invert_y"] = value
    return jsonify({"ok": True, "joystick1_invert_y": state["joystick1_invert_y"]})

@app.post("/api/joystick2_invert_x")
def api_joystick2_invert_x():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["joystick2_invert_x"]))
    state["joystick2_invert_x"] = value
    return jsonify({"ok": True, "joystick2_invert_x": state["joystick2_invert_x"]})

@app.post("/api/joystick2_invert_y")
def api_joystick2_invert_y():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", not state["joystick2_invert_y"]))
    state["joystick2_invert_y"] = value
    return jsonify({"ok": True, "joystick2_invert_y": state["joystick2_invert_y"]})

@app.post("/api/int")
def api_int():
    data = request.get_json(silent=True) or {}
    try:
        value = int(data.get("value", 0))
    except (TypeError, ValueError):
        value = 0
    state["int_value"] = value
    agent.integerO = value
    return jsonify({"ok": True, "int_value": state["int_value"]})

@app.post("/api/string")
def api_string():
    data = request.get_json(silent=True) or {}
    value = str(data.get("value", ""))
    state["string_value"] = value
    agent.stringO = value
    return jsonify({"ok": True, "string_value": state["string_value"]})

@app.post("/api/double")
def api_double():
    data = request.get_json(silent=True) or {}
    try:
        value = float(data.get("value", 0.0))
    except (TypeError, ValueError):
        value = 0.0
    state["double_value"] = value
    agent.doubleO = value
    return jsonify({"ok": True, "double_value": state["double_value"]})

@app.post("/api/bool")
def api_bool():
    data = request.get_json(silent=True) or {}
    value = bool(data.get("value", False))
    state["bool_value"] = value
    agent.boolO = value
    return jsonify({"ok": True, "bool_value": state["bool_value"]})

if __name__ == "__main__":
    sig_module.signal(sig_module.SIGINT, signal_handler)

    print("=" * 50)
    print("Starting Remote Control Agent")
    print("=" * 50)
    
    # Check available audio devices
    igs.agent_set_name(agent_name)
    igs.definition_set_version("1.0")
    igs.log_set_console(verbose)
    igs.log_set_file(True, None)
    igs.log_set_stream(verbose)
    igs.set_command_line(sys.executable + " " + " ".join(sys.argv))

    agent = Echo()

    igs.observe_agent_events(on_agent_event_callback, agent)
    igs.observe_freeze(on_freeze_callback, agent)

    igs.output_create("toggle_1", igs.BOOL_T, None)
    igs.output_create("toggle_2", igs.BOOL_T, None)
    igs.output_create("toggle_3", igs.BOOL_T, None)
    igs.output_create("toggle_4", igs.BOOL_T, None)
    igs.output_create("slider", igs.DOUBLE_T, None)
    igs.output_create("button_1", igs.IMPULSION_T, None)
    igs.output_create("button_2", igs.IMPULSION_T, None)
    igs.output_create("button_3", igs.IMPULSION_T, None)
    igs.output_create("button_4", igs.IMPULSION_T, None)
    igs.output_create("joystick_1_x", igs.DOUBLE_T, None)
    igs.output_create("joystick_1_y", igs.DOUBLE_T, None)
    igs.output_create("joystick_2_x", igs.DOUBLE_T, None)
    igs.output_create("joystick_2_y", igs.DOUBLE_T, None)
    igs.output_create("int_value", igs.INTEGER_T, None)
    igs.output_create("string_value", igs.STRING_T, None)
    igs.output_create("double_value", igs.DOUBLE_T, None)
    igs.output_create("bool_value", igs.BOOL_T, None)
    igs.log_set_console(True)
    igs.log_set_console_level(igs.LOG_INFO)

    try:
        igs.start_with_device(device, port)
    except Exception as e:
        print(f"❌ Failed to start Ingescape agent: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    # catch SIGINT handler after starting agent
    sig_module.signal(sig_module.SIGINT, signal_handler)
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)