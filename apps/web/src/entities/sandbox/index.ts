export { getSandbox, sandboxKeys } from './api';

import type { ApiResponseData } from '@/shared/api/api-types';

export type SandboxCard = ApiResponseData<'getSandbox', 200>['cards'][number];
