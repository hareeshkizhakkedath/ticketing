import mongoose from 'mongoose'


//we are relating payment , charge and orders
interface PaymentAttrs{
    orderId:String;
    stripeId:String;
}

interface PaymentDoc extends mongoose.Document{
    orderId:String;
    stripeId:String;
}

interface PaymentModel extends mongoose.Model<PaymentDoc>{
    build(attrs:PaymentAttrs):PaymentDoc
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
