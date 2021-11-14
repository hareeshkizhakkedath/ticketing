import { TicketCreatedListener } from "../ticket-created-listeners"
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@hari-ticket/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async()=>{
    //create instance of listener
    const listener= new TicketCreatedListener(natsWrapper.client);
    //create a fake data event
    const data:TicketCreatedEvent['data']={
        version:0,
        id:new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:10,
        userId:new mongoose.Types.ObjectId().toHexString(),
    }
    //create a fake message object
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    }

    return {listener, data , msg};
}

it('create and save ticket',async()=>{
    const {listener,data,msg}= await setup();
    // call the on message function with the data object + message object
    await listener.onMessage(data,msg);

    //write assertion to make sure a ticket was created
    const ticket= Ticket.findById(data.id);
    expect(ticket).toBeDefined();

})

it('acks the message', async()=>{
    const {data,listener, msg}= await setup();
    // call the on message function with the data object + message object
    await listener.onMessage(data,msg);
    //write assertion to make sure a ticket was created
    expect(msg.ack).toHaveBeenCalled();
})
