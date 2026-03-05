export class MockWebSocket extends EventTarget {
  readyState: number = WebSocket.CONNECTING;
  url: string | URL;
  private interval?: ReturnType<typeof setInterval>;

  private mpos = { x: 0, y: 0, z: 0 };
  private target = { x: 0, y: 0, z: 0 };
  private velocity = { x: 0, y: 0, z: 0 }; // Current velocity
  private feedRate = 1000; // in mm/min
  private lastUpdate = 0;
  private state = "Alarm";
  private lastReport = "";

  constructor(url: string | URL) {
    super();
    this.url = url;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.dispatchEvent(new Event("open"));
      this.simulateMessage("currentID:mock-1");
      this.startStatusReport();
    }, 100);
  }

  send(data: string) {
    console.log("[MockWS] Sending:", data);

    // Simulate async processing
    setTimeout(() => {
      if (data.includes("\x85")) {
        this.target = { ...this.mpos };
        this.simulateMessage("ok");
      } else if (data.startsWith("$Report/Interval=")) {
        // Configuration command, just ack
        this.simulateMessage("ok");
      } else if (data.startsWith("$J=")) {
        // Parse Jog Command: $J=G91 X10 F1000
        this.handleJog(data);
        this.simulateMessage("ok");
      } else if (data.startsWith("$X")) {
        this.state = "Idle";
        this.simulateMessage("ok");
      } else if (data.trim() === "") {
        // keep-alive ping
        this.simulateMessage("ok");
      } else {
        // Command execution
        this.simulateMessage("ok");
      }
    }, 50);
  }

  private handleJog(cmd: string) {
    // Basic parser for relative jogs used by the UI
    // Expected format example: $J=G91 X10 F500
    // Note: This is a simplified mock. It assumes G91 (relative) if not specified,
    // or handles standard remote control jogging patterns.

    // Reset state to Run
    this.state = "Jog";

    const params = cmd.split(" ");

    params.forEach((p) => {
      const key = p.charAt(0).toUpperCase();
      const val = parseFloat(p.substring(1));
      if (isNaN(val)) return;

      if (key === "X") this.target.x += val;
      if (key === "Y") this.target.y += val;
      if (key === "Z") this.target.z += val;
      if (key === "F") this.feedRate = val;
    });
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.interval) clearInterval(this.interval);
    this.dispatchEvent(new Event("close"));
  }

  simulateMessage(text: string) {
    this.dispatchEvent(new MessageEvent("message", { data: text }));
  }

  private startStatusReport() {
    this.lastUpdate = Date.now();
    this.interval = setInterval(() => {
      this.updatePhysics();

      const report =
        "<" +
        [
          this.state,
          `MPos:${this.mpos.x.toFixed(3)},${this.mpos.y.toFixed(3)},${this.mpos.z.toFixed(3)}`,
          `FS:${(Math.max(...Object.values(this.velocity).map(Math.abs)) * 60).toFixed(0)},0`,
        ].join("|") +
        ">";

      // Only send if changed (FluidNC optimization simulation)
      if (report !== this.lastReport) {
        this.simulateMessage(report);
        this.lastReport = report;
      }
    }, 50);
  }

  private updatePhysics() {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000; // Delta time in seconds
    this.lastUpdate = now;

    if (this.state !== "Jog" || dt <= 0) return;

    const MAX_SPEED = this.feedRate; // in mm/min
    const MAX_SPEED_SEC = MAX_SPEED / 60; // mm/s

    let moving = false;

    (["x", "y", "z"] as const).forEach((axis) => {
      const p = this.mpos[axis];
      const t = this.target[axis];
      const dist = t - p;

      if (Math.abs(dist) < 0.001) {
        this.velocity[axis] = 0;
        this.mpos[axis] = t;
        return;
      }

      let step = MAX_SPEED_SEC * dt;
      if (step > Math.abs(dist)) step = Math.abs(dist);

      const dp = Math.sign(dist) * step;
      this.mpos[axis] = p + dp;
      this.velocity[axis] = dp / dt;

      moving = true;
    });

    if (!moving) {
      this.state = "Idle";
    }
  }
}
