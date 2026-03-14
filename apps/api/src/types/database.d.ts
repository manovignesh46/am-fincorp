declare module '@am-fincorp/database' {
  import { Sequelize, Model, ModelStatic } from 'sequelize';

  export const sequelize: Sequelize;
  export const User: ModelStatic<Model>;
  export const Member: ModelStatic<Model>;
  export const ChitFundTemplate: ModelStatic<Model>;
  export const ChitFund: ModelStatic<Model>;
  export const ChitFundEnrollment: ModelStatic<Model>;
  export const Transaction: ModelStatic<Model>;
  export const Contribution: ModelStatic<Model>;
  export const Auction: ModelStatic<Model>;
  export const Loan: ModelStatic<Model>;
  export const Repayment: ModelStatic<Model>;
  export const PaymentSchedule: ModelStatic<Model>;
}
