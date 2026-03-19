import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faComments, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface ChatMessage {
  sender: string;
  text: string;
}

@Component({
  selector: 'app-carnival-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FontAwesomeModule],
  template: `
    <div class="carnival-widget-container">
      <!-- Floating Badge Button -->
      <button class="carnival-badge" (click)="toggleChatPanel()">
        <fa-icon [icon]="faCommentsIcon" size="2x"></fa-icon>
        <span *ngIf="!isWsConnected" class="ws-status-indicator error" title="WebSocket disconnected">!</span>
      </button>

      <!-- Chat Panel -->
      <div class="chat-panel" [class.open]="isChatPanelOpen">
        <div class="chat-header">
          <h3>Carnival AI Assistant</h3>
          <button class="close-btn" (click)="toggleChatPanel()">X</button>
        </div>
        <div class="chat-messages">
          <div *ngFor="let msg of chatMessages" class="chat-message" [class.user]="msg.sender === 'You'">
            <span class="sender">{{ msg.sender }}:</span> {{ msg.text }}
          </div>
          <div *ngIf="!isWsConnected" class="chat-message system-message error">
            WebSocket disconnected. Messages starting with "UI Change:" will still attempt to create a ticket.
          </div>
        </div>
        <div class="chat-input">
          <input
            type="text"
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            placeholder="Type your message... (e.g., 'UI Change: move button to left')"
          />
          <button (click)="sendMessage()" [disabled]="!newMessage.trim()">
            <fa-icon [icon]="faPaperPlaneIcon"></fa-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .carnival-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: Arial, sans-serif;
    }

    .carnival-badge {
      background-color: #e91e63; /* Carnival pink */
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s ease;
      position: relative; /* For status indicator */
    }

    .carnival-badge:hover {
      background-color: #c2185b;
    }

    .ws-status-indicator {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #f44336; /* Red for error */
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8em;
      font-weight: bold;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(0.9); opacity: 0.8; }
      to { transform: scale(1.1); opacity: 1; }
    }

    .chat-panel {
      position: fixed;
      bottom: 90px; /* Above the badge */
      right: 20px;
      width: 320px;
      height: 400px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(10px) scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease-in-out;
    }

    .chat-panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .chat-header {
      background-color: #e91e63;
      color: white;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 1.1em;
    }

    .chat-header .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2em;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
    }

    .chat-header .close-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .chat-messages {
      flex-grow: 1;
      padding: 15px;
      overflow-y: auto;
      background-color: #f8f9fa;
      border-bottom: 1px solid #eee;
    }

    .chat-message {
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 15px;
      max-width: 80%;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .chat-message .sender {
      font-weight: bold;
      margin-right: 5px;
    }

    .chat-message:not(.user) {
      background-color: #e0e0e0; /* AI/System background */
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }

    .chat-message.user {
      background-color: #d1e7dd; /* User background (light green) */
      margin-left: auto;
      text-align: right;
      border-bottom-right-radius: 2px;
    }

    .chat-message.user .sender {
      color: #0f5132; /* Dark green for user sender */
    }

    .chat-message:not(.user) .sender {
      color: #495057; /* Dark grey for AI sender */
    }

    .chat-message.system-message {
      background-color: #fff3cd; /* Warning yellow */
      color: #664d03;
      text-align: center;
      margin: 10px auto;
      border-radius: 5px;
      padding: 8px;
      font-size: 0.9em;
    }
    .chat-message.system-message.error {
        background-color: #f8d7da; /* Error red */
        color: #721c24;
    }

    .chat-input {
      display: flex;
      padding: 10px 15px;
      background-color: #f1f3f4;
      border-top: 1px solid #e0e0e0;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .chat-input input {
      flex-grow: 1;
      border: 1px solid #ced4da;
      border-radius: 20px;
      padding: 8px 15px;
      font-size: 0.95em;
      margin-right: 10px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input input:focus {
      border-color: #e91e63;
    }

    .chat-input button {
      background-color: #e91e63;
      color: white;
      border: none;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .chat-input button:hover:not(:disabled) {
      background-color: #c2185b;
    }

    .chat-input button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `
})
export class CarnivalWidgetComponent implements OnInit, OnDestroy {
  isChatPanelOpen: boolean = false;
  newMessage: string = '';
  chatMessages: ChatMessage[] = [];
  webSocket: WebSocket | null = null;
  isWsConnected: boolean = false; // To show WebSocket status

  private readonly wsUrl = 'ws://localhost:8080/ws';
  private readonly apiUrl = 'http://localhost:8080/api/ai/aura/ticket';

  // FontAwesome Icons
  faCommentsIcon = faComments; // Used for the floating badge (chat icon)
  faPaperPlaneIcon = faPaperPlane; // Used for the send button

  constructor(private http: HttpClient, library: FaIconLibrary) {
    // Add icons to the library so they can be used in the template
    library.addIcons(faComments, faPaperPlane);
  }

  ngOnInit(): void {
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.closeWebSocket();
  }

  toggleChatPanel(): void {
    this.isChatPanelOpen = !this.isChatPanelOpen;
    if (this.isChatPanelOpen) {
      // Optional: Focus on input when panel opens
      setTimeout(() => {
        const input = document.querySelector('.chat-input input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 0);
    }
  }

  private connectWebSocket(): void {
    this.webSocket = new WebSocket(this.wsUrl);

    this.webSocket.onopen = (event) => {
      console.log('WebSocket connection opened:', event);
      this.isWsConnected = true;
      this.addMessage('System', 'Connected to AI assistant.');
    };

    this.webSocket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      this.addMessage('AI', event.data); // Assuming event.data is the plain text message
    };

    this.webSocket.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.isWsConnected = false;
      this.addMessage('System', 'WebSocket error. Attempting to reconnect...');
      // Simple reconnect logic after a delay
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.webSocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      this.isWsConnected = false;
      this.addMessage('System', 'WebSocket disconnected. Attempting to reconnect...');
      // Simple reconnect logic after a delay
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  private closeWebSocket(): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.close();
    }
  }

  addMessage(sender: string, text: string): void {
    this.chatMessages.push({ sender, text });
    // Scroll to the bottom of messages to show the latest
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 0);
  }

  sendMessage(): void {
    const message = this.newMessage.trim();
    if (!message) {
      return;
    }

    this.addMessage('You', message);
    this.newMessage = '';

    // If the message describes a UI change, trigger a POST request
    if (message.toLowerCase().startsWith('ui change:')) {
      const description = message.substring('ui change:'.length).trim();
      this.sendTicketRequest(description);
    } else if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      // Otherwise, if WebSocket is open, send via WebSocket
      this.sendWebSocketMessage(message);
    } else {
      // If WebSocket is not connected and it's not a UI change request
      this.addMessage('System', 'Cannot send message. WebSocket is not connected. "UI Change:" messages can still create a ticket.');
    }
  }

  private sendWebSocketMessage(message: string): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(message);
    }
  }

  private sendTicketRequest(description: string): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post(this.apiUrl, { description: description }, { headers }).subscribe({
      next: (response: any) => {
        console.log('Ticket created successfully:', response);
        this.addMessage('AI', 'UI Change ticket created! Response: ' + (response.message || JSON.stringify(response)));
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
        this.addMessage('AI', 'Error creating UI Change ticket: ' + (error.message || 'Failed to connect to API.'));
      }
    });
  }
}