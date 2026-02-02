export const WebSocketState = {
  CONNECTING: "CONNECTING",
  OPEN: "OPEN",
  CLOSING: "CLOSING",
  CLOSED: "CLOSED",
  RECONNECTING: "RECONNECTING",
} as const;

export type WebSocketState = (typeof WebSocketState)[keyof typeof WebSocketState];

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ResponseEvent<T> extends Event {
  value;
  constructor(type: string, dict: EventInit | undefined, value: T) {
    super(type, dict);
    this.value = value;
  }
}

interface ConnectionOptions {
  reconnect?: boolean;
  url: string | URL;
  reportInterval?: number;
  socketFactory?: (url: string | URL) => WebSocket;
}

export class Connection extends EventTarget {
  private _reconnect;
  ws?: Promise<void>;
  _ws?: WebSocket;
  private createSocket: (url: string | URL) => WebSocket;
  private queue: { message: string; resolve: () => void; reject: (reason?: any) => void }[] = [];
  url: string | URL;
  currentId?: string;
  state: WebSocketState = WebSocketState.CLOSED;
  reportInterval?: number;
  lastMessageTimestamp = 0;
  waitForResponse?: { resolve: () => void; reject: (reason?: any) => void; message: string };
  private checkInterval?: ReturnType<typeof setInterval>;

  constructor({ url, reconnect = true, reportInterval = 200, socketFactory }: ConnectionOptions) {
    super();
    this._reconnect = reconnect;
    this.createSocket = socketFactory || ((url) => new WebSocket(url));
    this.url = url;
    this.reportInterval = reportInterval;

    this.lastMessageTimestamp = Date.now();
    this.checkInterval = setInterval(() => {
      if (this.state === WebSocketState.OPEN) {
        if (Date.now() - this.lastMessageTimestamp > 10000) {
          console.warn("No heartbeat for 10s, reconnecting...");
          this.reconnect();
        } else if (this.queue.length === 0 && !this.waitForResponse) {
          this.send("");
        }
      }
    }, 1000);
  }

  async connect(): Promise<Connection> {
    if (this.ws) {
      await this.ws;
      return this;
    }
    this.ws = new Promise<void>((resolve, reject) => {
      try {
        const ws = this.createSocket(this.url);
        this.updateState(WebSocketState.CONNECTING);
        ws.addEventListener(
          "error",
          (err) => {
            if (this._ws) this.reconnect(err);
            else reject(err);
          },
          { once: true },
        );
        ws.addEventListener("message", this.onMessage.bind(this));
        ws.addEventListener("close", () => this.reconnect());
        ws.addEventListener(
          "open",
          () => {
            this._ws = ws;
            resolve();
          },
          { once: true },
        );
      } catch (err) {
        reject(err);
      }
    }).catch((err) => this.reconnect(err));
    await this.ws;
    await new Promise<void>((resolve) =>
      this.on("statechange", (e) => {
        if (e.value === WebSocketState.OPEN) resolve();
      }),
    );
    await this.flushQueue();
    return this;
  }

  dispatchEvent<T>(event: ResponseEvent<T>): boolean {
    return super.dispatchEvent(event);
  }

  updateState(state: WebSocketState): void {
    this.state = state;
    this.dispatchEvent(new ResponseEvent("statechange", undefined, state));
  }

  on<T>(
    type: string,
    callback: (msg: ResponseEvent<T>) => void | null,
    options?: AddEventListenerOptions | boolean,
  ): () => void {
    super.addEventListener(type, callback as EventListener, options);
    return () => super.removeEventListener(type, callback as EventListener);
  }

  async parseMessage(msg: MessageEvent<string | ArrayBuffer>): Promise<string | undefined> {
    const { type, data } = msg;
    if (type !== "message") return;
    if (data instanceof Blob) {
      return data.text().then((text) => text.trim());
    } else if (typeof data === "string") {
      return data.trim();
    }
    return;
  }

  async onMessage(msg: MessageEvent<string | ArrayBuffer>): Promise<void> {
    this.lastMessageTimestamp = Date.now();
    const value = await this.parseMessage(msg);
    if (value === "PING" || value?.startsWith("CURRENT_ID:")) return;
    if (!this.waitForResponse || this.waitForResponse?.message.length) console.log("<-", value);
    if (!this.currentId && value?.startsWith("currentID:")) {
      this.currentId = value.slice(10).trim();
      this.updateState(WebSocketState.OPEN);
      this.sendImmediate("$Report/Interval=" + this.reportInterval);
      return;
    } else if (value === "ok") {
      this.waitForResponse?.resolve();
      this.waitForResponse = undefined;
    } else if (value?.startsWith("error")) {
      this.waitForResponse?.reject(new Error(value));
      this.waitForResponse = undefined;
    }
    if (value !== undefined) this.dispatchEvent(new ResponseEvent("message", undefined, value.trim()));
  }

  async reconnect(err?: Event): Promise<void> {
    if (this._reconnect === false) {
      if (err) throw err;
      else return;
    }
    if (this.state === WebSocketState.RECONNECTING) return;
    this._ws?.close();
    this.updateState(WebSocketState.RECONNECTING);
    this._ws = undefined;
    this.ws = undefined;
    this.currentId = undefined;
    console.warn("Connection to backend failed, trying to reconnect");
    await sleep(2000);
    await this.connect();
  }

  close(): void {
    this._reconnect = false;
    clearInterval(this.checkInterval);
    this._ws?.close();
    this.updateState(WebSocketState.CLOSED);
  }

  _sending = false;
  async flushQueue(): Promise<void> {
    if (this._sending) return;
    this._sending = true;
    for (const msg of this.queue) {
      await new Promise<void>((resolve, reject) => {
        this.waitForResponse = { resolve, reject, message: msg.message };
        this.sendImmediate(msg.message).catch(reject);
      }).then(msg.resolve, msg.reject);
    }
    this.queue = [];
    this._sending = false;
  }

  async send(message: string): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      this.queue.push({ message, resolve, reject });
    });
    this.flushQueue();
    return promise;
  }

  async sendImmediate(msg: string): Promise<void> {
    const ws = this._ws;
    if (!ws || this.state !== WebSocketState.OPEN) {
      throw new Error("WebSocket is not open");
    } else {
      if (msg.length) console.log("->", msg);
      ws.send(msg + "\n");
    }
  }
}
