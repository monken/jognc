import { createContext } from "preact";
import type { WebSocketState } from "../../lib/ws";
import { useContext } from "preact/hooks";
import type { GrblStatus } from "../../lib/grbl";

interface GrblContextValue extends Partial<GrblStatus> {
  connectionState: WebSocketState;
  send: (message: string) => Promise<void>;
  sendImmediate: (message: string) => Promise<void>;
}

export const GrblContext = createContext<GrblContextValue>({} as GrblContextValue);

export function useGrbl() {
  return useContext(GrblContext);
}
