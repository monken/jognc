import { effect, signal } from "@preact/signals";

export type JogSettings = {
  incremental: boolean;
  fsIdx: number;
};

const getInitialJogSettings = (): JogSettings => {
  const stored = localStorage.getItem("jog:settings");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return {
    incremental: false,
    fsIdx: 0,
  };
};

export const jogSettings = signal<JogSettings>(getInitialJogSettings());

export function updateJogSettings<K extends keyof JogSettings>(key: K, value: JogSettings[K]) {
  jogSettings.value = { ...jogSettings.value, [key]: value };
}

effect(() => {
  localStorage.setItem("jog:settings", JSON.stringify(jogSettings.value));
});
