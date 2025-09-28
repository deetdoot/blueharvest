import { MailService } from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private mailService: MailService | null;
  private fromEmail: string;
  private isEnabled: boolean;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn("SENDGRID_API_KEY environment variable not set - email notifications disabled");
      this.mailService = null;
      this.isEnabled = false;
    } else {
      this.mailService = new MailService();
      this.mailService.setApiKey(apiKey);
      this.isEnabled = true;
    }
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@agrowater.com';
  }

  async sendIrrigationAlert(farmerEmail: string, farmerName: string, cropName: string, waterAmount: number, recommendedTime: Date): Promise<boolean> {
    if (!this.isEnabled || !this.mailService) {
      console.log('Email service disabled - irrigation alert not sent');
      return false;
    }
    
    try {
      const timeString = recommendedTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🌱 Blue Harvest Irrigation Recommendation</h2>
          
          <p>Dear ${farmerName},</p>
          
          <p>Our AI-powered irrigation system has generated a new recommendation for your farm:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Irrigation Alert</h3>
            <p><strong>Crop:</strong> ${cropName}</p>
            <p><strong>Recommended Time:</strong> ${timeString}</p>
            <p><strong>Water Amount:</strong> ${waterAmount.toLocaleString()} gallons</p>
          </div>
          
          <p>This recommendation is based on current weather conditions, soil moisture levels, and your crop's growth stage.</p>
          
          <p>Please log into your Blue Harvest dashboard for more details and to schedule this irrigation.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            The Blue Harvest Team
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; color: #6b7280; font-size: 12px;">
            <p>This is an automated message from Blue Harvest. If you no longer wish to receive these alerts, please update your notification preferences in your dashboard.</p>
          </div>
        </div>
      `;

      const text = `
        Blue Harvest Irrigation Recommendation
        
        Dear ${farmerName},
        
        Our AI-powered irrigation system has generated a new recommendation for your farm:
        
        Crop: ${cropName}
        Recommended Time: ${timeString}
        Water Amount: ${waterAmount.toLocaleString()} gallons
        
        This recommendation is based on current weather conditions, soil moisture levels, and your crop's growth stage.
        
        Please log into your Blue Harvest dashboard for more details and to schedule this irrigation.
        
        Best regards,
        The Blue Harvest Team
      `;

      await this.mailService.send({
        to: farmerEmail,
        from: this.fromEmail,
        subject: `Irrigation Recommendation - ${cropName}`,
        text,
        html,
      });

      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendComplianceAlert(farmerEmail: string, farmerName: string, violationType: string, details: string): Promise<boolean> {
    if (!this.isEnabled || !this.mailService) {
      console.log('Email service disabled - compliance alert not sent');
      return false;
    }
    
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">⚠️ Water Compliance Alert</h2>
          
          <p>Dear ${farmerName},</p>
          
          <p>We need to alert you about a water usage compliance issue:</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">${violationType}</h3>
            <p>${details}</p>
          </div>
          
          <p>Please review your water usage and adjust your irrigation schedule accordingly. Contact your local water authority if you have questions about your allocation limits.</p>
          
          <p>Log into your Blue Harvest dashboard to view detailed compliance reports and recommendations.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            The Blue Harvest Team
          </p>
        </div>
      `;

      const text = `
        Water Compliance Alert
        
        Dear ${farmerName},
        
        We need to alert you about a water usage compliance issue:
        
        ${violationType}
        ${details}
        
        Please review your water usage and adjust your irrigation schedule accordingly.
        
        Log into your AgroWater dashboard for more details.
        
        Best regards,
        The AgroWater Team
      `;

      await this.mailService.send({
        to: farmerEmail,
        from: this.fromEmail,
        subject: `Water Compliance Alert - ${violationType}`,
        text,
        html,
      });

      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendWeatherAlert(farmerEmail: string, farmerName: string, alertType: string, message: string): Promise<boolean> {
    if (!this.isEnabled || !this.mailService) {
      console.log('Email service disabled - weather alert not sent');
      return false;
    }
    
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">🌦️ Weather Alert</h2>
          
          <p>Dear ${farmerName},</p>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
            <h3 style="color: #f59e0b; margin-top: 0;">${alertType}</h3>
            <p>${message}</p>
          </div>
          
          <p>This weather condition may affect your irrigation schedule. Please check your AgroWater dashboard for updated recommendations.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            The AgroWater Team
          </p>
        </div>
      `;

      await this.mailService.send({
        to: farmerEmail,
        from: this.fromEmail,
        subject: `Weather Alert - ${alertType}`,
        text: message,
        html,
      });

      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
}
