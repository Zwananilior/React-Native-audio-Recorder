// src/types.ts
export type VoiceNote = {
  id: string;
  fileUri: string;
  title?: string;
  createdAt: string; // ISO timestamp
  duration?: number; // seconds (optional)
};
