// Mustang branch - Cockpit controls
// Engine fire glass toggle functionality

const leftEngine = document.getElementById('left-engine');
const rightEngine = document.getElementById('right-engine');
const masterWarning = document.getElementById('master-warning');
const masterCaution = document.getElementById('master-caution');
const fireWarn = document.getElementById('fire-warn');

// Default/initial state
const defaultState = {
    left_engine_glass: true,
    right_engine_glass: true,
    master_warning: false,
    master_caution: false,
    l_eng_fire: false,
    r_eng_fire: false,
    fire_warn_test: 0
};

// Current state
let currentState = { ...defaultState };
let lastResetCounter = 0;  // Track reset counter from server

// Helper function for API calls
async function postJSON(url, payload) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error('Request failed', e);
    }
}

async function getJSON(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error('Request failed', e);
    }
}

// Reset to default state
function resetToDefaults() {
    // Reset left engine
    if (leftEngine) {
        leftEngine.src = '/static/images/l_eng_fire_w_glass.PNG';
    }
    
    // Reset right engine
    if (rightEngine) {
        rightEngine.src = '/static/images/r_eng_fire_w_glass.PNG';
    }
    
    // Reset master warning
    if (masterWarning) {
        masterWarning.src = '/static/images/master_warning_off.PNG';
    }
    
    // Reset master caution
    if (masterCaution) {
        masterCaution.src = '/static/images/master_caution_off.PNG';
    }
    
    // Reset fire warning test
    if (fireWarn) {
        fireWarn.src = '/static/images/fire_warn_released.PNG';
    }
    
    console.log('UI reset to defaults');
}

// Update UI based on server state
function updateUIFromState(serverState) {
    // Update master warning
    if (masterWarning && serverState.master_warning !== currentState.master_warning) {
        masterWarning.src = serverState.master_warning
            ? '/static/images/master_warning_on.PNG'
            : '/static/images/master_warning_off.PNG';
    }
    
    // Update master caution
    if (masterCaution && serverState.master_caution !== currentState.master_caution) {
        masterCaution.src = serverState.master_caution
            ? '/static/images/master_caution_on.PNG'
            : '/static/images/master_caution_off.PNG';
    }
    
    // Update fire warning test
    if (fireWarn && serverState.fire_warn_test !== currentState.fire_warn_test) {
        fireWarn.src = serverState.fire_warn_test > 0
            ? '/static/images/fire_warn_pressed.PNG'
            : '/static/images/fire_warn_released.PNG';
    }
    
    // Update left engine - combine glass and fire state
    if (leftEngine && (serverState.l_eng_fire !== currentState.l_eng_fire || 
                       serverState.left_engine_glass !== currentState.left_engine_glass)) {
        const hasGlass = serverState.left_engine_glass;
        const hasFire = serverState.l_eng_fire;
        
        if (hasGlass && hasFire) {
            leftEngine.src = '/static/images/l_eng_fire_w_glass_fire.PNG';
        } else if (hasGlass && !hasFire) {
            leftEngine.src = '/static/images/l_eng_fire_w_glass.PNG';
        } else if (!hasGlass && hasFire) {
            leftEngine.src = '/static/images/l_eng_fire_wo_glass_fire.PNG';
        } else {
            leftEngine.src = '/static/images/l_eng_fire_wo_glass.PNG';
        }
    }
    
    // Update right engine - combine glass and fire state
    if (rightEngine && (serverState.r_eng_fire !== currentState.r_eng_fire || 
                        serverState.right_engine_glass !== currentState.right_engine_glass)) {
        const hasGlass = serverState.right_engine_glass;
        const hasFire = serverState.r_eng_fire;
        
        if (hasGlass && hasFire) {
            rightEngine.src = '/static/images/r_eng_fire_w_glass_fire.PNG';
        } else if (hasGlass && !hasFire) {
            rightEngine.src = '/static/images/r_eng_fire_w_glass.PNG';
        } else if (!hasGlass && hasFire) {
            rightEngine.src = '/static/images/r_eng_fire_wo_glass_fire.PNG';
        } else {
            rightEngine.src = '/static/images/r_eng_fire_wo_glass.PNG';
        }
    }
}

// Poll for state changes every 200ms (more responsive)
async function pollState() {
    const response = await getJSON('/api/state');
    if (response && response.reset_counter !== undefined && response.state) {
        // Check if reset counter has changed (indicates a reset occurred)
        if (response.reset_counter > lastResetCounter) {
            lastResetCounter = response.reset_counter;
            currentState = { ...defaultState };
            resetToDefaults();
            console.log(`Reset detected (counter: ${response.reset_counter})`);
        } else {
            // Normal state update - check for changes from Ingescape
            updateUIFromState(response.state);
            currentState = { ...response.state };
        }
    }
}

// Start polling at faster rate for responsive reset
setInterval(pollState, 200);

function setupEngineFireToggle(engineImg, side) {
    if (!engineImg) return;
    
    const stateKey = `${side === 'l' ? 'left' : 'right'}_engine_glass`;
    const fireStateKey = `${side === 'l' ? 'l' : 'r'}_eng_fire`;
    const sideName = side === 'l' ? 'left' : 'right';
    
    engineImg.addEventListener('click', async function(e) {
        const rect = engineImg.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const imageHeight = rect.height;
        const topThreshold = imageHeight * 0.20; // Top 20% of image
        
        const hasGlass = currentState[stateKey];
        const hasFire = currentState[fireStateKey];
        let newGlassState = hasGlass;
        
        if (hasGlass) {
            // Glass is present, remove it on any click
            newGlassState = false;
        } else {
            // Glass is removed, restore only if clicking top 20%
            if (clickY <= topThreshold) {
                newGlassState = true;
            } else {
                return; // Don't do anything if clicking outside top 20% when no glass
            }
        }
        
        // Update local state
        currentState[stateKey] = newGlassState;
        
        // Update image based on both glass and fire state
        const prefix = side === 'l' ? 'l' : 'r';
        if (newGlassState && hasFire) {
            engineImg.src = `/static/images/${prefix}_eng_fire_w_glass_fire.PNG`;
        } else if (newGlassState && !hasFire) {
            engineImg.src = `/static/images/${prefix}_eng_fire_w_glass.PNG`;
        } else if (!newGlassState && hasFire) {
            engineImg.src = `/static/images/${prefix}_eng_fire_wo_glass_fire.PNG`;
        } else {
            engineImg.src = `/static/images/${prefix}_eng_fire_wo_glass.PNG`;
        }
        
        // Sync with server
        await postJSON('/api/update_engine', { 
            side: sideName, 
            has_glass: newGlassState 
        });
    });
}

setupEngineFireToggle(leftEngine, 'l');
setupEngineFireToggle(rightEngine, 'r');
