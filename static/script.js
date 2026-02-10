// Mustang branch - GUI removed
// Background only mode


if (toggle1) {
  toggle1.addEventListener('change', async () => {
    await postJSON('/api/toggle1', { value: toggle1.checked });
  });
}
if (toggle2) {
  toggle2.addEventListener('change', async () => {
    await postJSON('/api/toggle2', { value: toggle2.checked });
  });
}
if (toggle3) {
  toggle3.addEventListener('change', async () => {
    await postJSON('/api/toggle3', { value: toggle3.checked });
  });
}
if (toggle4) {
  toggle4.addEventListener('change', async () => {
    await postJSON('/api/toggle4', { value: toggle4.checked });
  });
}
if (sliderEl) {
  sliderEl.addEventListener('input', async () => {
    const value = parseFloat(sliderEl.value);
    sliderValueEl.textContent = value.toFixed(2);
    await postJSON('/api/slider', { value });
  });
}
if (pushBtn1) {
  pushBtn1.addEventListener('click', async () => {
    pushBtn1.disabled = true;
    const json = await postJSON('/api/button1', {});
    pushBtn1.disabled = false;
    if (json && 'button1_presses' in json) {
      pressCount1.textContent = json.button1_presses;
    }
  });
}
if (pushBtn2) {
  pushBtn2.addEventListener('click', async () => {
    pushBtn2.disabled = true;
    const json = await postJSON('/api/button2', {});
    pushBtn2.disabled = false;
    if (json && 'button2_presses' in json) {
      pressCount2.textContent = json.button2_presses;
    }
  });
}
if (pushBtn3) {
  pushBtn3.addEventListener('click', async () => {
    pushBtn3.disabled = true;
    const json = await postJSON('/api/button3', {});
    pushBtn3.disabled = false;
    if (json && 'button3_presses' in json) {
      pressCount3.textContent = json.button3_presses;
    }
  });
}
if (pushBtn4) {
  pushBtn4.addEventListener('click', async () => {
    pushBtn4.disabled = true;
    const json = await postJSON('/api/button4', {});
    pushBtn4.disabled = false;
    if (json && 'button4_presses' in json) {
      pressCount4.textContent = json.button4_presses;
    }
  });
}

// Dual Joystick control
function setupJoystick(containerId, knobId, xValId, yValId, apiEndpoint) {
  const container = document.getElementById(containerId);
  const knob = document.getElementById(knobId);
  const xVal = document.getElementById(xValId);
  const yVal = document.getElementById(yValId);

  if (!container || !knob) return;

  let isDragging = false;
  let centerX = 0, centerY = 0, radius = 0;

  function updateCenter() {
    const rect = container.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    radius = rect.width / 2 - 25;
  }

  function handleMove(clientX, clientY) {
    if (!isDragging) return;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let finalX = dx;
    let finalY = dy;
    if (distance > radius) {
      finalX = (dx / distance) * radius;
      finalY = (dy / distance) * radius;
    }

    knob.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;
    
    const normX = finalX / radius;
    const normY = -finalY / radius;
    
    xVal.textContent = normX.toFixed(2);
    yVal.textContent = normY.toFixed(2);
    
    postJSON(apiEndpoint, { x: normX, y: normY });
  }

  function resetJoystick() {
    isDragging = false;
    knob.style.transform = 'translate(-50%, -50%)';
    xVal.textContent = '0.00';
    yVal.textContent = '0.00';
    postJSON(apiEndpoint, { x: 0, y: 0 });
  }

  container.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDragging = true;
    updateCenter();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  });

  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  });

  container.addEventListener('touchend', (e) => {
    e.preventDefault();
    resetJoystick();
  });

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateCenter();
    handleMove(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) resetJoystick();
  });
}

setupJoystick('joystick1-container', 'joystick1-knob', 'joy1-x-val', 'joy1-y-val', '/api/joystick1');
setupJoystick('joystick2-container', 'joystick2-knob', 'joy2-x-val', 'joy2-y-val', '/api/joystick2');

// Joystick inversion controls
const joy1InvertX = document.getElementById('joy1-invert-x');
const joy1InvertY = document.getElementById('joy1-invert-y');
const joy2InvertX = document.getElementById('joy2-invert-x');
const joy2InvertY = document.getElementById('joy2-invert-y');

if (joy1InvertX) {
  joy1InvertX.addEventListener('change', async () => {
    await postJSON('/api/joystick1_invert_x', { value: joy1InvertX.checked });
  });
}
if (joy1InvertY) {
  joy1InvertY.addEventListener('change', async () => {
    await postJSON('/api/joystick1_invert_y', { value: joy1InvertY.checked });
  });
}
if (joy2InvertX) {
  joy2InvertX.addEventListener('change', async () => {
    await postJSON('/api/joystick2_invert_x', { value: joy2InvertX.checked });
  });
}
if (joy2InvertY) {
  joy2InvertY.addEventListener('change', async () => {
    await postJSON('/api/joystick2_invert_y', { value: joy2InvertY.checked });
  });
}

const intInput = document.getElementById('int-input');
const sendIntBtn = document.getElementById('send-int');
if (intInput && sendIntBtn) {
  sendIntBtn.addEventListener('click', async () => {
    const value = parseInt(intInput.value, 10);
    if (isNaN(value)) { alert('Please enter a valid integer'); return; }
    sendIntBtn.disabled = true;
    await postJSON('/api/int', { value });
    sendIntBtn.disabled = false;
  });
}

const stringInput = document.getElementById('string-input');
const sendStringBtn = document.getElementById('send-string');
if (stringInput && sendStringBtn) {
  sendStringBtn.addEventListener('click', async () => {
    const value = stringInput.value;
    sendStringBtn.disabled = true;
    await postJSON('/api/string', { value });
    sendStringBtn.disabled = false;
  });
}

const doubleInput = document.getElementById('double-input');
const sendDoubleBtn = document.getElementById('send-double');
if (doubleInput && sendDoubleBtn) {
  sendDoubleBtn.addEventListener('click', async () => {
    const value = parseFloat(doubleInput.value);
    if (isNaN(value)) { alert('Please enter a valid number'); return; }
    sendDoubleBtn.disabled = true;
    await postJSON('/api/double', { value });
    sendDoubleBtn.disabled = false;
  });
}

const boolInput = document.getElementById('bool-input');
const sendBoolBtn = document.getElementById('send-bool');
if (boolInput && sendBoolBtn) {
  sendBoolBtn.addEventListener('click', async () => {
    const value = boolInput.value === 'true';
    sendBoolBtn.disabled = true;
    await postJSON('/api/bool', { value });
    sendBoolBtn.disabled = false;
  });
}

// Future: poll current state if ingescape updates occur externally.
