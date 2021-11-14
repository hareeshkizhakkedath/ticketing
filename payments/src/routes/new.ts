import express , {Request,Response}  from "express";
import { body } from "express-validator";
import { requireAuth , validateRequest , BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from "@hari-ticket/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const charge =await stripe.charges.create({
      currency:'INR',
      amount:order.price*100,
      source:token
    });
    const stripeId=charge.id

    const payment =Payment.build({
      orderId,
      stripeId
    })
    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId,
      stripeId
    });

    res.status(201).send({ id: payment.id });
  });

export { router as createChargeRouter };