from flask import Flask, render_template, send_from_directory
import signal as sig_module
import time
import sys
import os
import threading
from echo import *

app = Flask(__name__)

# Add route to serve images
@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('images', filename)

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

@app.route("/")
def index():
    return render_template("index.html")

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