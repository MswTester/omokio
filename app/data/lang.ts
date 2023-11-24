
const keys:{[key:string]:{[key:string]:string}} = {
    "":{
        "en":"",
        "ko":""
    },
    "to register":{
        "en":"To Register",
        "ko":"회원가입으로"
    },
    "to login":{
        "en":"To Login",
        "ko":"로그인으로"
    },
    "logout":{
        "en":"Logout",
        "ko":"로그아웃"
    },
}

export function lng(lang:string, key:string){
    return keys[key][lang]
}