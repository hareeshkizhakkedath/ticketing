import request from "supertest";
import { app } from "../../app";
import {Ticket} from "../../models/ticket" 
import {natsWrapper} from '../../nats-wrapper'

it('has a route handler listening to /api/tickets for for post requests',async()=>{
    const response =await request(app)
        .post('/api/tickets')
        .send({})
    expect (response.status).not.toEqual(404)
});

it('can only accessed if user is signed in',async()=>{
    const response=await request(app)
        .post('/api/tickets')
        .send({})
    expect(response.status).toEqual(401);
});

it('returns status other than 401 if user is signed in',async()=>{
    const response=await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({})
        
    expect(response.status).not.toEqual(401);
})

it('returns an error if an invalid title is provided',async()=>{
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title:'',
        price:10
    })
    expect(response.status).toEqual(400);

});

it('returns an error if an title is notprovided',async()=>{
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        price:10
    })
    expect(response.status).toEqual(400);

});

it('returns an error if an invalid price is provided',async()=>{
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title:'title',
        price:-10
    })
    expect(response.status).toEqual(400);
});

it('returns an error if  price is not provided',async()=>{
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title:'title',
    })
    expect(response.status).toEqual(400);
});

it('creat a ticket with valid input',async()=>{
    //add a check to make sure a ticket saved
    let tickets =await Ticket.find({});
    expect (tickets.length).toEqual(0)

    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title:'title',
        price:20
    })
    expect(response.status).toEqual(201);  
    tickets =await Ticket.find({})
    expect(tickets.length).toEqual(1)  
});

it('publish an event',async()=>{
    const response=await request(app)
    .post('/api/tickets')
    .set('Cookie',global.signin())
    .send({
        title:'title',
        price:20
    })
    expect(response.status).toEqual(201); 

    expect(natsWrapper.client.publish).toHaveBeenCalled();

})