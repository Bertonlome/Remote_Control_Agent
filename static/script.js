// Mustang branch - Cockpit controls
// Engine fire glass toggle functionality

const leftEngine = document.getElementById('left-engine');
const rightEngine = document.getElementById('right-engine');

// Default/initial state
const defaultState = {
    left_engine_glass: true,
    right_engine_glass: true
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
    currentState = { ...defaultState };
    
    // Reset left engine
    if (leftEngine) {
        leftEngine.src = currentState.left_engine_glass
            ? '/static/images/l_eng_fire_w_glass.PNG'
            : '/static/images/l_eng_fire_wo_glass.PNG';
    }
    
    // Reset right engine
    if (rightEngine) {
        rightEngine.src = currentState.right_engine_glass
            ? '/static/images/r_eng_fire_w_glass.PNG'
            : '/static/images/r_eng_fire_wo_glass.PNG';
    }
    
    console.log('UI reset to defaults');
}

// Poll for state changes every 500ms
async function pollState() {
    const response = await getJSON('/api/state');
    if (response && response.reset_counter !== undefined) {
        // Check if reset counter has changed (indicates a reset occurred)
        if (response.reset_counter > lastResetCounter) {
            lastResetCounter = response.reset_counter;
            resetToDefaults();
            console.log(`Reset detected (counter: ${response.reset_counter})`);
        }
    }
}

// Start polling
setInterval(pollState, 500);

function setupEngineFireToggle(engineImg, side) {
    if (!engineImg) return;
    
    const withGlass = `/static/images/${side}_eng_fire_w_glass.PNG`;
    const withoutGlass = `/static/images/${side}_eng_fire_wo_glass.PNG`;
    const stateKey = `${side === 'l' ? 'left' : 'right'}_engine_glass`;
    
    engineImg.addEventListener('click', function(e) {
        const rect = engineImg.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const imageHeight = rect.height;
        const topThreshold = imageHeight * 0.20; // Top 20% of image
        
        const currentSrc = engineImg.src;
        const hasGlass = currentSrc.includes('_w_glass');
        
        if (hasGlass) {
            // Glass is present, remove it on any click
            engineImg.src = withoutGlass;
            currentState[stateKey] = false;
        } else {
            // Glass is removed, restore only if clicking top 20%
            if (clickY <= topThreshold) {
                engineImg.src = withGlass;
                currentState[stateKey] = true;
            }
        }
    });
}

setupEngineFireToggle(leftEngine, 'l');
setupEngineFireToggle(rightEngine, 'r');
