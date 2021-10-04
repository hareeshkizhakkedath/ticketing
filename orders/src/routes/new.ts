import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import { NotFoundError, requireAuth, validateRequest, OrderStatus, BadRequestError } from '@hari-ticket/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticktes';
import { Order } from '../models/order';
const EXPIRATION_WINDOW_SECONDS = 15 * 60;
const router = express.Router();

router.post('/api/orders/:orderId', requireAuth, [
    body('ticketId')
        .not()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('ticketId must be valid')
], validateRequest,
    async (req: Request, res: Response) => {

        const { ticketId } = req.body
        //find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }
        //Make sure that this ticket is not already reserved
        //run querry to llok all orders, find an order where the ticket is the ticket we just found and status is not cancelled
        const isReserved = await ticket.isReserved()
        if (isReserved) {
            throw new BadRequestError('ticket is already reserved');
        }
        //calculate expiration date for this order

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        //build the order and save to database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        })
        await order.save();
        //publish an event that the order created
        res.status(201).send(order);
    })

export { router as newOrderRouter };