export const GrblState = {
  IDLE: "Idle",
  RUN: "Run",
  HOLD_0: "Hold:0",
  HOLD_1: "Hold:1",
  JOG: "Jog",
  ALARM: "Alarm",
  DOOR_0: "Door:0",
  DOOR_1: "Door:1",
  DOOR_2: "Door:2",
  DOOR_3: "Door:3",
  CHECK: "Check",
  HOME: "Home",
  SLEEP: "Sleep",
} as const;

// Idle, Run, Hold, Jog, Alarm, Door, Check, Home, Sleep

export type GrblState = (typeof GrblState)[keyof typeof GrblState];

export interface GrblStatus {
  state: GrblState;
  mPos?: number[];
  wPos?: number[];
  wco?: number[];
  feed?: number;
  spindle?: number;
  buffer?: {
    available: number;
    rx: number;
  };
  lineNumber?: number;
  pins: string[];
  overrides?: {
    feed: number;
    rapid: number;
    spindle: number;
  };
  accessoryState?: string[];
}

export function parseGrblMessage(message: string): GrblStatus | undefined {
  if (message.startsWith("<") && message.endsWith(">")) {
    return parseGrblStatus(message);
  }
}

export function parseGrblStatus(statusString: string): GrblStatus | undefined {
  const match = statusString.match(/^<(.+)>$/);
  if (!match) return;

  const content = match[1];
  const parts = content.split("|");

  if (parts.length === 0) return;

  const result: GrblStatus = { state: parts[0] as GrblState, pins: [] };

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const [key, value] = part.split(":");

    if (!key || !value) continue;

    switch (key) {
      case "MPos":
        result.mPos = value.split(",").map(Number);
        break;
      case "WPos":
        result.wPos = value.split(",").map(Number);
        break;
      case "WCO":
        result.wco = value.split(",").map(Number);
        break;
      case "FS": {
        const [feed, spindle] = value.split(",").map(Number);
        result.feed = feed;
        result.spindle = spindle;
        break;
      }
      case "F":
        result.feed = Number(value);
        break;
      case "Bf": {
        const [available, rx] = value.split(",").map(Number);
        result.buffer = { available, rx };
        break;
      }
      case "Ln":
        result.lineNumber = Number(value);
        break;
      case "Pn":
        result.pins = value.split("");
        break;
      case "Ov": {
        const [feed, rapid, spindle] = value.split(",").map(Number);
        result.overrides = { feed, rapid, spindle };
        break;
      }
      case "A":
        result.accessoryState = value.split("");
        break;
    }
  }

  if (result.wPos && result.wco && !result.mPos) {
    result.mPos = result.wPos.map((pos, idx) => pos + (result.wco ? result.wco[idx] : 0));
  } else if (result.mPos && result.wco && !result.wPos) {
    result.wPos = result.mPos.map((pos, idx) => pos - (result.wco ? result.wco[idx] : 0));
  }

  return result;
}
