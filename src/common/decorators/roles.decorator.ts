import { SetMetadata } from '@nestjs/common';
import { ROLE_METADATA_KEY, UserRole } from '../constants/roles.constant';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_METADATA_KEY, roles);
