import type { IDBRecord } from './storage';

export interface Project extends IDBRecord {
  /** Unique project identifier */
  id: string;
  /** Project display name */
  name: string;
  /** Project description */
  description: string;
  /** When the project was created */
  createdAt: number;
  /** When the project was last modified */
  updatedAt: number | null;
  /** Whether this is the default project */
  isDefault: boolean;
  /** Whether this project is archived */
  isArchived: boolean;
}

export interface ProjectFormData {
  title: string;
  description: string;
}
