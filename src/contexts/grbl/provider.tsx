import { GrblContext } from "./context";

import { Connection, WebSocketState } from "../../lib/ws";
import { MockWebSocket } from "../../lib/mock-ws";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { parseGrblMessage, type GrblStatus } from "../../lib/grbl";

const DEV = import.meta.env.DEV;

// Set this to true to force using Mock mode locally
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function GrblProvider(props: { children: preact.ComponentChildren }) {
  const [connectionState, setConnectionState] = useState<WebSocketState>(WebSocketState.CONNECTING);
  const [grblState, setGrblState] = useState<GrblStatus>();

  const mergedGrblState = useCallback(
    (oldState: GrblStatus | undefined, newState: GrblStatus | undefined): GrblStatus | undefined => {
      if (!oldState) return newState;
      if (!newState) return oldState;
      return { ...oldState, ...newState };
    },
    [],
  );

  const ws = useMemo(
    () =>
      new Connection({
        url: DEV ? "/" : "http://fluidnc.local/",
        reportInterval: 80,
        socketFactory: USE_MOCK ? (url) => new MockWebSocket(url) as unknown as WebSocket : undefined,
      }),
    [],
  );

  useEffect(() => {
    const offState = ws.on<WebSocketState>("statechange", (msg) => setConnectionState(msg.value));
    const offMessage = ws.on<WebSocketState>("message", (msg) =>
      setGrblState((oldState) => mergedGrblState(oldState, parseGrblMessage(msg.value))),
    );
    ws.connect();
    return () => {
      offState();
      offMessage();
      ws.close();
    };
  }, [ws, mergedGrblState]);

  const send = useCallback((message: string) => ws.send(message), [ws]);
  const sendImmediate = useCallback((message: string) => ws.sendImmediate(message), [ws]);

  return (
    <GrblContext.Provider
      value={{
        connectionState,
        send,
        sendImmediate,
        ...grblState,
      }}
    >
      {props.children}
    </GrblContext.Provider>
  );
}
