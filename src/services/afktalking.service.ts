import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Client } from 'africastalking-ts';

const africastalking = new Client({
  apiKey: 'd7e26fb48d3504f658d10a0c23fdb0fea6373986a5343fb2406df1c931526bb0',
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
