import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Listener } from "@hari-ticket/common"
import { Ticket } from "../../../models/ticket"
import mongoose from "mongoose"
import {Message} from "node-nats-streaming"
import { TicketUpdatedEvent } from "@hari-ticket/common"
const setup=async()=>{
    //create a listner
    const listener = new TicketUpdatedListener(natsWrapper.client);
    //create and save ticket
    const ticket = Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title:"concert",
        price:20
    })
    await ticket.save()
    //create a fake data object
    const data:TicketUpdatedEvent['data']={
        id:ticket.id,
        version:ticket.version+1,
        title:"concert1",
        price:30,
        userId:"gyghg"
    }
    //create a fake msg object
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    }
    //return all
    return {msg , data,ticket,listener};
}

it('acks the msg',async()=>{
    const {msg , data,ticket,listener} = await setup();
    await listener.onMessage(data,msg);
    expect (msg.ack).toHaveBeenCalled();
})

it('does not call ack if event has non proper version number',async()=>{
    const {msg , data,ticket,listener} = await setup();
    data.version=10;
    try {
        await listener.onMessage(data,msg)
    } catch (error) {
        
    }
    expect(msg.ack).not.toHaveBeenCalled();
})