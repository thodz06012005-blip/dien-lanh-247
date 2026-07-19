import { NotificationsService } from './notifications.service';

function fixture(maxAttempts = 3, attempts = 0) {
  const row = {
    id: BigInt(11),
    channel: 'EMAIL' as const,
    recipient: 'fixture@example.test',
    subject: 'UAT fixture',
    templateKey: 'SERVICE_REQUEST_CREATED',
    payload: JSON.stringify({ code: 'DL247-UAT' }),
    attempts,
    maxAttempts,
    correlationId: 'phase11-fixture',
  };
  const execute = jest.fn().mockResolvedValue(1);
  const prisma = {
    $queryRawUnsafe: jest.fn().mockResolvedValue([row]),
    $executeRawUnsafe: execute,
  };
  const mail = {
    sendTemplated: jest.fn().mockRejectedValue(new Error('SMTP_PROVIDER_UNAVAILABLE')),
  };
  const templates = {
    render: jest.fn().mockReturnValue({ subject: 'UAT', text: 'UAT', html: '<p>UAT</p>' }),
  };
  return { service: new NotificationsService(prisma as never, mail as never, templates as never), execute };
}

describe('NotificationsService provider failure isolation', () => {
  it('keeps a failed delivery retryable without rolling back business data', async () => {
    const { service, execute } = fixture(3, 0);
    await service.processBatch();
    const failureUpdate = execute.mock.calls.find(([query]) =>
      String(query).includes("UPDATE NotificationOutbox SET status=?"),
    );
    expect(failureUpdate?.[1]).toBe('FAILED');
    expect(execute.mock.calls.some(([query]) => String(query).includes('IntegrationDeliveryLog'))).toBe(true);
  });

  it('moves the delivery to DEAD after the configured final attempt', async () => {
    const { service, execute } = fixture(1, 0);
    await service.processBatch();
    const failureUpdate = execute.mock.calls.find(([query]) =>
      String(query).includes("UPDATE NotificationOutbox SET status=?"),
    );
    expect(failureUpdate?.[1]).toBe('DEAD');
  });
});
