import { Injectable } from '@nestjs/common';
import { OperationsService } from '../operations/operations.service';

/**
 * Compatibility endpoint for older admin clients. The canonical dashboard
 * contract now comes from service operations and never touches commerce data.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly operations: OperationsService) {}

  async getDashboardStats() {
    return {
      mode: 'service-only',
      contractVersion: 'service-only-v1',
      ...(await this.operations.overview()),
    };
  }
}
