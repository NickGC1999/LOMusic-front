export interface Song {
  // 1. Identificadores y Core
  id: number;
  title: string;
  artist: string;
  album: string;
  year?: number | null;
  genre?: string | null;

  // 2. Metadatos de Estudio Canónicos
  trackNumber?: number | null;
  track?: number | null;          // ALIAS PUENTE para tablas antiguas
  discNumber?: number | null;     // CRÍTICO: Reintegrado para el modal de estudio

  durationMs?: number;
  duration?: string;              // ALIAS PUENTE ("3:45")

  bitrate?: number | null;
  sampleRate?: number | null;
  bpm?: number | null;
  initialKey?: string | null;
  format: string;
  composer?: string | null;
  albumArtist?: string | null;
  publisher?: string | null;
  copyright?: string | null;
  lyrics?: string | null;

  // 3. Rutas y Carátulas
  filePath?: string;
  coverUrl?: any;                 // ALIAS PUENTE para evitar colisiones null en vistas previas

  // 4. Banderas Internas
  isModified?: boolean | number;
  isIncomplete?: boolean | number;
}