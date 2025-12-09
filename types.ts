export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { 
    uri: string; 
    title: string; 
    placeAnswerSources?: { reviewSnippets: any[] } 
  };
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachment?: Attachment;
  groundingChunks?: GroundingChunk[];
  timestamp: Date;
  options?: string[]; // For interactive bot buttons (e.g., Age groups, Gender)
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface UserProfile {
  name: string;
  phone: string;
}

export type AppScreen = 'landing' | 'chat';