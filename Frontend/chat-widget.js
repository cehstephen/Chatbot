class ChatWidget {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'http://localhost:5005/webhooks/rest/webhook';
    this.initializeWidget();
  }

  initializeWidget() {
    this.addStyles();
    this.createWidget();
    this.initializeElements();
    this.addEventListeners();
  }

  addStyles() {
    const styles = `
      .doc-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .doc-chat-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: background-color 0.2s;
      }

      .doc-chat-toggle:hover {
        background: #1d4ed8;
      }

      .doc-chat-window {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 384px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .doc-chat-header {
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
      }

      .doc-chat-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .doc-chat-close {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .doc-chat-close:hover {
        background: #e5e7eb;
      }

      .doc-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9fafb;
      }

      .doc-chat-message-container {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        animation: message-fade-in 0.3s ease;
      }

      @keyframes message-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .doc-chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
      }

      .doc-chat-user-avatar {
        background: #bfdbfe;
        color: #1e40af;
      }

      .doc-chat-assistant-avatar {
        background: #e5e7eb;
        color: #374151;
      }

      .doc-chat-message-content {
        flex: 1;
        max-width: calc(100% - 44px);
      }

      .doc-chat-message-name {
        font-size: 12px;
        margin-bottom: 4px;
        color: #6b7280;
        font-weight: 500;
      }

      .doc-chat-message-bubble {
        padding: 12px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
      }

      .doc-chat-message-bubble.user {
        background: #eff6ff;
        color: #1e40af;
      }

      .doc-chat-message-bubble.assistant {
        background: white;
        color: #374151;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .doc-chat-code-block {
        background: #1f2937;
        color: #e5e7eb;
        padding: 12px;
        border-radius: 6px;
        margin-top: 8px;
        position: relative;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      }

      .doc-chat-code-language {
        position: absolute;
        top: 8px;
        left: 12px;
        font-size: 12px;
        color: #9ca3af;
      }

      .doc-chat-code-block pre {
        margin: 0;
        padding-top: 20px;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 13px;
      }

      .doc-chat-code-copy {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        color: #e5e7eb;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      }

      .doc-chat-code-copy:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .doc-chat-input-area {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        background: white;
      }

      .doc-chat-input-container {
        display: flex;
        gap: 8px;
      }

      .doc-chat-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        outline: none;
        font-size: 14px;
        transition: all 0.2s;
        resize: none;
        max-height: 120px;
        min-height: 44px;
      }

      .doc-chat-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
      }

      .doc-chat-send {
        padding: 8px 16px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .doc-chat-send:hover {
        background: #1d4ed8;
      }

      .doc-chat-send:disabled {
        background: #93c5fd;
        cursor: not-allowed;
      }

      .doc-chat-loading {
        display: flex;
        gap: 4px;
        padding: 8px 12px;
        background: white;
        border-radius: 8px;
        width: fit-content;
        margin: 8px 0;
      }

      .doc-chat-loading-dot {
        width: 6px;
        height: 6px;
        background: #94a3b8;
        border-radius: 50%;
        animation: doc-chat-pulse 1.5s infinite;
      }

      .doc-chat-loading-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .doc-chat-loading-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes doc-chat-pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  createWidget() {
    const widgetHTML = `
      <div class="doc-chat-widget">
        <button class="doc-chat-toggle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </button>
        <div class="doc-chat-window">
          <div class="doc-chat-header">
            <div class="doc-chat-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Virtual Assistant
            </div>
            <button class="doc-chat-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="doc-chat-messages"></div>
          <div class="doc-chat-input-area">
            <div class="doc-chat-input-container">
              <textarea 
                class="doc-chat-input" 
                placeholder="Ask about documentation..." 
                rows="1"
              ></textarea>
              <button class="doc-chat-send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);
  }

  initializeElements() {
    this.toggleBtn = document.querySelector('.doc-chat-toggle');
    this.closeBtn = document.querySelector('.doc-chat-close');
    this.chatWindow = document.querySelector('.doc-chat-window');
    this.messagesContainer = document.querySelector('.doc-chat-messages');
    this.input = document.querySelector('.doc-chat-input');
    this.sendBtn = document.querySelector('.doc-chat-send');
  }

  addEventListeners() {
    this.toggleBtn.addEventListener('click', () => this.toggleChat());
    this.closeBtn.addEventListener('click', () => this.toggleChat());
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = this.input.scrollHeight + 'px';
    });
  }

  toggleChat() {
    const isVisible = this.chatWindow.style.display === 'flex';
    this.chatWindow.style.display = isVisible ? 'none' : 'flex';
    this.toggleBtn.style.display = isVisible ? 'flex' : 'none';
    if (!isVisible) {
      this.input.focus();
    }
  }

  addMessage(content, isUser, type = 'text') {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'doc-chat-message-container';

    const avatarText = isUser ? 'Y' : 'A';
    const name = isUser ? 'You' : 'Assistant';
    const avatarClass = isUser ? 'doc-chat-user-avatar' : 'doc-chat-assistant-avatar';
    const bubbleClass = isUser ? 'user' : 'assistant';

    messageContainer.innerHTML = `
      <div class="doc-chat-avatar ${avatarClass}">${avatarText}</div>
      <div class="doc-chat-message-content">
        <div class="doc-chat-message-name">${name}</div>
        <div class="doc-chat-message-bubble ${bubbleClass}">
          ${this.formatContent(content, type)}
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(messageContainer);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  formatContent(content, type) {
    switch (type) {
      case 'json':
        return `<pre>${JSON.stringify(content, null, 2)}</pre>`;
      case 'error':
        return `<div style="color: #ef4444;">${content}</div>`;
      default:
        return this.processCodeBlocks(content);
    }
  }


  processCodeBlocks(content) {
    if (!content) return '';

    return content.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, language, code) => {
      return `
        <div class="doc-chat-code-block">
          ${language ? `<div class="doc-chat-code-language">${language}</div>` : ''}
          <button class="doc-chat-code-copy" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`')}\`)">Copy</button>
          <pre><code>${this.escapeHtml(code)}</code></pre>
        </div>
      `;
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  addLoadingIndicator() {
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'doc-chat-message-container';

    loadingContainer.innerHTML = `
      <div class="doc-chat-avatar doc-chat-assistant-avatar">A</div>
      <div class="doc-chat-message-content">
        <div class="doc-chat-message-name">Assistant</div>
        <div class="doc-chat-message-bubble assistant">
          <div class="doc-chat-loading">
            <div class="doc-chat-loading-dot"></div>
            <div class="doc-chat-loading-dot"></div>
            <div class="doc-chat-loading-dot"></div>
          </div>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(loadingContainer);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return loadingContainer;
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    // Disable input and button while sending
    this.input.disabled = true;
    this.sendBtn.disabled = true;

    // Add user message
    this.addMessage(message, true);
    this.input.value = '';
    this.input.style.height = 'auto';

    // Add loading indicator
    const loadingEl = this.addLoadingIndicator();

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'user',
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      loadingEl.remove();

      // Process each response message
      data.forEach(msg => {
        if (msg.custom) {
          this.addMessage(msg.custom, false);
        } else if (msg.json_message) {
          this.addMessage(msg.json_message, false, 'json');
        } else {
          this.addMessage(msg.text, false);
        }
      });

    } catch (error) {
      console.error('Error:', error);
      loadingEl.remove();
      this.addMessage('Sorry, there was an error processing your request.', false, 'error');
    } finally {
      // Re-enable input and button
      this.input.disabled = false;
      this.sendBtn.disabled = false;
      this.input.focus();
    }
  }
}