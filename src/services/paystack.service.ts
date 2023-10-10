import { PAYSTACK_API_KEY } from '@config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class PaystackService {
  private banks = 'https://api.paystack.co/dedicated_account/assign';
  private transferRecipient = 'https://api.paystack.co/transferrecipient';
  private transferEndpoint = 'https://api.paystack.co/transfer';
  private config = {
    headers: {
      Authorization: `Bearer ${PAYSTACK_API_KEY}`,
    },
  };

  public async sendMoney(data: any): Promise<boolean> {
    try {
      //find the bank, if the code is not sent from front end
      console.log(data);
      const bankdata = {
        first_name: data.first_name,
        email: data.email,
        // middle_name: 'Karen',
        last_name: data.last_name,
        phone: data.phoneNumber,
        preferred_bank: 'test-bank',
        country: 'NG',
      };
      const response = await axios.post(this.banks, bankdata, this.config);
      console.log(response);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default PaystackService;
