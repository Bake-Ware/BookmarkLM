import { CreateMLCEngine, prebuiltAppConfig, ModelType as WebLLMModelType } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@latest";
const CONFIG_PANEL_HTML = `<!-- Configuration Offcanvas -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="configOffcanvas" aria-labelledby="configOffcanvasLabel">
    <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title" id="configOffcanvasLabel">Model Configuration</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" id="close-config-button"></button>
    </div>
    <div class="offcanvas-body">
        <button id="theme-toggle-button" class="btn btn-outline-secondary w-100 mb-3">Toggle Theme</button>
        <hr class="my-3">
        <div id="status-area" class="alert alert-secondary text-center p-2 mb-3">Status: Initializing...</div>
        
        <div class="mb-3">
            <label for="model-select" class="form-label">Select Model:</label>
            <select id="model-select" class="form-select">
                <option value="">-- Please select a model --</option>
            </select>
        </div>

        <div id="model-info-area" class="card mb-3">
            <div class="card-body">
                <p class="card-text">Select a model to see its details here.</p>
            </div>
        </div>
        <button id="load-model-btn" class="btn btn-success w-100 mt-auto" disabled>Load Selected Model</button>
    </div>
</div>`;

let currentEngine = null;
let modelIdSelectedForInfo = null;
let configOffcanvasInstance = null; // To store the Bootstrap Offcanvas instance

// DOM Elements
let chatLogElement, chatInputElement, sendButtonElement, modelSelectElement, statusAreaElement;
let modelInfoAreaElement, loadModelButtonElement, themeToggleButtonElement, configPanelPlaceholderElement;

// Function to load and inject the config panel HTML
function loadConfigPanel() {
    configPanelPlaceholderElement = document.getElementById('config-panel-placeholder');
    if (!configPanelPlaceholderElement) {
        console.error("Config panel placeholder not found!");
        appendToLog('System', "Error: UI component 'config-panel-placeholder' not found. Configuration panel cannot be loaded.");
        return;
    }
    
    configPanelPlaceholderElement.innerHTML = CONFIG_PANEL_HTML;

    // After injecting HTML, re-initialize Bootstrap Offcanvas for the newly added element
    const configOffcanvasElement = document.getElementById('configOffcanvas');
    if (configOffcanvasElement) {
        configOffcanvasInstance = new bootstrap.Offcanvas(configOffcanvasElement);
    } else {
        console.error("configOffcanvas element not found after loading panel.");
        appendToLog('System', "Error: Configuration panel element not found after loading. Panel may not function correctly.");
    }
    
    // Re-query elements that are inside the loaded panel
    modelSelectElement = document.getElementById('model-select');
    modelInfoAreaElement = document.getElementById('model-info-area')?.querySelector('.card-body');
    loadModelButtonElement = document.getElementById('load-model-btn');
    themeToggleButtonElement = document.getElementById('theme-toggle-button');
    statusAreaElement = document.getElementById('status-area'); // Also in config panel

    // Re-attach event listeners for elements within the loaded panel
    if (themeToggleButtonElement) themeToggleButtonElement.addEventListener('click', toggleTheme);
    if (modelSelectElement) modelSelectElement.addEventListener('change', displaySelectedModelInfo);
    if (loadModelButtonElement) loadModelButtonElement.addEventListener('click', executeLoadModel);
}

