import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InstitutionsService } from '../institutions/institutions.service';
import { CredentialsService } from './credentials.service';
import { NotificationsService } from '../notifications/notifications.service';

interface BulkIssuePayload {
  institutionId: string;
  credentials: any[];
}

@Processor('credentials')
export class BulkIssueProcessor {
  constructor(
    private institutionsService: InstitutionsService,
    private credentialsService: CredentialsService,
    private notificationsService: NotificationsService,
  ) {}

  @Process('bulk-issue')
  async handleBulkIssue(job: Job<BulkIssuePayload>) {
    const { institutionId, credentials } = job.data;
    const institution = await this.institutionsService.findById(institutionId);
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (let i = 0; i < credentials.length; i++) {
      try {
        await this.credentialsService.issueCredential(institution, credentials[i]);
        results.success++;
        await job.progress(Math.floor(((i + 1) / credentials.length) * 100));
      } catch (err) {
        results.failed++;
        results.errors.push({
          index: i,
          studentId: credentials[i].studentId,
          error: err.message,
        });
      }
    }

    await this.notificationsService.sendBulkIssueReport(institution, results);
    return results;
  }
}
