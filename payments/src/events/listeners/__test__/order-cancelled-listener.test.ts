import { OrderCancelledListener } from "../order-cancelled-listener";
import { Listener, OrderCancelledEvent } from "@hari-ticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { OrderStatus } from "@hari-ticket/common";
import mongoose from "mongoose";

const setup = async()=>{
    const listener = new OrderCancelledListener(natsWrapper.client)
    const order=await Order.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        version:0,
        status:OrderStatus.Created,
        userId:'dfdfd',
        price:20
    })
    await order.save();
    const data :OrderCancelledEvent['data']={
        id: order.id,
        version: 1,
        ticket: {
            id: 'sfgsf'
        }
    }
    //@ts-ignore
    const msg:Message={
        ack:jest.fn()
    }

    return {listener,data,msg,order}
}

it('update the status of order',async()=>{
    const {listener,data,msg,order}=await setup();
    await listener.onMessage(data,msg)
    const updatedOrder=await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('ack msg',async()=>{
    const {listener,data,msg,order}=await setup();
    await listener.onMessage(data,msg)
    expect(msg.ack).toHaveBeenCalled();
})