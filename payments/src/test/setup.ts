import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import {
    app
} from '../app';
import jwt from 'jsonwebtoken'


declare global {
    var signin: (id?:string) =>[string] ;
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?:string) => {
    //build a json web tocken payload{id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    //create the jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!)
    //build session object {jwt : my_jwt}
    const session = {
        jwt: token
    };
    //turn that session onto JSON
    const sessionJSON = JSON.stringify(session);
    //take json and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    //return a string with cookie as encoded data
    return [`express:sess=${base64}`];

}