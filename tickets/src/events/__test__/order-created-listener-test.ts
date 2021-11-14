import { OrderCreatedListener } from "../listeners/order-created-listener"
import { natsWrapper } from "../../nats-wrapper"
import { Ticket } from "../../models/ticket";
import { OrderCreatedEvent } from "@hari-ticket/common";
import mongoose from 'mongoose'
import { OrderStatus } from "@hari-ticket/common";
import Message from 'node-nats-streaming';
const setup = async()=>{
    //create instance of listener
    const listener= new OrderCreatedListener(natsWrapper.client);

    //create and save ticket
    const ticket= Ticket.build({
        title:"concert",
        price:20,
        userId:"nje"
    })

    await ticket.save()

    //create the fake dats event
    const data:OrderCreatedEvent['data']={
        id:new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'bsjb',
        expiresAt: 'ahga',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    };

    return {listener,ticket,data,msg}
}

it('sets the user id of the ticket',async()=>{
    const {listener,ticket,data,msg} = await setup();

    await listener.onMessage(data,msg)

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.orderId).toEqual(data.id);

})

it('acks the message',async()=>{
    const {listener,ticket,data,msg} = await setup();
    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event',async()=>{
    const {listener,ticket,data,msg} = await setup();

    await listener.onMessage(data,msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})