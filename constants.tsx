
import React from 'react';
import { WorkflowStepId, StepStatus, Project } from './types';

export const WORKFLOW_STRUCTURE: { id: WorkflowStepId; label: string }[] = [
  { id: 'buyer_inquiry', label: 'Buyer Inquiry' },
  { id: 'supplier_compare', label: 'Supplier Comparison' },
  { id: 'fabric_trims_collection', label: 'Fabric & Trims Price' },
  { id: 'costing_quotation', label: 'Costing Quotation' },
  { id: 'fob_approval', label: 'FOB Price Approval' },
  { id: 'samples_track', label: 'Samples Submission' },
  { id: 'samples_approval', label: 'Samples Approval' },
  { id: 'wash_print_approval', label: 'Wash & Print Strike-off' },
  { id: 'production_planning', label: 'Production Planning' },
  { id: 'inline_report', label: 'Inline Report' },
  { id: 'daily_production', label: 'Daily Production Tracker' },
  { id: 'inspection_report', label: 'Inspection Report' },
  { id: 'final_inspection_approval', label: 'Final Inspection' },
  { id: 'commercial_docs', label: 'Commercial Documents' },
  { id: 'final_payment', label: 'Final Payment' },
  { id: 'discrepancy_record', label: 'Buyer Discrepancy Record' },
];

const generateDueDate = (baseIdx: number, currentIdx: number) => {
  const date = new Date();
  date.setDate(date.getDate() + (currentIdx - baseIdx) * 5);
  return date.toISOString().split('T')[0];
};

export const createInitialWorkflow = () => {
  return WORKFLOW_STRUCTURE.map((step, idx) => ({
    id: step.id,
    label: step.label,
    status: idx === 0 ? StepStatus.IN_PROGRESS : StepStatus.PENDING,
    updatedAt: new Date().toISOString(),
    dueDate: generateDueDate(0, idx),
  }));
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    styleName: 'Slim Fit Chino',
    styleNumber: 'CH-2024-001',
    buyerName: 'Urban Outfitters',
    season: 'Autumn 24',
    quantity: 5000,
    shipDate: '2024-10-15',
    currentStepIndex: 3,
    isUrgent: true,
    productImageUrl: 'https://images.unsplash.com/photo-1473963441512-7064619d77e4?q=80&w=800&auto=format&fit=crop',
    techPackUrl: '#',
    workflow: WORKFLOW_STRUCTURE.map((step, idx) => ({
      id: step.id,
      label: step.label,
      status: idx < 3 ? StepStatus.COMPLETED : idx === 3 ? StepStatus.IN_PROGRESS : StepStatus.PENDING,
      updatedAt: new Date().toISOString(),
      dueDate: generateDueDate(3, idx),
    })),
  },
  {
    id: 'p2',
    styleName: 'Heavyweight Hoodie',
    styleNumber: 'HD-99-BLU',
    buyerName: 'H&M',
    season: 'Winter 24',
    quantity: 12000,
    shipDate: '2024-11-20',
    currentStepIndex: 10,
    isUrgent: false,
    productImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
    techPackUrl: '#',
    workflow: WORKFLOW_STRUCTURE.map((step, idx) => ({
      id: step.id,
      label: step.label,
      status: idx < 10 ? StepStatus.COMPLETED : idx === 10 ? StepStatus.IN_PROGRESS : StepStatus.PENDING,
      updatedAt: new Date().toISOString(),
      dueDate: generateDueDate(10, idx),
    })),
  },
];
