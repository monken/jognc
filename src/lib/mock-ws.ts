export class MockWebSocket extends EventTarget {
  readyState: number = WebSocket.CONNECTING;
  url: string | URL;
  private interval?: ReturnType<typeof setInterval>;

  private mpos = { x: 0, y: 0, z: 0 };
  private target = { x: 0, y: 0, z: 0 };
  private velocity = { x: 0, y: 0, z: 0 }; // Current velocity
  private lastUpdate = 0;
  private state = "Idle";
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
      if (data.startsWith("$Report/Interval=")) {
        // Configuration command, just ack
        this.simulateMessage("ok");
      } else if (data.startsWith("$J=")) {
        // Parse Jog Command: $J=G91 X10 F1000
        this.handleJog(data);
        this.simulateMessage("ok");
      } else if (data === "") {
        // keep-alive ping
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
    this.state = "Run";

    const params = cmd.split(" ");

    params.forEach((p) => {
      const key = p.charAt(0).toUpperCase();
      const val = parseFloat(p.substring(1));
      if (isNaN(val)) return;

      if (key === "X") this.target.x += val;
      if (key === "Y") this.target.y += val;
      if (key === "Z") this.target.z += val;
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
          `FS:${Math.max(...Object.values(this.velocity)).toFixed(0)},0`,
        ].join('|') +
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

    if (this.state !== "Run") return;

    const ACCEL = 250; // mm/s^2
    const MAX_SPEED = 2000; // mm/min (cap for simulation)
    const MAX_SPEED_SEC = MAX_SPEED / 60; // mm/s

    let moving = false;

    (["x", "y", "z"] as const).forEach((axis) => {
      const diff = this.target[axis] - this.mpos[axis];
      if (Math.abs(diff) < 0.01) {
        this.mpos[axis] = this.target[axis];
        this.velocity[axis] = 0;
        return;
      }

      moving = true;

      // Simple bang-bang acceleration toward target
      const direction = Math.sign(diff);

      // v = u + at
      let newVel = this.velocity[axis] + direction * ACCEL * dt;

      // Cap speed
      if (Math.abs(newVel) > MAX_SPEED_SEC) newVel = direction * MAX_SPEED_SEC;

      // Apply velocity to position
      // s = vt
      let newPos = this.mpos[axis] + newVel * dt;

      // Check overshoot
      if ((direction > 0 && newPos > this.target[axis]) || (direction < 0 && newPos < this.target[axis])) {
        newPos = this.target[axis];
        newVel = 0;
      }

      this.velocity[axis] = newVel;
      this.mpos[axis] = newPos;
    });

    if (!moving) {
      this.state = "Idle";
    }
  }
}
