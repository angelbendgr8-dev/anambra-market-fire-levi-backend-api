import AWS from 'aws-sdk';

import { CreateTemplateCommand, GetTemplateCommand, SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses';

const REGION = 'us-east-2';

AWS.config.update({ region: REGION });
// Set the AWS Region.
const sesClient = new SESClient({ region: REGION });
class SesMailService {
  public aws = AWS;
  public sesClient = sesClient;

  public async sendMail(): Promise<void> {
    const params = {
      Destination: {
        /* required */
        ToAddresses: [
          'teemealeheen@gmail.com',
          /* more items */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: 'UTF-8',
            Data: 'HTML_FORMAT_BODY',
          },
          Text: {
            Charset: 'UTF-8',
            Data: 'TEXT_FORMAT_BODY',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Test email',
        },
      },
      Source: ' devops@gilah.io' /* required */,
      ReplyToAddresses: [
        'noreply@gilah.io',
        /* more items */
      ],
    };

    // Create the promise and SES service object
    const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    sendPromise
      .then(function (data) {
        console.log(data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  }

  public async sendTemplatedEmail(templateName: string, options: { email: string; username: string; otp_code?: string; link?: string }) {
    const createTemplateCommand = new SendTemplatedEmailCommand({
      Destination: { ToAddresses: [options.email] },
      TemplateData: JSON.stringify({ credentials: { firstName: options.username, opt_code: options.otp_code } }),
      Source: 'devops@gilah.io',
      Template: templateName,
    });
    const createTemplateCommand2 = new SendTemplatedEmailCommand({
      Destination: { ToAddresses: [options.email] },
      TemplateData: JSON.stringify({ credentials: { firstName: options.username, link: options.link } }),
      Source: 'devops@gilah.io',
      Template: templateName,
    });
    try {
      if (options?.otp_code) {
        return await sesClient.send(createTemplateCommand);
      } else {
        return await sesClient.send(createTemplateCommand2);
      }
    } catch (err) {
      console.log('Failed to create template.', err);
      return err;
    }
  }
  public async getTemplate(templateName: string) {
    const getTemplateCommand = new GetTemplateCommand({ TemplateName: templateName });
    try {
      const response = await sesClient.send(getTemplateCommand);
      console.log(response);
    } catch (err) {
      console.log('Failed to get email template.', err);
      return err;
    }
  }
}

export default SesMailService;