function initApp() {
    chatLogElement = document.getElementById('chat-log');
    chatInputElement = document.getElementById('chat-input');
    sendButtonElement = document.getElementById('send-button');
    // Elements inside config panel will be queried after it's loaded

    loadConfigPanel(); // Load the config panel first

    // Initialize elements that were previously in initApp and are still in index.html or now in config-panel
    // Some elements like modelSelectElement, modelInfoAreaElement, loadModelButtonElement, themeToggleButtonElement, statusAreaElement
    // are now initialized within loadConfigPanel after the HTML is injected.

    sendButtonElement.disabled = false; // This is in index.html
    if (loadModelButtonElement) loadModelButtonElement.disabled = true; // This is in config-panel.html

    if (!prebuiltAppConfig || !prebuiltAppConfig.model_list) {
        if(statusAreaElement) statusAreaElement.textContent = "Error: WebLLM prebuiltAppConfig not available.";
        appendToLog('System', "WebLLM configuration failed to load. Cannot initialize models.");
        return;
    }
    
    const allModelRecords = prebuiltAppConfig.model_list;

    if (modelSelectElement) { // Check if modelSelectElement was successfully queried
        allModelRecords.forEach(record => {
            const option = document.createElement('option');
            option.value = record.model_id;
            option.textContent = record.model_id;
            const tooltipLines = [`ID: ${record.model_id}`];
            option.title = tooltipLines.join('\\n');
            modelSelectElement.appendChild(option);
        });
    } else {
        appendToLog('System', "Warning: Model select element not found. Model selection will not be available.");
    }
    

    sendButtonElement.addEventListener('click', sendMessage);
    chatInputElement.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendButtonElement.disabled) {
            sendMessage();
        }
    });

    const savedModelId = localStorage.getItem('selectedWebLLMModelId');
    if (savedModelId && allModelRecords.some(m => m.model_id === savedModelId)) {
        if (modelSelectElement) modelSelectElement.value = savedModelId;
        displaySelectedModelInfo(); // This needs modelSelectElement to be ready
        if (statusAreaElement) statusAreaElement.textContent = `Previously used model: ${savedModelId}. Open config to load.`;
    } else {
         if (statusAreaElement) statusAreaElement.textContent = "Status: Please configure and load a model to start.";
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeButtonText(savedTheme); // This needs themeToggleButtonElement
}

function displaySelectedModelInfo() {
    if (!modelSelectElement || !modelInfoAreaElement || !loadModelButtonElement) {
        appendToLog('System', "Cannot display model info: Required UI elements for config panel are missing.");
        return;
    }
    const selectedId = modelSelectElement.value;
    modelIdSelectedForInfo = null;
    loadModelButtonElement.disabled = true;
    modelInfoAreaElement.innerHTML = '<p class="card-text">Select a model to see its details here.</p>';

    if (!selectedId) return;

    const record = prebuiltAppConfig.model_list.find(r => r.model_id === selectedId);
    if (!record) {
        modelInfoAreaElement.innerHTML = '<p class="card-text text-danger">Error: Model details not found.</p>';
        return;
    }

    modelIdSelectedForInfo = selectedId;

    let modelTypeStr = record.model_type !== undefined ? String(record.model_type) : 'LLM';
    if (WebLLMModelType && record.model_type !== undefined && WebLLMModelType[record.model_type]) {
        modelTypeStr = WebLLMModelType[record.model_type];
    } else if (record.model_type === 0) modelTypeStr = "LLM";
    else if (record.model_type === 1) modelTypeStr = "Embedding";
    else if (record.model_type === 2) modelTypeStr = "VLM";

    const infoHTML = `
        <p class="card-text mb-1"><strong>ID:</strong> ${record.model_id}</p>
        <p class="card-text mb-1"><strong>Source:</strong> ${record.model}</p>
        <p class="card-text mb-1"><strong>Type:</strong> ${modelTypeStr}</p>
        <p class="card-text mb-1"><strong>VRAM Required:</strong> ${record.vram_required_MB ? record.vram_required_MB.toFixed(2) + ' MB' : 'N/A'}</p>
        <p class="card-text mb-1"><strong>Context Window:</strong> ${record.overrides?.context_window_size || 'N/A'}</p>
        <p class="card-text mb-1"><strong>Low Resource Device:</strong> ${record.low_resource_required !== undefined ? record.low_resource_required : 'N/A'}</p>
        <p class="card-text mb-1"><strong>Required Features:</strong> ${record.required_features && record.required_features.length > 0 ? record.required_features.join(', ') : 'None'}</p>
        <p class="card-text mb-0"><strong>Buffer Size:</strong> ${record.buffer_size_required_bytes ? record.buffer_size_required_bytes + ' bytes' : 'N/A'}</p>
    `;
    modelInfoAreaElement.innerHTML = infoHTML;
    loadModelButtonElement.disabled = false;
}

