const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error: 'Method not allowed'}); return; }

  const { email, fileName, fileBase64 } = req.body || {};
  if (!email || !fileName || !fileBase64) {
    res.status(400).json({error: '缺少参数: email, fileName, fileBase64'});
    return;
  }

  // 邮件配置（与月报系统一致）
  const EMAIL_CONFIG = {
    sender: '4694101@qq.com',
    smtp: { host: 'smtp.qq.com', port: 465, secure: true }
  };
  const AUTH_CODE = process.env.QQ_EMAIL_AUTH_CODE || 'rqnssxvvblqibibf';

  try {
    const transporter = nodemailer.createTransport({
      ...EMAIL_CONFIG.smtp,
      auth: { user: EMAIL_CONFIG.sender, pass: AUTH_CODE }
    });

    await transporter.sendMail({
      from: `华东政策日报系统 <${EMAIL_CONFIG.sender}>`,
      to: email,
      subject: `华东政务信息月报 - ${fileName.replace('.xlsx', '')}`,
      text: `请查收附件：${fileName}\n\n由华东区域政策日报系统自动生成并发送。`,
      attachments: [{
        filename: fileName,
        content: Buffer.from(fileBase64, 'base64'),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }]
    });

    res.status(200).json({ success: true, emailTo: email });
  } catch (err) {
    res.status(500).json({ error: '邮件发送失败: ' + err.message });
  }
};
