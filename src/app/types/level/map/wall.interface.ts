import { Area } from './area.interface';

export interface Wall extends Area {
  noStartBlock?: boolean;
  noEndBlock?: boolean;
}