async function executeLoadModel() {
    if (!statusAreaElement || !chatLogElement || !sendButtonElement || !loadModelButtonElement || !modelSelectElement) {
         appendToLog('System', "Cannot load model: Required UI elements are missing.");
        return;
    }
    if (!modelIdSelectedForInfo) {
        statusAreaElement.textContent = "Error: No model selected in config to load.";
        return;
    }
    chatLogElement.innerHTML = '';

    if (currentEngine && currentEngine.modelId === modelIdSelectedForInfo) {
        statusAreaElement.textContent = `Model: ${modelIdSelectedForInfo} is already loaded.`;
        sendButtonElement.disabled = false;
        if (configOffcanvasInstance) configOffcanvasInstance.hide();
        return;
    }

    if (currentEngine) {
        statusAreaElement.textContent = `Unloading ${currentEngine.modelId}...`;
        await currentEngine.unload();
        appendToLog('System', `Model ${currentEngine.modelId} unloaded.`);
        currentEngine = null;
    }

    statusAreaElement.textContent = `Loading model: ${modelIdSelectedForInfo}... This may take a while.`;
    sendButtonElement.disabled = true;
    loadModelButtonElement.disabled = true;
    modelSelectElement.disabled = true;

    try {
        currentEngine = await CreateMLCEngine(modelIdSelectedForInfo, 
            { initProgressCallback: (progress) => {
                if (statusAreaElement) statusAreaElement.textContent = `Loading ${modelIdSelectedForInfo}: ${progress.text}`;
            }}
        );
        localStorage.setItem('selectedWebLLMModelId', modelIdSelectedForInfo);
        const activeContextWindow = currentEngine.config?.contextWindowSize || 
                                    (currentEngine.chat?.config?.context_window_size) || 'N/A';
        if (statusAreaElement) statusAreaElement.textContent = `Model loaded: ${modelIdSelectedForInfo}. Context: ${activeContextWindow}`;
        appendToLog('System', `Model ${modelIdSelectedForInfo} loaded. Context: ${activeContextWindow}. You can now chat.`);
        sendButtonElement.disabled = false;
        if (configOffcanvasInstance) configOffcanvasInstance.hide();
    } catch (error) {
        if (statusAreaElement) statusAreaElement.textContent = `Error loading model: ${modelIdSelectedForInfo}. ${error.message}`;
        appendToLog('System', `Error loading ${modelIdSelectedForInfo}: ${error.message}`);
        currentEngine = null;
        sendButtonElement.disabled = true; // Keep disabled if load failed
    } finally {
        if (loadModelButtonElement) loadModelButtonElement.disabled = modelIdSelectedForInfo ? false : true;
        if (modelSelectElement) modelSelectElement.disabled = false;
    }
}

