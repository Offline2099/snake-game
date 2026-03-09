import { PortalType } from './portal-type.enum';

export const PORTAL_BLOCK_NAME: Record<PortalType, string> = {
  [PortalType.entrance]: 'Entrance',
  [PortalType.exit]: 'Exit'
}