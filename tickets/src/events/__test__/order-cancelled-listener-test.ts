import mongooose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { orderCancelledListener } from '../listeners/order-cancelled-liistener'
import { Ticket } from '../../models/ticket'
import { OrderCancelledEvent } from '@hari-ticket/common'
import {Message} from 'node-nats-streaming'

const setup= async()=>{
    const listener= new orderCancelledListener(natsWrapper.client);

    const orderId=new mongooose.Types.ObjectId().toHexString();
    const ticket=Ticket.build({
        title:'concert',
        price:20,
        userId:'fuh'
    })

    ticket.set({orderId});
    await ticket.save();

    const data:OrderCancelledEvent['data']={
        id:orderId,
        version:0,
        ticket:{
            id:ticket.id
        }
    }
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    };
    return {msg, data, ticket, orderId,listener};
}

it('udate, publish and ack msg',async()=>{
    const {msg, data, ticket, orderId,listener}=await setup();

    await listener.onMessage(data,msg);

    const updatedTicket=await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});