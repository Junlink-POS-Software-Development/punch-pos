import { Customer } from "../../../lib/types";

export interface FolderType {
  [key: string]: any; // Make it compatible with Json type
  id: string;
  name: string;
  filePaths: string[];
}

export interface DocumentGalleryProps {
  customer: Customer;
}

export interface OptimisticFile {
  id: string;
  url: string;
  name: string;
  finalUrl?: string;
}
