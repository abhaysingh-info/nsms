import { createTransport } from 'nodemailer';

export default async function (sendOptions: {
  to: string;
  subject: string;
  body?: string;
  html?: string;
}) {
  let transporter = createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: '',
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: sendOptions.to, // list of receivers
    subject: sendOptions.subject, // Subject line
    text: sendOptions.body, // plain text body
    html: sendOptions.html, // html body
  });

  return info;
}
