// Path: omokio/server/src/server.ts

import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { Server as SocketIoServer } from 'socket.io';
import { hasWinningMove } from './logic';

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

const finishMatch = (match:Match, winner:string) => {
    match.isFinished = true;
    io.to(match.blackSocketId).emit('finish', {winner});
    io.to(match.whiteSocketId).emit('finish', {winner});
}

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
                    finishMatch(match, 'white');
                }
            }else{
                match.whiteTime -= 0.01;
                if(match.whiteTime <= 0){
                    match.whiteTime = 0;
                    finishMatch(match, 'black');
                }
            }
        }
        if(!match.isMatched){
            // find match
            matches.forEach((match2, index2) => {
                if(match2.isMatched === false && match2.type === match.type && match2.ownerSocketId !== match.ownerSocketId){
                    const delayed = Math.sqrt(timer - match.created)
                    if(match.type === 'rank' && match2.rating < match.rating - delayed*10 || match2.rating > match.rating + delayed*10) return;
                    if(match.type === 'general' && match2.winrate < match.winrate - delayed/200 || match2.winrate > match.winrate + delayed/200) return;
                    if(match.type === 'custom' && match2.code !== match.code) return;
                    match.isMatched = true;
                    const random = Math.floor(Math.random() * 2);
                    match.blackSocketId = random ? match.ownerSocketId : match2.ownerSocketId;
                    match.whiteSocketId = random ? match2.ownerSocketId : match.ownerSocketId;
                    console.log('matched', match);
                    io.to(match.blackSocketId).emit('matched', match);
                    io.to(match.whiteSocketId).emit('matched', match);
                    matchesToRemove.push(index2);
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
        blackReady: false,
        whiteSocketId: '',
        whiteUser: null,
        whiteReady: false,
        isStarted: false,
        isMatched: false,
        isFinished: false,
        code: data.code,
        rating: data.rating,
    };
    matches.push(newMatch);
    console.log('enterMatch', data);
  });

  socket.on('cancelMatch', (userId) => {
    console.log('cancelMatch', userId);
    matches.forEach((match, index) => {
        if(match.ownerSocketId === socket.id){
            matches.splice(index, 1);
        }
    });
  });

  socket.on('ready', (matchOwnerId) => {
    console.log('ready', matchOwnerId, socket.id);
    matches.forEach((match, index) => {
        if(match.ownerSocketId === matchOwnerId){
            if(match.blackSocketId === socket.id){
                match.blackReady = true;
            }
            if(match.whiteSocketId === socket.id){
                match.whiteReady = true;
            }
            if(match.blackReady && match.whiteReady){
                console.log('start', match);
                match.isStarted = true;
                io.to(match.blackSocketId).emit('start', match);
                io.to(match.whiteSocketId).emit('start', match);
            }
        }
    });
  });

  socket.on('place', (data:{x:number, y:number, ownerId:string}) => {
    matches.forEach((match, index) => {
        if(match.isFinished) return;
        if(match.ownerSocketId !== data.ownerId) return;
        if(match.blackSocketId === socket.id && match.turn === 'black'){
            if(match.board[data.y][data.x] === ''){
                match.board[data.y][data.x] = 'black';
                match.turn = 'white';
                if(hasWinningMove(match.board, 'black', 5)){
                    finishMatch(match, 'black');
                }
            }
        }
        if(match.whiteSocketId === socket.id && match.turn === 'white'){
            if(match.board[data.y][data.x] === ''){
                match.board[data.y][data.x] = 'white';
                match.turn = 'black';
                if(hasWinningMove(match.board, 'white', 5)){
                    finishMatch(match, 'white');
                }
            }
        }
        io.to(match.blackSocketId).emit('update', match);
        io.to(match.whiteSocketId).emit('update', match);
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