async function sendMessage() {
    if (!chatInputElement || !sendButtonElement || !chatLogElement) {
        // Can't use appendToLog here if chatLogElement itself is missing.
        console.error("Cannot send message: Core UI elements (input, send button, or chat log) are missing.");
        if (statusAreaElement) statusAreaElement.textContent = "Error: Core UI elements missing.";
        return;
    }
    const messageText = chatInputElement.value.trim();
    if (!messageText) return;

    appendToLog('User', messageText);
    chatInputElement.value = '';

    if (messageText.startsWith("!mcp ")) {
        appendToLog('System', 'MCP command received. Roo will process this request.');
        if (statusAreaElement) statusAreaElement.textContent = 'MCP command sent to Roo for processing.';
        sendButtonElement.disabled = false;
    } else {
        if (!currentEngine) {
            if (statusAreaElement) statusAreaElement.textContent = "Error: No local model loaded for chat. Load a model or use '!mcp <command>'.";
            appendToLog('System', "Cannot send chat message: No local model is loaded. Use '!mcp <command>' to interact with Roo's tools.");
            sendButtonElement.disabled = false;
            return;
        }

        sendButtonElement.disabled = true;
        if (statusAreaElement) statusAreaElement.textContent = `Generating response from ${currentEngine.modelId}...`;
        
        let currentAssistantMessageDiv = appendToLog('Assistant', '');
        currentAssistantMessageDiv.innerHTML = '<span class="streaming-cursor">▋</span>';

        let inThinkBlock = false;
        let activeTextNode = null;
        let activeThinkPre = null;
        let textBuffer = "";

        try {
            const messages = [{ role: "user", content: messageText }];
            const chunks = await currentEngine.chat.completions.create({
                stream: true,
                messages: messages,
            });
            
            for await (const chunk of chunks) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) {
                    textBuffer += delta;
                    let cursorSpan = currentAssistantMessageDiv.querySelector('.streaming-cursor');
                    if (cursorSpan) cursorSpan.remove();

                    let processAgain = true;
                    while (processAgain) {
                        processAgain = false;
                        if (!inThinkBlock) {
                            const thinkStartIndex = textBuffer.indexOf("<think>");
                            if (thinkStartIndex !== -1) {
                                const textBefore = textBuffer.substring(0, thinkStartIndex);
                                if (textBefore) {
                                    if (!activeTextNode) {
                                        activeTextNode = document.createTextNode(textBefore);
                                        currentAssistantMessageDiv.appendChild(activeTextNode);
                                    } else {
                                        activeTextNode.textContent += textBefore;
                                    }
                                }
                                const details = document.createElement('details');
                                details.className = 'think-block';
                                const summary = document.createElement('summary');
                                summary.className = 'think-summary';
                                summary.textContent = '🧠 Thinking...';
                                activeThinkPre = document.createElement('pre');
                                activeThinkPre.className = 'think-content';
                                details.appendChild(summary);
                                details.appendChild(activeThinkPre);
                                currentAssistantMessageDiv.appendChild(details);
                                
                                inThinkBlock = true;
                                activeTextNode = null;
                                textBuffer = textBuffer.substring(thinkStartIndex + "<think>".length);
                                processAgain = true;
                            } else {
                                if (textBuffer) {
                                    if (!activeTextNode) {
                                        activeTextNode = document.createTextNode(textBuffer);
                                        currentAssistantMessageDiv.appendChild(activeTextNode);
                                    } else {
                                        activeTextNode.textContent += textBuffer;
                                    }
                                    textBuffer = "";
                                }
                            }
                        } else { 
                            const thinkEndIndex = textBuffer.indexOf("</think>");
                            if (thinkEndIndex !== -1) {
                                const thinkContent = textBuffer.substring(0, thinkEndIndex);
                                if (activeThinkPre) {
                                    activeThinkPre.textContent += thinkContent;
                                }
                                inThinkBlock = false;
                                activeThinkPre = null;
                                textBuffer = textBuffer.substring(thinkEndIndex + "</think>".length);
                                processAgain = true;
                            } else {
                                if (activeThinkPre && textBuffer) {
                                    activeThinkPre.textContent += textBuffer;
                                }
                                textBuffer = "";
                            }
                        }
                    }
                    cursorSpan = document.createElement('span');
                    cursorSpan.className = 'streaming-cursor';
                    cursorSpan.textContent = '▋';
                    currentAssistantMessageDiv.appendChild(cursorSpan);
                    chatLogElement.scrollTop = chatLogElement.scrollHeight;
                }
            }
            let finalCursor = currentAssistantMessageDiv.querySelector('.streaming-cursor');
            if (finalCursor) finalCursor.remove();
            if (statusAreaElement && currentEngine) statusAreaElement.textContent = `Model: ${currentEngine.modelId}. Idle.`;
        } catch (error) {
            if (statusAreaElement) statusAreaElement.textContent = `Error during chat: ${error.message}`;
            let errorCursor = currentAssistantMessageDiv.querySelector('.streaming-cursor');
            if (errorCursor) errorCursor.remove();
            if (activeTextNode) activeTextNode.textContent += `\nError: ${error.message}`;
            else if (activeThinkPre) activeThinkPre.textContent += `\nError: ${error.message}`;
            else currentAssistantMessageDiv.appendChild(document.createTextNode(`Error: ${error.message}`));
            appendToLog('System', `Chat error: ${error.message}`);
        } finally {
            sendButtonElement.disabled = false;
            chatLogElement.scrollTop = chatLogElement.scrollHeight;
        }
    }
}

function appendToLog(sender, messageText) {
    if (!chatLogElement) {
        console.error("Cannot append to log: chatLogElement is not available.");
        return null; // Return null or handle error as appropriate
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender.toLowerCase() + '-message');
    
    if (messageText) { // For User and System messages, or initial non-streaming content
        messageDiv.textContent = messageText;
    }
    
    chatLogElement.appendChild(messageDiv);
    chatLogElement.scrollTop = chatLogElement.scrollHeight;
    return messageDiv;
}

function toggleTheme() {
    if (!themeToggleButtonElement) {
        appendToLog('System', "Cannot toggle theme: Theme toggle button not found.");
        return;
    }
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButtonText(newTheme);
}

function updateThemeButtonText(theme) {
    if (!themeToggleButtonElement) {
        // Don't log here as it might be called before element is ready during init
        return;
    }
    if (theme === 'dark') {
        themeToggleButtonElement.textContent = "Switch to Light Mode";
    } else {
        themeToggleButtonElement.textContent = "Switch to Dark Mode";
    }
}

document.addEventListener('DOMContentLoaded', initApp);