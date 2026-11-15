import net from 'net';
import tls from 'tls';
import dotenv from 'dotenv';

dotenv.config();

const {
  EMAIL_HOST = '',
  EMAIL_PORT = 587,
  EMAIL_USER = '',
  EMAIL_PASSWORD = '',
  EMAIL_FROM = 'no-reply@arh-academic.edu'
} = process.env;

// Secure in-memory delivery queue for integration tests and local development
// Avoids printing raw tokens to application logs while keeping tests and local workflow verifiable
const deliveryQueue = [];

/**
 * Enterprise Native SMTP Client and Email Dispatcher
 * Adheres strictly to security requirements:
 * - Credentials loaded exclusively from environment variables
 * - Tokens are NEVER printed to application logs
 * - Dual mode: Live SMTP socket communication or secure test queue
 */
export const emailService = {
  isConfigured() {
    return Boolean(EMAIL_HOST && EMAIL_USER && EMAIL_PASSWORD);
  },

  /**
   * Dispatches faculty verification link
   * @param {Object} options
   * @param {string} options.to - Recipient faculty email
   * @param {string} options.name - Faculty name or title
   * @param {string} options.verificationUrl - Full verification link
   * @param {string} options.token - Raw verification token (passed only to payload, never logged)
   */
  async sendFacultyVerificationEmail({ to, name = 'Faculty Member', verificationUrl, token }) {
    const subject = 'Institutional Verification: Complete Your Faculty Account Registration';
    const textBody = `Dear ${name},\n\nYou have been pre-authorized to join the Academic Resource Sharing Hub (ARH) as a verified faculty member.\n\nPlease verify your collegiate email and complete your account setup by opening the following link in your browser:\n\n${verificationUrl}\n\nNote: This single-use link will expire in 24 hours.\n\nIf you did not initiate this request, please report it immediately to your academic department chair.\n\nInstitutional Academic Registrar & IT Governance\nAcademic Resource Sharing Hub`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">Academic Resource Sharing Hub</h2>
        </div>
        <p style="font-size: 14px; color: #334155;">Dear ${name},</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          Your official college email has been verified against the institutional faculty allowlist. To finalize your account and access the <strong>Faculty Curricular Governance Portal</strong>, please click the secure button below:
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Verify Faculty Email & Set Password
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
          Direct link: <a href="${verificationUrl}" style="color: #4f46e5;">${verificationUrl}</a>
        </p>
        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
          Security Notice: This link is single-use and valid for 24 hours. Verification tokens are cryptographically hashed and never stored in plain text.
        </p>
      </div>
    `;

    // Save in delivery queue for test verification without leaking token to logs
    const record = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      to,
      subject,
      token,
      verificationUrl,
      timestamp: new Date().toISOString()
    };
    deliveryQueue.unshift(record);

    // Keep queue trimmed
    if (deliveryQueue.length > 50) deliveryQueue.pop();

    if (this.isConfigured()) {
      return this._sendViaSmtp({
        to,
        from: EMAIL_FROM,
        subject,
        text: textBody,
        html: htmlBody
      });
    }

    // In dev / test mode: abstract log without revealing token
    console.log(`[EmailService] Verification dispatch queued for ${to} (Subject: ${subject})`);
    return { success: true, messageId: record.id, queued: true };
  },

  /**
   * Internal pure-socket SMTP client for live mail servers
   */
  async _sendViaSmtp({ to, from, subject, text, html }) {
    const port = Number(EMAIL_PORT) || 587;
    const host = EMAIL_HOST;

    return new Promise((resolve, reject) => {
      let socket;
      const isSecure = port === 465;

      const connectOpts = { host, port };

      if (isSecure) {
        socket = tls.connect(connectOpts);
      } else {
        socket = net.connect(connectOpts);
      }

      let step = 0;
      let buffer = '';

      const sendCommand = (cmd) => {
        socket.write(cmd + '\r\n');
      };

      socket.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\r\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          const code = parseInt(line.substring(0, 3));
          if (isNaN(code)) continue;

          // Process SMTP state machine
          if (step === 0 && (code === 220)) {
            step++;
            sendCommand(`EHLO arh.local`);
          } else if (step === 1 && (code === 250)) {
            step++;
            sendCommand(`AUTH LOGIN`);
          } else if (step === 2 && (code === 334)) {
            step++;
            sendCommand(Buffer.from(EMAIL_USER).toString('base64'));
          } else if (step === 3 && (code === 334)) {
            step++;
            sendCommand(Buffer.from(EMAIL_PASSWORD).toString('base64'));
          } else if (step === 4 && (code === 235)) {
            step++;
            sendCommand(`MAIL FROM:<${from}>`);
          } else if (step === 5 && (code === 250)) {
            step++;
            sendCommand(`RCPT TO:<${to}>`);
          } else if (step === 6 && (code === 250)) {
            step++;
            sendCommand(`DATA`);
          } else if (step === 7 && (code === 354)) {
            step++;
            const boundary = '----=_Part_' + Date.now();
            const message = [
              `From: <${from}>`,
              `To: <${to}>`,
              `Subject: ${subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: multipart/alternative; boundary="${boundary}"`,
              ``,
              `--${boundary}`,
              `Content-Type: text/plain; charset=utf-8`,
              ``,
              text,
              ``,
              `--${boundary}`,
              `Content-Type: text/html; charset=utf-8`,
              ``,
              html,
              ``,
              `--${boundary}--`,
              `.`
            ].join('\r\n');
            sendCommand(message);
          } else if (step === 8 && (code === 250)) {
            step++;
            sendCommand(`QUIT`);
            resolve({ success: true, message: 'Email sent successfully via SMTP.' });
          } else if (code >= 400) {
            socket.destroy();
            reject(new Error(`SMTP Error ${code}: ${line}`));
            return;
          }
        }
      });

      socket.on('error', (err) => {
        reject(err);
      });

      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error('SMTP connection timed out after 10000ms.'));
      });
    });
  },

  /**
   * Helper for tests to inspect the latest verification record for an email
   * (Does not leak raw tokens into console logs)
   */
  getLatestVerificationForEmail(email) {
    const clean = (email || '').toLowerCase().trim();
    return deliveryQueue.find(m => m.to.toLowerCase() === clean) || null;
  },

  clearQueue() {
    deliveryQueue.length = 0;
  }
};
