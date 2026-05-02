import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Credential } from '../credentials/entities/credential.entity';
import { Institution } from '../institutions/entities/institution.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: config.get('SENDGRID_API_KEY'),
      },
    });
  }

  async notifyCredentialIssued(credential: Credential, email: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'noreply@certchain.africa',
        to: email,
        subject: `Your credential has been issued — ${credential.title}`,
        html: `
          <h2>Congratulations, ${credential.graduateName}!</h2>
          <p>Your <strong>${credential.title}</strong> credential has been issued on the Stellar blockchain.</p>
          <p>View and share your credential: 
            <a href="${this.config.get('FRONTEND_URL')}/verify/${credential.stellarCredentialId}">
              certchain.africa/verify/${credential.stellarCredentialId}
            </a>
          </p>
        `,
      });
    } catch (err) {
      this.logger.error(`Failed to send credential notification: ${err.message}`);
    }
  }

  async sendBulkIssueReport(
    institution: Institution,
    results: { success: number; failed: number; errors: any[] },
  ): Promise<void> {
    this.logger.log(
      `Bulk issue complete for ${institution.name}: ${results.success} success, ${results.failed} failed`,
    );
  }
}
