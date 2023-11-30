interface User{
    id: string;
    name: string;
    password: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    win: number;
    lose: number;
    draw: number;
    rating: number;
    gold: number;
    unlocked: (string|number)[][];
}

type Page = 'main' | 'login' | 'register' | 'profile' | 'settings' | 'about' | 'notfound';

interface req{
    mode: 'getUser' | 'createUser' | 'updateUser' | 'deleteUser';
    user?:User;
    id?:string;
    type?:string;
    value?:string;
}


interface Match{
    type: 'rank' | 'general' | 'custom';
    created:number;
    ownerSocketId:string;
    board:string[][];
    turn:'black' | 'white';
    blackTime:number;
    whiteTime:number;
    blackSocketId:string;
    blackUser:User;
    whiteSocketId:string;
    whiteUser:User;
    isStarted:boolean;
    isMatched:boolean;
    isFinished:boolean;
    code?:string;
    rating?:number;
    winrate?:number;
}

interface MatchData{
    type: GameMode;
    user: User;
    code?:string;
    rating?:number;
    winrate?:number;
}

type GameMode = 'rank' | 'general' | 'custom';