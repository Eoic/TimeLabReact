import type { IDBRecord } from '../storage';

export interface Project extends IDBRecord {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number | null;
  isSelected: boolean;
}
