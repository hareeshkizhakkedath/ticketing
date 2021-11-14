import { Listener,NotFoundError,OrderCreatedEvent,Subjects } from "@hari-ticket/common";
import { queueGroupName } from "./queue-group-name";
import {Message} from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject:Subjects.OrderCreated=Subjects.OrderCreated;
    queueGroupName=queueGroupName
    async onMessage(data:OrderCreatedEvent['data'],msg:Message){
        //find ticket that the order is deserving
        const ticket=await Ticket.findById(data.ticket.id)
        //if no ticket throw error
        if(!ticket){
            throw new Error('ticket not found')
        }
        //mark the ticket as being reserved by setting it's orderId property
        ticket.set({orderId:data.id})
        //save the ticket
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId 
        })

        //ack the message
        msg.ack();
    }
}