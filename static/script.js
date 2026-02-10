// Mustang branch - Cockpit controls
// Engine fire glass toggle functionality

const leftEngine = document.getElementById('left-engine');
const rightEngine = document.getElementById('right-engine');
const masterWarning = document.getElementById('master-warning');
const masterCaution = document.getElementById('master-caution');
const fireWarn = document.getElementById('fire-warn');
const leftBottle = document.getElementById('left-bottle');
const rightBottle = document.getElementById('right-bottle');

// Default/initial state
const defaultState = {
    left_engine_glass: true,
    right_engine_glass: true,
    master_warning: false,
    master_caution: false,
    l_eng_fire: false,
    r_eng_fire: false,
    fire_warn_test: 0,
    l_bottle_pressed: false,
    r_bottle_pressed: false
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
    
    // Reset left bottle
    if (leftBottle) {
        leftBottle.src = '/static/images/fire_bottle_released.PNG';
    }
    
    // Reset right bottle
    if (rightBottle) {
        rightBottle.src = '/static/images/fire_bottle_released.PNG';
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
    
    // Update left bottle - check pressed first, then fire state
    if (leftBottle && (serverState.l_bottle_pressed !== currentState.l_bottle_pressed ||
                       serverState.l_eng_fire !== currentState.l_eng_fire)) {
        if (serverState.l_bottle_pressed) {
            leftBottle.src = '/static/images/fire_bottle_pressed.PNG';
        } else if (serverState.l_eng_fire) {
            leftBottle.src = '/static/images/fire_bottle_released_fire.PNG';
        } else {
            leftBottle.src = '/static/images/fire_bottle_released.PNG';
        }
    }
    
    // Update right bottle - check pressed first, then fire state
    if (rightBottle && (serverState.r_bottle_pressed !== currentState.r_bottle_pressed ||
                        serverState.r_eng_fire !== currentState.r_eng_fire)) {
        if (serverState.r_bottle_pressed) {
            rightBottle.src = '/static/images/fire_bottle_pressed.PNG';
        } else if (serverState.r_eng_fire) {
            rightBottle.src = '/static/images/fire_bottle_released_fire.PNG';
        } else {
            rightBottle.src = '/static/images/fire_bottle_released.PNG';
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

// Add click handlers for controls
if (masterWarning) {
    masterWarning.addEventListener('click', async function() {
        await postJSON('/api/click_master_warning', {});
    });
}

if (masterCaution) {
    masterCaution.addEventListener('click', async function() {
        await postJSON('/api/click_master_caution', {});
    });
}

if (leftEngine) {
    leftEngine.addEventListener('click', async function(e) {
        const rect = leftEngine.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const imageHeight = rect.height;
        const topThreshold = imageHeight * 0.20; // Top 20% for glass restore
        const buttonThreshold = imageHeight * 0.30; // Bottom 70% for button press (30%-100%)
        
        const hasGlass = currentState.left_engine_glass;
        let newGlassState = hasGlass;
        
        if (hasGlass) {
            // Glass is present, remove it on any click (safety glass must be broken first)
            // NO IMPULSION SENT - glass must be broken first
            newGlassState = false;
            currentState.left_engine_glass = newGlassState;
            const hasFire = currentState.l_eng_fire;
            
            if (hasFire) {
                leftEngine.src = '/static/images/l_eng_fire_wo_glass_fire.PNG';
            } else {
                leftEngine.src = '/static/images/l_eng_fire_wo_glass.PNG';
            }
            
            await postJSON('/api/update_engine', { side: 'left', has_glass: false });
        } else {
            // Glass is already removed
            if (clickY <= topThreshold) {
                // Top 20%: restore glass, NO IMPULSION
                newGlassState = true;
                currentState.left_engine_glass = true;
                const hasFire = currentState.l_eng_fire;
                
                if (hasFire) {
                    leftEngine.src = '/static/images/l_eng_fire_w_glass_fire.PNG';
                } else {
                    leftEngine.src = '/static/images/l_eng_fire_w_glass.PNG';
                }
                
                await postJSON('/api/update_engine', { side: 'left', has_glass: true });
            } else if (clickY >= buttonThreshold) {
                // Bottom 70%: send button impulsion ONLY
                await postJSON('/api/click_left_engine', {});
            }
            // Middle zone (20%-30%): do nothing
        }
    });
}

if (rightEngine) {
    rightEngine.addEventListener('click', async function(e) {
        const rect = rightEngine.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const imageHeight = rect.height;
        const topThreshold = imageHeight * 0.20; // Top 20% for glass restore
        const buttonThreshold = imageHeight * 0.30; // Bottom 70% for button press (30%-100%)
        
        const hasGlass = currentState.right_engine_glass;
        let newGlassState = hasGlass;
        
        if (hasGlass) {
            // Glass is present, remove it on any click (safety glass must be broken first)
            // NO IMPULSION SENT - glass must be broken first
            newGlassState = false;
            currentState.right_engine_glass = newGlassState;
            const hasFire = currentState.r_eng_fire;
            
            if (hasFire) {
                rightEngine.src = '/static/images/r_eng_fire_wo_glass_fire.PNG';
            } else {
                rightEngine.src = '/static/images/r_eng_fire_wo_glass.PNG';
            }
            
            await postJSON('/api/update_engine', { side: 'right', has_glass: false });
        } else {
            // Glass is already removed
            if (clickY <= topThreshold) {
                // Top 20%: restore glass, NO IMPULSION
                newGlassState = true;
                currentState.right_engine_glass = true;
                const hasFire = currentState.r_eng_fire;
                
                if (hasFire) {
                    rightEngine.src = '/static/images/r_eng_fire_w_glass_fire.PNG';
                } else {
                    rightEngine.src = '/static/images/r_eng_fire_w_glass.PNG';
                }
                
                await postJSON('/api/update_engine', { side: 'right', has_glass: true });
            } else if (clickY >= buttonThreshold) {
                // Bottom 70%: send button impulsion ONLY
                await postJSON('/api/click_right_engine', {});
            }
            // Middle zone (20%-30%): do nothing
        }
    });
}

if (fireWarn) {
    fireWarn.addEventListener('click', async function() {
        await postJSON('/api/click_fire_warn', {});
    });
}

// Left fire bottle handlers
if (leftBottle) {
    const handleLeftBottlePress = async function() {
        currentState.l_bottle_pressed = true;
        leftBottle.src = '/static/images/fire_bottle_pressed.PNG';
        await postJSON('/api/click_left_bottle', {});
    };
    
    const handleLeftBottleRelease = async function() {
        currentState.l_bottle_pressed = false;
        if (currentState.l_eng_fire) {
            leftBottle.src = '/static/images/fire_bottle_released_fire.PNG';
        } else {
            leftBottle.src = '/static/images/fire_bottle_released.PNG';
        }
        await postJSON('/api/release_left_bottle', {});
    };
    
    leftBottle.addEventListener('mousedown', handleLeftBottlePress);
    leftBottle.addEventListener('mouseup', handleLeftBottleRelease);
    leftBottle.addEventListener('mouseleave', function() {
        if (currentState.l_bottle_pressed) {
            handleLeftBottleRelease();
        }
    });
    leftBottle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleLeftBottlePress();
    });
    leftBottle.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleLeftBottleRelease();
    });
}

// Right fire bottle handlers
if (rightBottle) {
    const handleRightBottlePress = async function() {
        currentState.r_bottle_pressed = true;
        rightBottle.src = '/static/images/fire_bottle_pressed.PNG';
        await postJSON('/api/click_right_bottle', {});
    };
    
    const handleRightBottleRelease = async function() {
        currentState.r_bottle_pressed = false;
        if (currentState.r_eng_fire) {
            rightBottle.src = '/static/images/fire_bottle_released_fire.PNG';
        } else {
            rightBottle.src = '/static/images/fire_bottle_released.PNG';
        }
        await postJSON('/api/release_right_bottle', {});
    };
    
    rightBottle.addEventListener('mousedown', handleRightBottlePress);
    rightBottle.addEventListener('mouseup', handleRightBottleRelease);
    rightBottle.addEventListener('mouseleave', function() {
        if (currentState.r_bottle_pressed) {
            handleRightBottleRelease();
        }
    });
    rightBottle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleRightBottlePress();
    });
    rightBottle.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleRightBottleRelease();
    });
}
