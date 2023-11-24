interface User{
    id: string;
    name: string;
    password: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}

type Page = 'main' | 'login' | 'register' | 'profile' | 'settings' | 'about' | 'notfound';

interface req{
    mode: 'getUser' | 'createUser' | 'updateUser' | 'deleteUser';
    user?:User;
    id?:string;
    type?:string;
    value?:string;
}