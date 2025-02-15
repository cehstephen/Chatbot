class ChatWidget {
    constructor(options = {}) {
        this.endpoint = options.endpoint || 'http://localhost:5005/webhooks/rest/webhook';
        this.initializeWidget();
    }

    addStyles() {
        const styles = `
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Segoe UI', -apple-system, sans-serif;
            }

            .chat-toggle {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0062ff, #0039cb);
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 98, 255, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chat-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 98, 255, 0.4);
            }

            .chat-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 360px;
                height: 550px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                display: none;
                flex-direction: column;
                overflow: hidden;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }

            .chat-window.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .chat-header {
                padding: 16px;
                background: linear-gradient(135deg, #0062ff, #0039cb);
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .chat-title {
                font-size: 16px;
                font-weight: 600;
            }

            .chat-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
                padding: 4px;
                transition: transform 0.2s ease;
            }

            .chat-close:hover {
                transform: rotate(90deg);
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8faff;
            }

            .message {
                margin-bottom: 12px;
                opacity: 0;
                transform: translateY(10px);
                animation: messageAppear 0.3s ease forwards;
            }

            @keyframes messageAppear {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .message-row {
                display: flex;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .avatar {
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

            .user-avatar {
                background: #e3f2fd;
                color: #0062ff;
                margin-left: 8px;
            }

            .bot-avatar {
                background: #0062ff;
                color: white;
                margin-right: 8px;
            }

            .message-content {
                max-width: 80%;
                padding: 10px 14px;
                border-radius: 14px;
                font-size: 14px;
                line-height: 1.4;
                position: relative;
            }

            .user-message .message-content {
                background: #0062ff;
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            }

            .bot-message .message-content {
                background: white;
                color: #1a1a1a;
                border-bottom-left-radius: 4px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .chat-input-area {
                padding: 16px;
                background: white;
                border-top: 1px solid #edf2f7;
            }

            .chat-input-container {
                display: flex;
                gap: 8px;
            }

            .chat-input {
                flex: 1;
                padding: 10px 14px;
                border: 2px solid #e2e8f0;
                border-radius: 24px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                outline: none;
            }

            .chat-input:focus {
                border-color: #0062ff;
            }

            .chat-send {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #0062ff;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease;
            }

            .chat-send:hover {
                transform: scale(1.05);
            }

            .code-block {
                background: #1a1a1a;
                color: #ffffff;
                padding: 12px;
                border-radius: 8px;
                font-family: 'Consolas', monospace;
                font-size: 13px;
                margin: 8px 0;
                white-space: pre-wrap;
            }

            a {
                color: inherit;
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            .bot-message a {
                color: #0062ff;
            }

            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 8px 12px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .typing-dot {
                width: 6px;
                height: 6px;
                background: #0062ff;
                border-radius: 50%;
                opacity: 0.4;
                animation: typingAnimation 1.4s infinite;
            }

            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typingAnimation {
                0%, 100% { opacity: 0.4; transform: translateY(0); }
                50% { opacity: 1; transform: translateY(-4px); }
            }

            ::-webkit-scrollbar {
                width: 6px;
            }

            ::-webkit-scrollbar-track {
                background: transparent;
            }

            ::-webkit-scrollbar-thumb {
                background: #ccd6e5;
                border-radius: 3px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #b3bfd1;
            }
            
            .message-content {
        position: relative;
    }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createWidget() {
        const widgetHTML = `
            <div class="chat-widget">
                <button class="chat-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </button>
                <div class="chat-window">
                    <div class="chat-header">
                        <div class="chat-title"> Virtual Assistant</div>
                        <button class="chat-close">×</button>
                    </div>
                    <div class="chat-messages"></div>
                    <div class="chat-input-area">
                        <div class="chat-input-container">
                            <input type="text" class="chat-input" placeholder="Ask about our services...">
                            <button class="chat-send">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 2L11 13"/>
                                    <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    initializeElements() {
        this.widget = document.querySelector('.chat-widget');
        this.toggleBtn = this.widget.querySelector('.chat-toggle');
        this.closeBtn = this.widget.querySelector('.chat-close');
        this.chatWindow = this.widget.querySelector('.chat-window');
        this.messagesContainer = this.widget.querySelector('.chat-messages');
        this.input = this.widget.querySelector('.chat-input');
        this.sendBtn = this.widget.querySelector('.chat-send');
    }

    addEventListeners() {
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        const isVisible = this.chatWindow.style.display === 'flex';
        this.chatWindow.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            // Allow display: flex to take effect before adding visible class
            setTimeout(() => this.chatWindow.classList.add('visible'), 10);
            this.input.focus();
        } else {
            this.chatWindow.classList.remove('visible');
        }
        this.toggleBtn.style.display = isVisible ? 'flex' : 'none';
    }

    addMessage(content, isUser) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

        const html = `
            <div class="message-row">
                ${isUser ? '' : `<div class="avatar bot-avatar">Bot</div>`}
                <div class="message-content">${this.formatContent(content)}</div>
                ${isUser ? `<div class="avatar user-avatar">You</div>` : ''}
            </div>
        `;

        messageEl.innerHTML = html;
        this.messagesContainer.appendChild(messageEl);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addTypingIndicator() {
        const indicatorEl = document.createElement('div');
        indicatorEl.className = 'message bot-message';
        indicatorEl.innerHTML = `
            <div class="message-row">
                <div class="avatar bot-avatar">Bot</div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(indicatorEl);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        return indicatorEl;
    }

    formatContent(content) {
    if (!content) return '';

    // More robust URL detection regex
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

    // Convert URLs to links while preserving surrounding text
    content = content.replace(urlRegex, (url) => {
        // Make sure the URL is properly encoded
        const encodedUrl = encodeURI(url);
        return `<a href="${encodedUrl}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
    });

    // Format code blocks (if any)
    content = content.replace(/```(\w+)?\n([\s\S]*?)\n```/g,
        (_, language, code) => `<div class="code-block">${code}</div>`
    );

    return content;
}


//     async sendMessage() {
//     const message = this.input.value.trim();
//     if (!message) return;
//
//     this.input.value = '';
//     this.addMessage(message, true);
//     const typingIndicator = this.addTypingIndicator();
//
//     try {
//         const response = await fetch(this.endpoint, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 sender: 'user',
//                 message: message
//             })
//         });
//
//         const data = await response.json();
//         console.log("Bot response:", data);  // Add this line to debug
//         typingIndicator.remove();
//
//         data.forEach(msg => {
//             if (msg.text) {
//                 console.log("Processing message:", msg.text);  // Add this line too
//                 this.addMessage(msg.text, false);
//             }
//         });
//     } catch (error) {
//         console.error("Error:", error);  // And this for error logging
//         typingIndicator.remove();
//         this.addMessage('Sorry, there was an error processing your request.', false);
//     }
//
//     this.input.focus();
// }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.input.value = '';
        this.addMessage(message, true);
        const typingIndicator = this.addTypingIndicator();

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: 'user',
                    message: message
                })
            });

            const data = await response.json();
            typingIndicator.remove();

            data.forEach(msg => {
                if (msg.text) {
                    this.addMessage(msg.text, false);
                }
            });
        } catch (error) {
            typingIndicator.remove();
            this.addMessage('Sorry, there was an error processing your request.', false);
        }

        this.input.focus();
    }

    initializeWidget() {
        this.addStyles();
        this.createWidget();
        this.initializeElements();
        this.addEventListeners();
    }
}