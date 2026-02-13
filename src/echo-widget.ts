import { App } from "@modelcontextprotocol/ext-apps";

// Initialize MCP App bridge for communication with ChatGPT
const app = new App({
  name: "Echo Widget",
  version: "1.0.0",
});

// DOM elements
const echoTextEl = document.getElementById("echo-text") as HTMLDivElement;
const charCountEl = document.getElementById("char-count") as HTMLSpanElement;
const wordCountEl = document.getElementById("word-count") as HTMLSpanElement;
const timestampEl = document.getElementById("timestamp") as HTMLSpanElement;
const echoAgainBtn = document.getElementById("echo-again-btn") as HTMLButtonElement;
const errorContainer = document.getElementById("error-container") as HTMLDivElement;

// Store current text for re-echoing
let currentText = "";

/**
 * Format ISO timestamp to readable format
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Display error message
 */
function showError(message: string) {
  errorContainer.innerHTML = `<div class="error">⚠️ ${message}</div>`;
  setTimeout(() => {
    errorContainer.innerHTML = "";
  }, 5000);
}

/**
 * Update UI with echoed data
 */
function updateUI(result: any) {
  try {
    // Extract data from structured content
    const echoedText = result.structuredContent?.echoedText;
    const timestamp = result.structuredContent?.timestamp;

    // Extract metadata (only available to UI, not model)
    const characterCount = result._meta?.characterCount ?? 0;
    const wordCount = result._meta?.wordCount ?? 0;

    if (echoedText) {
      currentText = echoedText;
      echoTextEl.textContent = `"${echoedText}"`;
      charCountEl.textContent = String(characterCount);
      wordCountEl.textContent = String(wordCount);

      if (timestamp) {
        timestampEl.textContent = formatTimestamp(timestamp);
      }

      console.log("✅ UI updated with echoed text:", {
        text: echoedText,
        chars: characterCount,
        words: wordCount,
        timestamp,
      });
    } else {
      echoTextEl.textContent = "No text received";
      showError("No text was provided in the result");
    }
  } catch (error) {
    console.error("❌ Error updating UI:", error);
    showError("Failed to update UI");
  }
}

/**
 * Handle tool results from server
 */
app.ontoolresult = (result) => {
  console.log("📥 Tool result received:", result);
  updateUI(result);
};

/**
 * Button click handler - call echo tool again
 */
echoAgainBtn.addEventListener("click", async () => {
  if (!currentText) {
    showError("No text to echo! Please provide text first.");
    return;
  }

  try {
    echoTextEl.textContent = "Echoing...";
    echoAgainBtn.disabled = true;

    console.log("🔄 Calling echo tool with:", currentText);

    // Call server tool via MCP Apps bridge
    const result = await app.callServerTool({
      name: "echo",
      arguments: { text: currentText },
    });

    console.log("✅ Echo again result:", result);

    // Update UI with new result
    updateUI(result);
  } catch (error) {
    console.error("❌ Echo failed:", error);
    echoTextEl.textContent = currentText ? `"${currentText}"` : "Error";
    showError("Failed to echo text. Please try again.");
  } finally {
    echoAgainBtn.disabled = false;
  }
});

// Connect to MCP host (ChatGPT)
app.connect();
console.error("🚀 Echo widget initialized and connected to MCP host");
console.error("📋 Waiting for tool results...");
