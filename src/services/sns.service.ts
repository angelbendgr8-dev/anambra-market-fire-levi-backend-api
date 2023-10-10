import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Client } from 'africastalking-ts';

const africastalking = new Client({
  apiKey: 'a6f6455b418dba6f09a5f8342e9b87476059640058592830d8925ebd691c2996',
  username: 'sandbox',
});

class SnsNotificationService {
  public async accountNumberAlert(name: string, mobile_number: string, account_number: string) {
    if (isEmpty(mobile_number)) throw new HttpException(400, "data can't be empty");

    try {
      const result = await africastalking.sendSms({
        to: '+2348130337697',
        message: `Hello there`,
        from: '60383',
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
}

export default SnsNotificationService;
