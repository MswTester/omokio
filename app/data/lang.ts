
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
        "en":"Rank",
        "ko":"랭크전"
    },
    "generalmode":{
        "en":"General",
        "ko":"일반전"
    },
    "custommode":{
        "en":"Custom",
        "ko":"커스텀"
    },
    "match":{
        "en":"Match",
        "ko":"대전"
    },
    "theme":{
        "en":"Theme",
        "ko":"테마"
    },
    "board":{
        "en":"Board",
        "ko":"보드"
    },
    "stone":{
        "en":"Stone",
        "ko":"돌"
    },
    "beige_wall":{
        "en":"Beige Wall",
        "ko":"베이지 벽돌"
    },
    "laminate_floor":{
        "en":"Laminate Floor",
        "ko":"라미네이트 바닥"
    },
    "rubber_tiles":{
        "en":"Rubber Tiles",
        "ko":"고무 타일"
    },
    "cobblestone":{
        "en":"Cobblestone",
        "ko":"자갈"
    },
    "corrugated_iron":{
        "en":"Corrugated Iron",
        "ko":"철판"
    },
    "mossy_sandstone":{
        "en":"Mossy Sandstone",
        "ko":"이끼 낀 모래암"
    },
    "change":{
        "en":"Change",
        "ko":"변경"
    },
    "name already exists":{
        "en":"Name already exists",
        "ko":"이미 존재하는 이름입니다"
    },
    "cant find account":{
        "en":"Can't find account",
        "ko":"계정을 찾을 수 없습니다"
    },
    "wrong password":{
        "en":"Wrong password",
        "ko":"잘못된 비밀번호입니다"
    },
    "join custom match":{
        "en":"Join Custom Match",
        "ko":"커스텀 대전 참가"
    },
    "matching":{
        "en":"Matching . . .",
        "ko":"매칭중 . . ."
    },
    "enter code":{
        "en":"Enter Code",
        "ko":"코드 입력"
    },
    "turn":{
        "en":"Turn",
        "ko":"차례"
    },
}

export function lng(lang:string, key:string){
    if(!keys[key]) return key
    return keys[key][lang]
}