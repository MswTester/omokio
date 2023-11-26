
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
    "play":{
        "en":"Play",
        "ko":"게임하기"
    },
    "settings":{
        "en":"Settings",
        "ko":"설정"
    },
    "about":{
        "en":"About",
        "ko":"소개"
    },
    "username":{
        "en":"Username",
        "ko":"사용자 이름"
    },
    "password":{
        "en":"Password",
        "ko":"비밀번호"
    },
    "confirm password":{
        "en":"Confirm Password",
        "ko":"비밀번호 확인"
    },
    "avatar":{
        "en":"Avatar",
        "ko":"아바타"
    },
    "win":{
        "en":"Win",
        "ko":"승"
    },
    "lose":{
        "en":"Lose",
        "ko":"패"
    },
    "draw":{
        "en":"Draw",
        "ko":"무"
    },
    "rating":{
        "en":"Rating",
        "ko":"레이팅"
    },
    "register":{
        "en":"Register",
        "ko":"회원가입"
    },
    "login":{
        "en":"Login",
        "ko":"로그인"
    },
    "profile":{
        "en":"Profile",
        "ko":"프로필"
    },
    "rank":{
        "en":"Rank",
        "ko":"랭킹"
    },
    "skin":{
        "en":"Skin",
        "ko":"스킨"
    },
    "language":{
        "en":"Language",
        "ko":"언어"
    },
    "save":{
        "en":"Save",
        "ko":"저장"
    },
    "cancel":{
        "en":"Cancel",
        "ko":"취소"
    },
    "delete":{
        "en":"Delete",
        "ko":"삭제"
    },
    "update":{
        "en":"Update",
        "ko":"수정"
    },
    "delete account":{
        "en":"Delete Account",
        "ko":"계정 삭제"
    },
    "delete account confirm":{
        "en":"Are you sure you want to delete your account?",
        "ko":"정말 계정을 삭제하시겠습니까?"
    },
    "delete account success":{
        "en":"Your account has been deleted.",
        "ko":"계정이 삭제되었습니다."
    },
    "delete account fail":{
        "en":"Failed to delete your account.",
        "ko":"계정 삭제에 실패했습니다."
    },
    "update success":{
        "en":"Successfully updated.",
        "ko":"성공적으로 수정되었습니다."
    },
    "update fail":{
        "en":"Failed to update.",
        "ko":"수정에 실패했습니다."
    },
    "not found":{
        "en":"Not Found",
        "ko":"찾을 수 없음"
    },
    "not found message":{
        "en":"The page you are looking for was not found.",
        "ko":"찾을 수 없는 페이지입니다."
    },
    "rankmode":{
        "en":"Rank Mode",
        "ko":"랭크 모드"
    },
    "generalmode":{
        "en":"General Mode",
        "ko":"일반 모드"
    },
    "custommode":{
        "en":"Custom Mode",
        "ko":"커스텀 모드"
    },
    "match":{
        "en":"Match",
        "ko":"대전"
    },
}

export function lng(lang:string, key:string){
    return keys[key][lang]
}