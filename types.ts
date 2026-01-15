
export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
}

export type WorkflowStepId = 
  | 'buyer_inquiry'
  | 'supplier_compare'
  | 'fabric_trims_collection'
  | 'costing_quotation'
  | 'fob_approval'
  | 'samples_track'
  | 'samples_approval'
  | 'wash_print_approval'
  | 'production_planning'
  | 'inline_report'
  | 'daily_production'
  | 'inspection_report'
  | 'final_inspection_approval'
  | 'commercial_docs'
  | 'final_payment'
  | 'discrepancy_record';

export interface StepRecord {
  id: string;
  note: string;
  imageUrl?: string;
  timestamp: string;
}

export interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: StepStatus;
  updatedAt: string;
  dueDate?: string;
  comment?: string;
  records?: StepRecord[];
  data?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  companyRole: string;
  isAdmin: boolean;
  color?: string;
}

export interface CollaborationState {
  userId: string;
  userName: string;
  userColor: string;
  activeSection?: string;
  lastSeen: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Project {
  id: string;
  styleName: string;
  styleNumber: string;
  buyerName: string;
  season: string;
  quantity: number;
  shipDate: string;
  currentStepIndex: number;
  workflow: WorkflowStep[];
  productImageUrl?: string;
  techPackUrl?: string;
  techPackNotes?: string;
  isUrgent?: boolean;
  todoItems?: TodoItem[];
  merchandiserNotes?: string;
}
