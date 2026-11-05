// This function adds the clicked symbol into the text box
function addSymbol(symbol) {
    const inputField = document.getElementById("equation-input");
    inputField.value += symbol;
}

// This function clears the text box completely
function clearWorkspace() {
    const inputField = document.getElementById("equation-input");
    inputField.value = "";
}
// Update this specific function inside your app.js to support the new dropdown keys
function switchChapter() {
    const selectedCategory = document.getElementById("chapter-select").value;
    
    // EXTENDED: Added sound and magnetism categories to match the list array
    const categories = ["structures", "greek", "operators", "subscripts", "sound", "magnetism"];
    
    for (let i = 0; i < categories.length; i++) {
        const currentBank = document.getElementById("bank-" + categories[i]);
        if (currentBank) {
            currentBank.style.display = categories[i] === selectedCategory ? "block" : "none";
        }
    }
}

// NEW FUNCTION: Copies the clean, rendered formula straight into memory!
function copyToClipboard() {
    const previewContent = document.getElementById("math-preview").innerText;
    const copyBtn = document.getElementById("copy-btn");
    
    if (previewContent.trim() === "") return;
    
    // Copy the contents to browser device clipboard memory
    navigator.clipboard.writeText(previewContent).then(() => {
        copyBtn.innerText = "Copied!";
        copyBtn.style.background = "#4da6ff";
        
        // Flash back to original state button style after 1.5 seconds
        setTimeout(() => {
            copyBtn.innerText = "Copy";
            copyBtn.style.background = "#00e676";
        }, 1500);
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
}

// This smart function inserts formatting tags exactly where the typing cursor is!
function addTemplate(before, after) {
    const inputField = document.getElementById("equation-input");
    
    // Find where the cursor is currently blinking
    const startPos = inputField.selectionStart;
    const endPos = inputField.selectionEnd;
    const currentText = inputField.value;

    // Split the text at the cursor position and inject the formatting wrappers
    const newText = currentText.substring(0, startPos) + 
                    before + after + 
                    currentText.substring(endPos, currentText.length);
                    
    inputField.value = newText;

    // Automatically place the cursor perfectly inside the brackets so they can keep typing!
    inputField.focus();
    inputField.setSelectionRange(startPos + before.length, startPos + before.length);
}
// ==========================================
// 1. EQUATION CANVAS RENDERING LOGIC
// ==========================================
function renderMath() {
    let rawText = document.getElementById("equation-input").value;
    
    // Exponent HTML tag translation loop
    while (rawText.includes("^{")) {
        rawText = rawText.replace("^{", "<sup>").replace("}", "</sup>");
    }
    
    // Subscript HTML tag translation loop
    while (rawText.includes("_{")) {
        rawText = rawText.replace("_{", "....").replace("}", "</sub>");
        // Using direct sub formatting
        rawText = rawText.replace("....", "<sub>");
    }
    
    rawText = rawText.replaceAll("\\frac", " / ");
    document.getElementById("math-preview").innerHTML = rawText;
}

function clearWorkspace() {
    document.getElementById("equation-input").value = "";
    document.getElementById("math-preview").innerHTML = "";
}

// ==========================================
// 2. DESMOS-STYLE GRAPHING ENGINE LOGIC
// ==========================================
function plotExpression() {
    const exprInput = document.getElementById('graph-expression');
    const graphCanvas = document.getElementById('myChart');
    if (!exprInput || !graphCanvas) return;

    const ctx = graphCanvas.getContext('2d');
    const width = graphCanvas.width;
    const height = graphCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 25; // Size of each coordinate grid block

    // Clear old drawings completely
    ctx.clearRect(0, 0, width, height);

    // FIX: Make grid lines darker (#cccccc) so they stand out clearly on the white sheet
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += scale) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Main Crosshair Axes Lines (Stark solid black lines)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke(); // X-Axis
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke(); // Y-Axis

    // Read the typed function formula statement
    let rawExpr = exprInput.value.trim().toLowerCase();
    if (rawExpr === "") return;

    ctx.strokeStyle = '#ff4a4a'; // Desmos red curve path trace color
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let firstPoint = true;

    // Scan pixel column by column across coordinate board
    for (let pixelX = 0; pixelX < width; pixelX++) {
        let mathX = (pixelX - centerX) / scale;

        // Order-safe algebraic parsing translation sequence
        let cleanExpr = rawExpr
            .replaceAll("x^3", `(${mathX} * ${mathX} * ${mathX})`)
            .replaceAll("x^2", `(${mathX} * ${mathX})`)
            .replaceAll("sin(x)", `Math.sin(${mathX})`)
            .replaceAll("cos(x)", `Math.cos(${mathX})`)
            .replaceAll("tan(x)", `Math.tan(${mathX})`)
            .replaceAll("x", `(${mathX})`); 

        try {
            let mathY = Function(`"use strict"; return (${cleanExpr})`)();

            if (typeof mathY === 'number' && !isNaN(mathY)) {
                let pixelY = centerY - (mathY * scale);

                // Ensure drawing vectors stay bounded inside canvas layout viewframe boundaries
                if (pixelY >= 0 && pixelY <= height) {
                    if (firstPoint) {
                        ctx.moveTo(pixelX, pixelY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(pixelX, pixelY);
                    }
                }
            }
        } catch (e) {
            // Keep drawing smoothly if input is mid-key input statement
        }
    }
    ctx.stroke();
}

// ==========================================
// 3. MAIN NAVIGATION ROUTER LOGIC
// ==========================================
function switchMainTab(tabName, clickedButton) {
    // EXTENDED: Added 'universal-bank' to the master router tracking loop
    const sections = ["equation-builder", "universal-bank", "graphing-calculator", "ai-assistant"];
    
    for (let i = 0; i < sections.length; i++) {
        const targetSection = document.getElementById(sections[i]);
        if (targetSection) {
            targetSection.style.display = sections[i] === tabName ? "block" : "none";
        }
    }
    
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    clickedButton.classList.add("active");
    
    if (tabName === 'graphing-calculator') {
        setTimeout(plotExpression, 50);
    }
}

function sendChatMessage() {
    const msgInput = document.getElementById("chat-msg-field");
    const chatThread = document.getElementById("chat-thread");
    if (!msgInput || !chatThread || msgInput.value.trim() === "") return;

    // 1. Grab and print user message bubble
    const userText = msgInput.value.trim();
    msgInput.value = ""; // Empty out entry field box immediately
    
    const userBubble = document.createElement("div");
    userBubble.style.cssText = "background: #4da6ff; color: #121214; padding: 10px 14px; border-radius: 8px 8px 0 8px; max-width: 75%; align-self: flex-end; font-weight: 500; line-height: 1.4;";
    userBubble.innerText = userText;
    chatThread.appendChild(userBubble);
    
    // Auto-scroll chat panel to absolute bottom grid row
    chatThread.scrollTop = chatThread.scrollHeight;

    // 2. Process automated keyword analyzer checks to simulate AI reasoning context loops
    setTimeout(() => {
        const botBubble = document.createElement("div");
        botBubble.style.cssText = "background: #29292e; color: #e1e1e6; padding: 10px 14px; border-radius: 8px 8px 8px 0; max-width: 75%; align-self: flex-start; line-height: 1.4;";
        
        const lowerText = userText.toLowerCase();
        let reply = "I'm not quite sure about that physics topic yet. Try asking me about 'calorimetry', 'electricity', 'light', or how to type a 'fraction'!";

        if (lowerText.includes("calorimetry") || lowerText.includes("heat")) {
            reply = "For Calorimetry questions, use the structure: <strong>m_{1}c_{1}(t_{1}-t) = m_{2}c_{2}(t-t_{2})</strong>. You can click these blocks directly in the Equation Builder tab!";
        } else if (lowerText.includes("electricity") || lowerText.includes("ohm")) {
            reply = "To type Ohm's Law, use: <strong>V = IR</strong>. For resistors in series, use <strong>R_{total} = R_{1} + R_{2}</strong>.";
        } else if (lowerText.includes("light") || lowerText.includes("lens") || lowerText.includes("optics")) {
            reply = "For 10th-grade Optics formulas, use the Lens formula: <strong>1/f = 1/v - 1/u</strong> or Snell's Law for refractive index: <strong>μ = sin(i)/sin(r)</strong>.";
        } else if (lowerText.includes("fraction") || lowerText.includes("divide")) {
            reply = "To insert vertical fractions, type <strong>\\frac{numerator}{denominator}</strong> into your workspace input canvas box!";
        } else if (lowerText.includes("hello") || lowerText.includes("hi ")) {
            reply = "Hello there! How can I help you construct your custom physics or math exam questions today?";
        }

        botBubble.innerHTML = reply;
        chatThread.appendChild(botBubble);
        chatThread.scrollTop = chatThread.scrollHeight;
    }, 600); // 600 millisecond simulated typing delay window
}
// Switches between different physics chapters inside the Universal Bank tab
function switchUniversalTopic() {
    // 1. Get the value selected from the sub-menu dropdown
    const selectedTopic = document.getElementById("universal-topic-select").value;
    
    // 2. Put our sub-bank layout IDs into an array loop list
    const subBanks = ["ubank-mechanics", "ubank-heat", "ubank-optics"];
    
    // 3. Loop through to display only the requested sub-bank container
    for (let i = 0; i < subBanks.length; i++) {
        const currentSubBank = document.getElementById(subBanks[i]);
        if (currentSubBank) {
            if (subBanks[i] === selectedTopic) {
                currentSubBank.style.display = "block"; // Show active section
            } else {
                currentSubBank.style.display = "none";  // Hide all others
            }
        }
    }
}


