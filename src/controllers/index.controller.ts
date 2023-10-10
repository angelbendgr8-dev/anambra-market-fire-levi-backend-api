import { Market } from '@/interfaces/users.interface';
import transactionModel from '@/models/transaction.model';
import userModel from '@/models/users.model';
import webHookModel from '@/models/webHook.model';
import PaystackService from '@/services/paystack.service';
import SnsNotificationService from '@/services/sns.service';
import { NextFunction, Request, Response, response } from 'express';
const markets = require('../utils/markets.json');

class IndexController {
  public paystackService = new PaystackService();
  public snsService = new SnsNotificationService();
  public index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, serviceCode, phoneNumber, text } = req.body;
      console.log(sessionId);
      console.log('####################', req.body);
      const information = {
        phoneNumber,
      };
      const user = await userModel.findOne({ phoneNumber });
      let response = '';
      if (!user) {
        if (text === '') {
          // This is the first request. Note how we start the response with CON
          console.log('here');
          response = `CON Enter your business name`;
        } else {
          await userModel.create({ ...information, name: text });
          console.log(markets);
          response = `CON What is the First Letter of your market name
              1. A B C D
              2. E F G H
              3. I J K L
              4. M N O P
              5. Q R S T
              6. U V W X
              7. Y Z
          `;
        }
      } else {
        if (user && !user.market) {
          if (user.tempMarket) {
            const user = await userModel.findOne({ phoneNumber });
            if (text.at(-1) === '1') {
              user.market = user.tempMarket;
              user.save();
              response = `CON Enter Your shop Number`;
            } else {
              user.tempMarket = null;
              user.save();
              response = `END We could not complete you firelevi profile set up please try again`;
            }
          } else {
            const values = text.split('*');
            console.log(values);

            if (text === '') {
              response = `CON What is the First Letter of your market name
              1. A B C D
              2. E F G H
              3. I J K L
              4. M N O P
              5. Q R S T
              6. U V W X
              7. Y Z
          `;
            } else if (values[0].length > 3) {
              console.log('string');
              response = await this.handleUserMarketSelection(text, 1, phoneNumber, values);
            } else {
              console.log('response');
              response = await this.handleUserMarketSelection(text, 0, phoneNumber, values);
            }
          }
        } else if (user && !user.shopNumber) {
          const user = await userModel.findOne({ phoneNumber });
          if (text === '') {
            response = `CON Welcome Back, ${user.name}
              Please Enter Your shop Number
            `;
          } else {
            const values = text.split('*');
            console.log(values);
            user.shopNumber = values.at(-1);
            user.save();
            const name = user.name.split(' ');
            const data = {
              phoneNumber: user.phoneNumber,
              first_name: name[0],
              last_name: name.length > 1 ? name[1] : name[0],
              email: `info@${user.name.replace(/[^a-zA-Z]/g, '').toLocaleLowerCase()}.com`,
            };
            await this.paystackService.sendMoney(data);
            response = `END Congratulations! Your registration was successful
              Your account is still being processed. You'll receive an SMS once completed.
            `;
          }
        } else {
          const user = await userModel.findOne({ phoneNumber });
          if (user.accountNumber) {
            // await this.snsService.accountNumberAlert(user.name, user.phoneNumber, user.accountNumber);
            response = `
             END Hello ${user.name}, your account number is ${user.accountNumber}
            `;
          } else {
            response = `END Hello ${user.name}, your account is still being proccessed,
            You'll receive an SMS once completed
            `;
          }
        }
      }

      // Print the response onto the page so that our SDK can read it
      res.set('Content-Type: text/plain');
      res.send(response);
      // DONE!!!
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public proccessMarket = (market: Array<Market>) => {
    let response: any = market.map((item, index) => {
      if (index < 8) {
        return `${index + 1} ${item.Market}
        `;
      }
    });
    // console.log(response.toString().split(','));
    if (response.length < 1 || response.length < 8) {
      response = `CON Select your market name
          ${response.toString().replaceAll(',', '')} 0. Go back
      `;
    } else {
      response = `CON Select your market name
          ${response.toString().replaceAll(',', '')} 99. Next
          0. Go back
      `;
    }
    return response;
  };
  public getMarketSection = async (markSection: Array<Market>, length: number, currentInput: string, values: Array<String>, phoneNumber: string) => {
    let response;
    if (currentInput === '99' || currentInput === '0') {
      const step = values.filter(item => item === '0').length;
      length = length - step * 2;
      console.log(length);

      markSection = this.processSelection(markSection, length);
      response = this.proccessMarket(markSection);
    } else {
      const step = values.filter(item => item === '0').length;

      length = length - step * 2;

      markSection = this.processSelection(markSection, length - 1);
      const user = await userModel.findOne({ phoneNumber });
      user.tempMarket = markSection[Number(currentInput) - 1].Market as unknown as string;
      user.location = markSection[Number(currentInput) - 1].Location;
      user.save();
      response = `CON Confirm that your  market is ${markSection[Number(currentInput) - 1].Market}
      1. Confirm
      2. Cancel
      `;
      return response;
    }
    return response;
  };
  public processSelection = (markSection: Array<Market>, length: number) => {
    let response;
    if (markSection.length > length * 8) {
      response = markSection.slice(8 * (length - 1), 8 * length);
    } else {
      response = markSection.slice(8 * (length - 1));
    }
    return response;
  };

  public handleUserMarketSelection = async (text, offset, phoneNumber, values) => {
    let response;
    if (values[offset] === '1') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'A' || item.Market[0] === 'B' || item.Market[0] === 'C' || item.Market[0] === 'D');
      // console.log(markSection);
      console.log(offset);
      if ((offset === 0 && values[offset] === '1' && values.length <= 1) || (offset === 1 && values[offset] === '1' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    } else if (values[offset] === '2') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'E' || item.Market[0] === 'F' || item.Market[0] === 'G' || item.Market[0] === 'H');
      // console.log(markSection);
      console.log(markSection.length);
      if ((offset === 0 && values[offset] === '2' && values.length <= 1) || (offset === 1 && values[offset] === '2' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    } else if (values[offset] === '3') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'I' || item.Market[0] === 'J' || item.Market[0] === 'K' || item.Market[0] === 'L');
      // console.log(markSection);
      console.log(markSection.length);
      if ((offset === 0 && values[offset] === '3' && values.length <= 1) || (offset === 1 && values[offset] === '3' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    } else if (values[offset] === '4') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'M' || item.Market[0] === 'N' || item.Market[0] === 'O' || item.Market[0] === 'P');
      // console.log(markSection);
      console.log(markSection.length);
      if ((offset === 0 && values[offset] === '4' && values.length <= 1) || (offset === 1 && values[offset] === '4' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    } else if (values[offset] === '5') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'Q' || item.Market[0] === 'R' || item.Market[0] === 'S' || item.Market[0] === 'T');
      // console.log(markSection);
      console.log(markSection.length);
      if ((offset === 0 && values[offset] === '5' && values.length <= 1) || (offset === 1 && values[offset] === '5' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    } else if (values[offset] === '6') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'U' || item.Market[0] === 'V' || item.Market[0] === 'W' || item.Market[0] === 'X');
      // console.log(markSection);
      console.log(markSection.length);
      if ((offset === 0 && values[offset] === '6' && values.length <= 1) || (offset === 1 && values[offset] === '6' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    } else if (values[offset] === '7') {
      const marks = markets.map(item => item);
      // const marketStrings = marks
      let markSection = marks.filter(item => item.Market[0] === 'Y' || item.Market[0] === 'Z');
      // console.log(markSection);
      console.log(markSection.length);
      if ((offset === 0 && values[offset] === '7' && values.length <= 1) || (offset === 1 && values[offset] === '7' && values.length <= 2)) {
        markSection = markSection.slice(0, 8);
        response = this.proccessMarket(markSection);
      } else {
        values = values.slice(offset);
        console.log(offset);
        console.log(values);
        const currentInput = values.at(-1).toString();
        const length = values.length;
        console.log(currentInput);
        response = await this.getMarketSection(markSection, length, currentInput, values, phoneNumber);
      }
    }
    return response;
  };

  public webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
    await webHookModel.create({ activities: req.body });
    const { event, data } = req.body;
    if (event === 'dedicatedaccount.assign.success') {
      const { customer, dedicated_account } = data;
      const user = await userModel.findOne({ phoneNumber: customer.phone });
      user.accountNumber = dedicated_account.account_number;
      user.bankName = dedicated_account.bank.name;
      user.accountName = dedicated_account.account_name;
      user.save();
      this.snsService.accountNumberAlert(user.name, user.phoneNumber, user.accountNumber);
    }
    if (event === 'charge.success') {
      const { customer, amount } = data;
      const user = await userModel.findOne({ phoneNumber: customer.phone });
      if (user) {
        transactionModel.create({
          userId: user._id,
          market: user.market,
          location: user.location,
          amount: amount / 100,
        });

        user.payments.push({
          amount: amount / 100,
          date: new Date(),
        });

        user.save();
      }
    }
    res.send(200);
  };
}

export default IndexController;
