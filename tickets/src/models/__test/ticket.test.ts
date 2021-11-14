import {Ticket} from '../ticket';
import request from 'supertest'
import {app} from '../../app'
it('implement optimistic concruency control', async ()=>{
    //create instance of a ticket
    const ticket = Ticket.build({
        title:'concert',
        price:5,
        userId:'123'
    })
    //save ticket to database 
    await ticket.save()
    //fetch the ticket twice
    const firstInstance= await Ticket.findById(ticket.id);
    const secondInstance=await Ticket.findById(ticket.id)
    //make 2 separate changes to the ticket we fetched
    firstInstance!.set({title:'raga'});
    secondInstance!.set({price:30});
    //save first fetched ticket
    await firstInstance!.save();
    //save second fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }
    throw new Error ('should not reach this point');    

})

it('increment number on multiple saves', async()=>{
    const ticket = Ticket.build({
        title:'concert',
        price:5,
        userId:'123'
    })
    await ticket.save()
    expect (ticket.version).toEqual(0)
    await ticket.save()
    expect (ticket.version).toEqual(1)
    await ticket.save()
    expect (ticket.version).toEqual(2);
})