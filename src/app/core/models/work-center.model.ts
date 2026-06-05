import { NaoDocument } from './document.model';

export interface WorkCenterData {
  name: string;
}

export type WorkCenterDocument = NaoDocument<'workCenter', WorkCenterData>;
