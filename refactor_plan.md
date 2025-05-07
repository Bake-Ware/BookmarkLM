# Refactoring Plan: index.html to Modular Components

**Objective:** Break down the existing `index.html` into a minimal main file and several separate component files (`style.css`, `app.js`, `config-panel.html`). These components are intended to be hosted as individual GitHub Gists and loaded at runtime via jsDelivr, allowing the main `index.html` to be used as a lightweight bookmark.

## Current File:
*   `index.html` (approx. 441 lines)

## Proposed New File Structure:

1.  **`index.html` (New Minimal Version):**
    *   **Contents:** Basic HTML5 boilerplate, meta tags, title.
    *   Links to Bootstrap CSS CDN.
    *   Link to `style.css` (placeholder for Gist/jsDelivr URL, e.g., `<link rel="stylesheet" href="YOUR_GIST_URL_FOR_STYLE.CSS">`).
    *   The core HTML structure for the chat interface:
        *   Overall container.
        *   Config button.
        *   Title.
        *   `div#chat-log`.
        *   Input group for messages.
    *   A placeholder div for the configuration panel (e.g., `<div id="config-panel-placeholder"></div>`).
    *   Script tag for Bootstrap JS CDN.
    *   Script tag for `app.js` (placeholder for Gist/jsDelivr URL, e.g., `<script type="module" src="YOUR_GIST_URL_FOR_APP.JS"></script>`).

2.  **`style.css`:**
    *   **Contents:** All custom CSS rules currently located within the `<style>` tags in the original `index.html` (lines 8-69).

3.  **`app.js`:**
    *   **Contents:** All JavaScript code currently located within the `<script type="module">` tags in the original `index.html` (lines 118-439).
    *   **Modifications:**
        *   Will include a new function (e.g., `loadConfigPanel`) to asynchronously fetch the content of `config-panel.html` (from its Gist/jsDelivr URL).
        *   This function will inject the fetched HTML into the `#config-panel-placeholder` div in `index.html`.
        *   The `initApp` function will be updated to call `loadConfigPanel`.

4.  **`config-panel.html`:**
    *   **Contents:** The HTML structure for the configuration offcanvas, originally found in `index.html` (lines 90-115).

## Key Decisions Based on User Feedback:

*   **GitHub Gist Hosting:** `style.css`, `app.js`, and `config-panel.html` will each be hosted as separate GitHub Gist files.
*   **Chat Area HTML:** The main chat log (`div#chat-log`) and the message input group will remain within the new minimal `index.html`.
*   **Bootstrap CDN:** Links to Bootstrap CSS and JS will remain as CDN links in `index.html`.

## Visual Plan (Mermaid Diagram):

```mermaid
graph TD
    A[Original index.html (441 lines)] --> B{Analyze & Identify Sections};
    B -- CSS (lines 8-69) --> C[Create style.css];
    B -- JavaScript (lines 118-439) --> D[Create app.js];
    B -- Config Panel HTML (lines 90-115) --> E[Create config-panel.html];

    F[Modify index.html (New Minimal Version)]
    C --> G{Link style.css in index.html (via Gist/jsDelivr URL)};
    D --> H{Link app.js in index.html (via Gist/jsDelivr URL)};
    E --> I{Add placeholder for Config Panel in index.html};

    I --> J{Modify app.js to fetch & inject config-panel.html (from Gist/jsDelivr URL)};

    G --> F;
    H --> F;
    J --> F;

    F --> K[New Minimal index.html File];
    C --> L[style.css File];
    D --> M[app.js File];
    E --> N[config-panel.html File];

    K & L & M & N --> O{Host each as a separate GitHub Gist};
    O --> P{Load via jsDelivr in Bookmark};
```

## Next Steps:

1.  User confirms this plan document.
2.  Switch to a "Code" mode or similar to implement the file creation and modifications.