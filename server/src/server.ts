// src/server.ts

import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { Server as SocketIoServer } from 'socket.io';

const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify();

const httpServer = app.server!; // Note: Non-null assertion (!) is used here for simplicity.

const io = new SocketIoServer(httpServer, {
    cors: {
        origin: '*',
    },
    // https://socket.io/docs/v4/server-api/#server-adapter
});

app.get('/', (request, reply) => {
  reply.send("Hello, world!");
});

const matches:Match[] = [];

let timer = 0;
const loop = setInterval(() => {
    const matchesToRemove:number[] = [];
    timer++;
    matches.forEach((match, index) => {
        if(match.isMatched && match.isStarted && !match.isFinished){
            if(match.turn === 'black'){
                match.blackTime -= 0.01;
                if(match.blackTime <= 0){
                    match.blackTime = 0;
                    match.isFinished = true;
                    io.to(match.blackSocketId).emit('finish', {winner:'white'});
                    io.to(match.whiteSocketId).emit('finish', {winner:'white'});
                }
            }else{
                match.whiteTime -= 0.01;
                if(match.whiteTime <= 0){
                    match.whiteTime = 0;
                    match.isFinished = true;
                    io.to(match.blackSocketId).emit('finish', {winner:'black'});
                    io.to(match.whiteSocketId).emit('finish', {winner:'black'});
                }
            }
        }
        if(!match.isMatched){
            // find match
            let matched = false;
            matches.forEach((match2, index2) => {
                if(match2.isMatched === false && match2.type === match.type && match2.ownerSocketId !== match.ownerSocketId){
                    if(match.type === 'custom' && match2.code !== match.code) return;
                    match.isMatched = true;
                    const random = Math.floor(Math.random() * 2);
                    match.blackSocketId = random ? match.ownerSocketId : match2.ownerSocketId;
                    match.whiteSocketId = random ? match2.ownerSocketId : match.ownerSocketId;
                    io.to(match.blackSocketId).emit('matched', {color:'black'});
                    io.to(match.whiteSocketId).emit('matched', {color:'white'});
                    matchesToRemove.push(index2);
                    matched = true;
                }
            });
        }
    });
    matchesToRemove.reverse().forEach(index => {
        matches.splice(index, 1);
    });
}, 10);


io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('enterMatch', (data:MatchData) => {
    let board:string[][] = [];
    for(let i = 0; i < 15; i++){
        board.push([]);
        for(let j = 0; j < 15; j++){
            board[i].push('');
        }
    }
    let newMatch:Match = {
        type: data.type,
        created: +`${timer}`,
        ownerSocketId: socket.id,
        board,
        turn: 'black',
        blackTime: 600,
        whiteTime: 600,
        blackSocketId: '',
        blackUser: null,
        whiteSocketId: '',
        whiteUser: null,
        isStarted: false,
        isMatched: false,
        isFinished: false,
        code: data.code,
        rating: data.rating,
    };
    matches.push(newMatch);
    console.log('enterMatch', newMatch);
  });

  socket.on('cancelMatch', (userId) => {
    matches.forEach((match, index) => {
        if(match.ownerSocketId === socket.id){
            matches.splice(index, 1);
        }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    matches.forEach((match, index) => {
        if(match.ownerSocketId === socket.id){
            matches.splice(index, 1);
        }
    });
  });
});

app.listen(80, (err, address) => {
  if (err) throw err;
  console.log(`Server listening on ${address}`);
});
