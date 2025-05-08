# BookmarkLM

## Live Demo

You can try BookmarkLM live at: [`https://bake-ware.github.io/BookmarkLM/`](https://bake-ware.github.io/BookmarkLM/)

## Short Description & Project Philosophy

BookmarkLM is a browser-based chat application that runs Large Language Models (LLMs) locally using the WebLLM library.

It's designed with a modular approach: the main [`index.html`](index.html:1) is minimal, intended to be lightweight enough for a bookmark. Core components like JavaScript ([`app.js`](app.js:1)), styles ([`style.css`](style.css:1)), and the configuration panel UI ([`config-panel.html`](config-panel.html:1)) are separate and designed to be loaded dynamically (e.g., from CDNs or Gist-hosting services like jsDelivr).

This allows users to select different models, interact with them through a chat interface, and configure settings, all within their browser.

## Key Features

*   **Local LLM Execution:** Runs LLMs directly in the browser via WebLLM, ensuring privacy and enabling offline capability after the initial model download.
*   **Interactive Chat Interface:** A user-friendly interface for sending prompts and receiving responses from the loaded LLM.
*   **Model Selection & Configuration:** Allows users to choose from a list of available models, view their details (like VRAM requirements, context window size), and load them dynamically.
*   **Theme Customization:** Supports light and dark themes for visual preference.
*   **"Think Block" Display:** Can visualize the model's intermediate thought process during response generation, offering insights into its reasoning (if supported by the model).
*   **Modular Design for Lightweight Bookmarking:** The core application is broken into components to keep the main HTML file small and suitable for use as a browser bookmark.
*   **Portable Data URI Version:** An example of a self-contained data URI is provided in [`url.txt`](url.txt:1), allowing the entire application to be run from a single string, perfect for sharing or embedding.

## File Structure (Reflecting Modular Design)

*   [`index.html`](index.html:1): The minimal HTML host page. It includes placeholders for dynamic content and links to external CSS and JS.
*   [`app.js`](app.js:1): The main JavaScript file containing all application logic, including WebLLM integration, chat functionality, theme management, and dynamic loading of the configuration panel.
*   [`style.css`](style.css:1): Contains all custom CSS rules for the application's appearance.
*   [`config-panel.html`](config-panel.html:1): The HTML structure for the configuration offcanvas panel. This is fetched and injected into [`index.html`](index.html:1) by [`app.js`](app.js:1).
*   [`url.txt`](url.txt:1): Contains an example data URI that bundles the application into a single, runnable string.
*   [`refactor_plan.md`](refactor_plan.md:1): An internal document detailing the original plan to modularize the application (for informational purposes).

## How to Use

### Live Demo (Recommended)

1.  Visit [`https://bake-ware.github.io/BookmarkLM/`](https://bake-ware.github.io/BookmarkLM/)
2.  Click the settings icon (⚙️) to open the configuration panel.
3.  Select a model from the dropdown list.
4.  Click "Load Selected Model." This may take some time as the model downloads to your browser.
5.  Once the status indicates the model is loaded, you can start chatting.

### Local Setup (for development or offline use after initial Gist/CDN caching)

1.  Clone or download the project files.
2.  The [`index.html`](index.html:1) file is set up to load [`app.js`](app.js:32) and [`style.css`](style.css:8) from CDN Gist links. If you wish to run purely locally, you would need to modify these links in [`index.html`](index.html:1) to point to your local copies.
3.  Open [`index.html`](index.html:1) in a modern web browser that supports WebGPU (for WebLLM).
4.  Follow steps 2-5 from the "Live Demo" instructions.

### Using the Data URI (from [`url.txt`](url.txt:1))

1.  Open [`url.txt`](url.txt:1).
2.  Copy the entire content (the data URI string).
3.  Paste this data URI into your browser's address bar and press Enter.
4.  Alternatively, create a new browser bookmark and paste the data URI into the URL/address field of the bookmark.

## Technical Details

*   **Frontend:** HTML5, CSS3 (styled with Bootstrap 5), JavaScript (ES Modules).
*   **Core LLM Engine:** `@mlc-ai/web-llm` for running language models in the browser via WebGPU.
*   **Dependencies:** Relies on CDNs for Bootstrap and WebLLM. The modular components ([`app.js`](app.js:1), [`style.css`](style.css:1)) are also loaded from CDN Gist links as per the project's design.

## Development Notes

*   The project's structure is the result of a refactoring effort aimed at modularity and creating a lightweight bookmarkable application. Details of this plan can be found in [`refactor_plan.md`](refactor_plan.md:1).
