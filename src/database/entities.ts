import type { IDBRecord } from './storage';

export interface Project extends IDBRecord {
  /** Unique project identifier */
  id: string;
  /** Project display name */
  title: string;
  /** Project description */
  description: string;
  /** When the project was created */
  createdAt: number;
  /** When the project was last modified */
  updatedAt: number | null;
  /** Whether this is the default project */
  isDefault: boolean;
}
