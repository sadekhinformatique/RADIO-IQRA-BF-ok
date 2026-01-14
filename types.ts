
export interface Program {
  id: string;
  title: string;
  time: string;
  description: string;
}

export interface Inspiration {
  text: string;
  source: string;
}

export enum PlayerStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}
