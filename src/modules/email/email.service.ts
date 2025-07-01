import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailNewMentorDto } from './dto/sent-email-mentor.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendActivationEmail(fullName: string, email: string, token: string): Promise<void> {
    const activationLink = `${this.configService.get('FE_APP_URL')}/login?activateToken=${token}`;

    const template = this.generateEmailActivateTemplate(fullName, activationLink);
    await this.sendEmail(email, 'Kích hoạt tài khoản DevPlus', template);
  }

  async sendForgotPasswordEmail(fullName: string, email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get('FE_APP_URL')}/reset-password?token=${token}`;

    const template = this.generateEmailForgotPasswordTemplate(fullName, resetLink);
    await this.sendEmail(email, 'Quên Mật khẩu', template);
  }

  async sendEmailNewMentor(emailContent: SendEmailNewMentorDto): Promise<void> {
    const activationLink = `${this.configService.get('FE_APP_URL_ADMIN')}/mentor-activation/${emailContent.token}`;

    const template = this.generateMentorAccountEmailTemplate(
      emailContent.fullName,
      activationLink,
      emailContent.password
    );
    await this.sendEmail(emailContent.email, 'Kích hoạt tài khoản Mentor DevPlus', template);
  }

  async sendEmailActivateMentorAccount(emailContent: SendEmailNewMentorDto): Promise<void> {
    const loginLink = `${this.configService.get('FE_APP_URL_ADMIN')}/login`;

    const template = this.activateMentorAccountEmailTemplate(emailContent.fullName, loginLink);
    await this.sendEmail(emailContent.email, 'Tài khoản Mentor của bạn đã được kích hoạt', template);
  }

  async sendEmailDeactivateMentorAccount(emailContent: SendEmailNewMentorDto): Promise<void> {
    const template = this.deactivateMentorAccountEmailTemplate(emailContent.fullName);
    await this.sendEmail(emailContent.email, 'Tài khoản Mentor của bạn đã bị vô hiệu hóa', template);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  private generateEmailForgotPasswordTemplate(fullName: string, activationLink: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Kích hoạt tài khoản của bạn</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { width: 100%; max-width: 660px; margin: 20px auto; background-color: #ffffff; border: 1px solid #d1d1d1; border-radius: 12px; }
            .header { background-color:rgb(0, 48, 109); color: #ffffff; text-align: center; padding: 15px; border-radius: 8px 8px 0 0; font-size: 20px; font-weight: bold; }
            .content { text-align: center; margin: 20px 0; }
            .btn { display: inline-block; background-color: #4285f4; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
            .footer { margin-top: 20px; text-align: center; font-size: 14px; color: #555555; border-top: 1px solid rgb(199, 198, 198); padding: 20px 10px; margin-left: 20px; margin-right: 20px; }
            p {color: #000000 !important; font-size: 18px !important; margin: 10px 0 !important; }
            .hello { font-size: 18px; font-weight: bold; color:rgb(0, 0, 0); margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Đặt lại mật khẩu</div>
            <div class="content">
              <div class="hello">Xin chào ${fullName}</div>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p>Đừng lo, hãy nhấn vào nút bên dưới để tạo mật khẩu mới nhé!</p>
              <a href="${activationLink}" class="btn">Đặt lại mật khẩu</a>
              <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
              <br>
              <p>Chúng tôi luôn sẵn sàng lắng nghe yêu cầu hỗ trợ của bạn!
              <p>Thân ái,<br>Đội ngũ DevPlus</p>
            </div>
            <div class="footer">© ${new Date().getFullYear()} DevPlus. All rights reserved.</div>
          </div>
        </body>
        </html>
      `;
  }

  private generateEmailActivateTemplate(fullName: string, activationLink: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Kích hoạt tài khoản của bạn</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { width: 100%; max-width: 660px; margin: 20px auto; background-color: #ffffff; border: 1px solid #d1d1d1; border-radius: 12px; }
            .header { background-color:rgb(0, 48, 109); color: #ffffff; text-align: center; padding: 15px; border-radius: 8px 8px 0 0; font-size: 20px; font-weight: bold; }
            .content { text-align: center; margin: 20px 0; }
            .btn { display: inline-block; background-color: #4285f4; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
            .footer { margin-top: 20px; text-align: center; font-size: 14px; color: #555555; border-top: 1px solid rgb(199, 198, 198); padding: 20px 10px; margin-left: 20px; margin-right: 20px; }
            p {color: #000000 !important; font-size: 18px !important; margin: 10px 0 !important; }
            .hello { font-size: 18px; font-weight: bold; color:rgb(0, 0, 0); margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Kích hoạt tài khoản của bạn</div>
            <div class="content">
              <div class="hello">Xin chào ${fullName}</div>
              <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
              <p>Chỉ còn một bước nhỏ nữa thôi để bắt đầu trải nghiệm:</p>
              <p>Hãy xác nhận email của bạn bằng cách nhấn vào nút bên dưới nhé!</p>
              <a href="${activationLink}" class="btn">Kích hoạt tài khoản</a>
              <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
              <p>Nếu bạn không phải là người đăng ký, xin vui lòng bỏ qua email này.</p>
              <p>Chúng tôi rất mong chờ được đồng hành cùng bạn!<br>
              Nếu cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.</p>
              <p>Thân ái,<br>Đội ngũ DevPlus</p>
            </div>
            <div class="footer">© ${new Date().getFullYear()} DevPlus. All rights reserved.</div>
          </div>
        </body>
        </html>
      `;
  }

  private generateMentorAccountEmailTemplate(fullName: string, loginLink: string, password: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Kích hoạt tài khoản mentor</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 660px; margin: 20px auto; background-color: #ffffff; border: 1px solid #d1d1d1; border-radius: 12px; }
        .header { background-color: rgb(0, 48, 109); color: #ffffff; text-align: center; padding: 15px; border-radius: 8px 8px 0 0; font-size: 20px; font-weight: bold; }
        .content { text-align: center; margin: 20px 0; }
        .btn { display: inline-block; background-color: #4285f4; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; font-size: 14px; color: #555555; border-top: 1px solid rgb(199, 198, 198); padding: 20px 10px; margin-left: 20px; margin-right: 20px; }
        p { color: #000000 !important; font-size: 18px !important; margin: 10px 0 !important; }
        .hello { font-size: 18px; font-weight: bold; color: rgb(0, 0, 0); margin-top: 10px; }
        .highlight { font-weight: bold; background-color: #f0f0f0; padding: 5px 10px; border-radius: 5px; display: inline-block; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Thông tin tài khoản Mentor của bạn</div>
        <div class="content">
          <div class="hello">Xin chào ${fullName},</div>
          <p>Bạn đã được mời tham gia nền tảng của chúng tôi với vai trò <strong>Mentor</strong>.</p>       
          <p>Để bảo mật, vui lòng kích hoạt tài khoản để đăng nhập và đổi mật khẩu.</p>
          <a href="${loginLink}" class="btn">Kích hoạt tài khoản</a>
          <p>Đây là mật khẩu tạm thời để đăng nhập:</p>
          <p class="highlight">${password}</p>
          <p>Nếu bạn không mong đợi email này, vui lòng bỏ qua hoặc liên hệ với chúng tôi.</p>
          <p>Chúng tôi rất mong được hợp tác cùng bạn!<br>Trân trọng,<br>Đội ngũ DevPlus</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} DevPlus. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
  }

  private activateMentorAccountEmailTemplate(fullName: string, loginLink: string): string {
    return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>Tài khoản Mentor đã được kích hoạt</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 20px;
        color: #333333;
      }
      .email-wrapper {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
        padding: 30px;
      }
      h2 {
        color: #002f6c;
        font-size: 22px;
        margin-bottom: 20px;
        text-align: center;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .btn {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #888888;
        margin-top: 30px;
        border-top: 1px solid #e0e0e0;
        padding-top: 15px;
      }
      .highlight {
        font-weight: bold;
        color: #002f6c;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <h2>Tài khoản Mentor của bạn đã được kích hoạt</h2>
      <p>Chào <span class="highlight">${fullName}</span>,</p>
      <p>Chúc mừng! Tài khoản mentor của bạn trên nền tảng <strong>AI Competency</strong> đã được kích hoạt thành công.</p>
      <p>Bạn có thể đăng nhập và bắt đầu kết nối với các mentee ngay bây giờ.</p>
      <p style="text-align: center;">
        <a href="${loginLink}" class="btn">Đăng nhập ngay</a>
      </p>
      <p>Nếu bạn cần hỗ trợ hoặc có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email: <strong>hello@devplus.edu.vn</strong></p>
      <p>Chúng tôi rất vui khi có bạn đồng hành trong hành trình chia sẻ và truyền cảm hứng!</p>
      <p>Trân trọng,<br>Đội ngũ DevPlus</p>

      <div class="footer">
        © ${new Date().getFullYear()} DevPlus. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
  }

  private deactivateMentorAccountEmailTemplate(fullName: string): string {
    return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>Tài khoản Mentor đã bị vô hiệu hóa</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 20px;
        color: #333333;
      }
      .email-wrapper {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
        padding: 30px;
      }
      h2 {
        color: #002f6c;
        font-size: 22px;
        margin-bottom: 20px;
        text-align: center;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #888888;
        margin-top: 30px;
        border-top: 1px solid #e0e0e0;
        padding-top: 15px;
      }
      .highlight {
        font-weight: bold;
        color: #002f6c;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <h2>Tài khoản Mentor đã bị vô hiệu hóa</h2>
      <p>Chào <span class="highlight">${fullName}</span>,</p>
      <p>Chúng tôi xin thông báo rằng tài khoản Mentor của bạn trên nền tảng <strong>AI Competency</strong> đã bị vô hiệu hóa. Hiện tại bạn sẽ không thể đăng nhập hoặc sử dụng các tính năng của hệ thống.</p>
      <p>Nếu bạn cho rằng đây là sự nhầm lẫn hoặc có thắc mắc về hành động này, vui lòng liên hệ với chúng tôi qua email: <strong>hello@devplus.edu.vn</strong>.</p>
      <p>Chúng tôi rất trân trọng những đóng góp của bạn trong thời gian qua và mong sẽ có cơ hội hợp tác trong tương lai.</p>
      <p>Trân trọng,<br>Đội ngũ DevPlus</p>

      <div class="footer">
        © ${new Date().getFullYear()} DevPlus. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
  }
}
