export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  result?: QueryResult;
}

export interface QueryResult {
  data: any[];
  info: QueryDesc
}

export interface QueryDesc {
  columns: string[];
  error?: string;
  query?: string;
  desc?: string;
  reasoning?: {
    steps: string[];
    optimization_notes: string[];
  };
  tables_used?: string[];
  columns_used?: string[];
}

export interface QueryRequest {
  query: string;
  language: string;
}

export interface Settings {
  dbName: string;
  dbUri: string;
  aiModel: 'openai' | 'claude';
}
//types.ts

export type UserRole = 'Minister' | 'Assistant Minister' | 'Chef de Cabinet' | 'Simple Agent' | 'Secretaire General';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface User {
  id_user: number;
  username: string;
  full_name: string;
  role: UserRole;
  id_direction: number | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Direction {
  ID_DIRECTION: number;
  DESCRIPTION: string;
  ABBREVIATION: string;
}

export interface Complaint {
  id_complaint: number;
  id_user: number;
  id_direction: number;
  complaint_text: string;
  status: ComplaintStatus;
  assigned_to_role?: string;
  assignment_comment?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_role: string;
  direction_name: string;
  direction_abbr: string;
}

export interface ApiError {
  error: string;
}