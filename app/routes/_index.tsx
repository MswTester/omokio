// Path: omokio/app/routes/_index.tsx

import { json, type ActionFunction, type MetaFunction, LoaderFunction } from "@remix-run/node";
import { FC, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { init, initGame } from "~/logic/canvas";
import { lng } from "~/data/lang";
import { checkNick, checkPass, generateRandomAlphabets, sha256 } from "~/data/utils";
import { shopItems } from "~/data/gdata";
import {Socket, io} from "socket.io-client";

export const meta: MetaFunction = () => {
  return [
    { title: "omok.io" },
    { name: "description", content: "Online gomoku play" },
  ];
};

export const GlobalContext = createContext<any>({});

const menuTypes = ['rank', 'skin', 'play', 'profile', 'settings'];

const socket = io('https://omokio.onrender.com/', {
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

export default function Index() {
  const [hydra, setHydra] = useState<boolean>(false);
  const [user, setUser] = useState<User|null>(null);
  const [lang, setLang] = useState<string>('ko');
  const [page, setPage] = useState<Page>('login');
  const [match, setMatch] = useState<Match|null>(null);

  useEffect(() => {
    setHydra(true);

    let userId = localStorage.getItem('userId')
    if(userId){
      fetch(`/getUser/type/id/value/${userId}`).then(res => res.json()).then((res:{res:User}) => {
        if(res.res){
          setUser(res.res)
          setPage('main')
        }
      })
    }

    socket.on('matched', (data:Match) => {
      setMatch(data)
      setPage('play')
      setTimeout(() => {
        socket.emit('ready', data.ownerSocketId)
      }, 3000);
    })

    return () => {
      socket.off('matched')
    }
  }, []);

  return (hydra && <GlobalContext.Provider value={{
    user, setUser,
    page, setPage,
    lang, setLang,
    match, setMatch,
  }}>
    {page === 'main' ? <Main />:
    page === 'login' || page === 'register' ? <Login />:
    page === 'play' ? <Play />:
    <></>}
  </GlobalContext.Provider>);
}

const Main:FC = () => {
  const {user, setUser} = useContext(GlobalContext);
  const {page, setPage} = useContext(GlobalContext);
  const {lang, setLang} = useContext(GlobalContext);
  const {match, setMatch} = useContext(GlobalContext);
  const [menu, setMenu] = useState<string>('play');
  const [gamemode, setGamemode] = useState<GameMode>('general');
  const [cengine, setCengine] = useState<BABYLON.Engine|null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [shopMenu, setShopMenu] = useState<string>('theme');
  const [usernameInput, setUsernameInput] = useState<string>(user?.name || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');

  const leftOf:{[key:string]:string} = {
    'rank': 'custom',
    'general': 'rank',
    'custom': 'general',
  }
  const rightOf:{[key:string]:string} = {
    'rank': 'general',
    'general': 'custom',
    'custom': 'rank',
  }

  useEffect(() => {
    const resize = () => {
      if(cengine){
        cengine.resize();
      }
    }
    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize);
    }
  }, []);

  useEffect(() => {
    if(cengine && menu !== 'play'){
      cengine.dispose();
      setCengine(null);
    }
    if(menu === 'play' && !cengine){
      const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
      const {engine} = init(canvas, 'rotate');
      setCengine(engine as unknown as SetStateAction<BABYLON.Engine | null>);
    }
    if(menu === 'rank' && !isFetching){
      setIsFetching(true)
      fetch('/getAllUsers').then(res => res.json()).then((res:{res:User[]}) => {
        setUsers(res.res.sort((a, b) => b.rating - a.rating))
        setIsFetching(false)
      })
    }
  }, [menu]);

  const updateUser = (id:string, type:string, value:string) => {
    setIsFetching(true)
    fetch(`/updateUser/id/${id}/type/${type}/value/${value}`).then(res => res.json()).then((res:{res?:User, message?:string}) => {
      setIsFetching(false)
      if(res.res){
        setUser(res.res)
      } else if(res.message) {
        setNameError(lng(lang, res.message))
      }
    }).catch(err => {
      setIsFetching(false)
      console.log(err)
    })
  }

  const enterMatch = (type:GameMode, code?:string) => {
    setIsMatch(true)
    socket.emit('enterMatch', {type, id:user?.id, user:{...user, avatar:undefined}, code, rating:user?.rating, winrate:user?.win / user?.lose} as MatchData)
  }

  const cancelMatch = () => {
    setIsMatch(false)
    socket.emit('cancelMatch', user?.id)
  }

  const joinCustomMatch = () => {
    if(code === ''){return setCodeError('pls enter code')}
    enterMatch('custom', code)
  }

  return <>
    <div className="main-page">
      <div className="main" style={{height:`calc(100% - ${document.querySelector('.menu')?.clientHeight}px)`}}>
        {menu === 'play' ? <div className="main-play">
          <div className="gamemode">
            <button disabled={isMatch} className={`gamemode-item ${leftOf[gamemode] == '' ? 'rm' : ''}`} onClick={e => {
              if(leftOf[gamemode] !== ''){setGamemode(leftOf[gamemode] as GameMode)}
            }}>{lng(lang, `${leftOf[gamemode]}mode`)}</button>
            <div className={`arrow left ${leftOf[gamemode] == '' ? 'rm' : ''}`}>&lt;</div>
            <button disabled={isMatch} className="gamemode-item center">{lng(lang, `${gamemode}mode`)}</button>
            <div className={`arrow right ${rightOf[gamemode] == '' ? 'rm' : ''}`}>&gt;</div>
            <button disabled={isMatch} className={`gamemode-item ${rightOf[gamemode] == '' ? 'rm' : ''}`} onClick={e => {
              if(rightOf[gamemode] !== ''){setGamemode(rightOf[gamemode] as GameMode)}
            }}>{lng(lang, `${rightOf[gamemode]}mode`)}</button>
          </div>
          <canvas width={500} height={200} id="renderCanvas"></canvas>
          {gamemode === 'custom' && <input type="text" id="code" className="code" placeholder={lng(lang, 'enter code')} value={code} onChange={e => setCode(e.target.value)} disabled={isMatch} />}
          <div className="btn-layer">
            {gamemode !== 'custom' && <button onClick={e => !isMatch ? enterMatch(gamemode) : cancelMatch()} className={`match ${isMatch ? "matching" : ""}`}>{isMatch ? lng(lang, 'matching') : lng(lang, 'match')}</button>}
            {gamemode === 'custom' && <button onClick={e => !isMatch ? joinCustomMatch() : cancelMatch()} className={`join-custom-match ${isMatch ? "matching" : ""}`}>{isMatch ? lng(lang, 'matching') : lng(lang, 'join custom match')}</button>}
          </div>
        </div>:
        menu === 'rank' ? <div className="main-rank">
          <div className="rank-list">
            {isFetching ? <div className="loading">Loading . . .</div>:
            users.map((v, i) => (
              <div className="rank-item" key={i}>
                <div className="rank-item-rank">{i+1}</div>
                <div className="rank-item-information">
                  <div className="rank-item-name">{v.name}</div>
                  <div className="rank-item-rating">{v.rating} RT</div>
                </div>
              </div>
            ))}
          </div>
        </div>:
        menu === 'skin' ? <div className="main-skin">
          <div className="shop-menu">
            {Object.keys(shopItems).map((v, i) => (
              <div className={`shop-menu-item ${shopMenu === v ? "active" : ""}`} key={i} onClick={e => {setShopMenu(v)}}>{lng(lang, v)}</div>
            ))}
          </div>
          <div className="shop-item-list">
            {shopItems[shopMenu].map((v, i) => (
              <div className="shop-item" key={i}>
                <div className="shop-item-img" style={{backgroundImage:`url(shop_item_icons/${v.name}.svg)`}}></div>
                <div className="shop-item-name">{lng(lang, v.name as string)}</div>
                <button disabled={isFetching} className="purchase">{v.price}G</button>
              </div>))}
          </div>
        </div>:
        menu === 'profile' ? <div className="main-profile">
          <div className="options">
            <div>{lng(lang, 'username')}</div>
            <input type="text" value={usernameInput} placeholder={lng(lang, 'username')} onChange={e => {setUsernameInput(e.target.value);setNameError('')}} />
            <button disabled={isFetching || usernameInput === "" || user.name === usernameInput} onClick={e => {
              if(!checkNick(usernameInput)){return setNameError('Name must be 3~12 characters long including numbers and alphabets')}
              updateUser(user.id, 'name', usernameInput)
            }}>{lng(lang, 'save')}</button>
          </div>
          <div className="error">{nameError}</div>
          <div className="options">
            <div>{lng(lang, 'password')}</div>
            <input type="password" value={passwordInput} placeholder={lng(lang, 'password')} onChange={e => {setPasswordInput(e.target.value);setPasswordError('')}} />
            <button disabled={isFetching || passwordInput === "" || sha256(passwordInput) === user?.password} onClick={e => {
              if(!checkPass(passwordInput)){return setPasswordError('Password must be more than 8 characters long including numbers and alphabets')}
              updateUser(user.id, 'password', sha256(passwordInput))
            }}>{lng(lang, 'change')}</button>
          </div>
          <div className="error">{passwordError}</div>
          <div className="options">
            <div>{lng(lang, "avatar")}</div>
            <div className="avatar" style={{backgroundImage:`url(${user?.avatar})`}}></div>
            <button disabled={isFetching} onClick={e => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.onchange = e => {
                if(fileInput.files && fileInput.files[0]){
                  const file = fileInput.files[0];
                  const reader = new FileReader();
                  reader.onload = e => {
                    if(reader.result){
                      // post avatar upload fetcher
                      setIsFetching(true)
                      const formData = new FormData();
                      formData.append('id', user?.id as string);
                      formData.append('avatar', reader.result as string);
                      fetch(`/avatar`, {
                        method: 'POST',
                        body: formData,
                      }).then(res => {
                        setIsFetching(false)
                        setUser({...user, avatar: reader.result as string})
                        fileInput.value = '';
                      }).catch(err => {
                        setIsFetching(false)
                        console.log(err)
                      })
                    }
                  }
                  reader.readAsDataURL(file);
                }
              }
              fileInput.click();
            }}>{lng(lang, 'change')}</button>
          </div>
          <div className="options">
            <div>{lng(lang, 'delete account')}</div>
            <button disabled={isFetching} onClick={e => {
              setIsFetching(true)
              fetch(`/deleteUser/id/${user?.id}`).then(res => res.json()).then((res:{res:boolean}) => {
                if(res.res){
                  setIsFetching(false)
                  localStorage.removeItem('userId')
                  setUser(null)
                  setPage('login')
                }
              }).catch(err => {
                console.log(err)
              })
            }}>{lng(lang, 'delete')}</button>
          </div>
        </div>:
        menu === 'settings' && <div className="main-settings">
          <div className="settings-title">{lng(lang, 'settings')}</div>
        </div>}
      </div>
      <div className="menu">
        {menuTypes.map((v, i) => (
          <button disabled={isMatch} className={`menu-item ${menu === v ? 'active' : ''}`} key={i} onClick={() => {setMenu(v)}}>
            <div className="menu-item-icon" style={{backgroundImage:`url(icons/${v}.svg)`}}></div>
            <div className="menu-item-text">{lng(lang, v)}</div>
          </button>
        ))}
      </div>
      {menu === "play" && <div className="profile">
        <div className="profile-set">
          <div className="profile-img" style={{backgroundImage:`url(${user?.avatar})`}}></div>
          <div className="profile-information">
            <div className="profile-name">{user?.name}</div>
            <div className="profile-rank">{user?.rating} RT</div>
          </div>
        </div>
        <div className="profile-logout" onClick={() => {
          localStorage.removeItem('userId')
          setUser(null)
          setPage('login')
        }}>{lng(lang, 'logout')}</div>
      </div>}
    </div>
  </>
}

const Login:FC = () => {
  const {user, setUser} = useContext(GlobalContext);
  const {page, setPage} = useContext(GlobalContext);
  const {lang, setLang} = useContext(GlobalContext);
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const login = () => {
    if(name === ''){return setError('enter name')}
    if(password === ''){return setError('enter password')}
    setButtonDisabled(true)
    fetch(`/getUser/type/name/value/${name}`).then(res => res.json()).then((res:{res:User}) => {
      if(res.res){
        if(res.res.password === sha256(password)){
          setButtonDisabled(false)
          localStorage.setItem('userId', res.res.id)
          setUser(res.res)
          setTimeout(() => {
            setPage('main')
          }, 500);
        }else{
          setButtonDisabled(false)
          setError(lng(lang, 'wrong password'))
        }
      }else{
        setButtonDisabled(false)
        setError(lng(lang, 'cant find account'))
      }
    })
  }

  const register = () => {
    if(!checkNick(name)){return setError('Name must be 3~12 characters long including numbers and alphabets')}
    if(!checkPass(password)){return setError('Password must be more than 8 characters long including numbers and alphabets')}
    setButtonDisabled(true)
    fetch(`/createUser/name/${name}/password/${password}`).then(res => {
      return res.json()
    }).then((res:{res:User}) => {
      if(res.res){
        setButtonDisabled(false)
        localStorage.setItem('userId', res.res.id)
        setUser(res.res)
        setTimeout(() => {
          setPage('main')
        }, 500);
      }else{
        setError(lng(lang, 'name already exists'))
        setButtonDisabled(false)
      }
    })
  }

  useEffect(() => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const {engine} = init(canvas, 'rotate');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      engine.resize();
    }
    resize()
    window.addEventListener('resize', resize)

    return () => {
      engine.dispose();
      window.removeEventListener('resize', resize);
    }
  }, []);

  return <>
    <div className={`login-page`}>
      <canvas className={user ? "success" : ""} id="renderCanvas"></canvas>
      <div className={user ? "success" : ""}>
        <input type="text" name="name" id="" value={name} placeholder="Nickname"
        onChange={e => {setName(e.target.value);setError('')}}/>
        <input type="password" name="password" id="" value={password} placeholder="Password"
        onChange={e => {setPassword(e.target.value);setError('')}}/>
        {page === 'login' ? <button className={user ? "success" : ""} disabled={buttonDisabled} onClick={() => {login()}}>{buttonDisabled ? ". . ." : "Login"}</button>:
        page === 'register' && <button className={user ? "success" : ""} disabled={buttonDisabled} onClick={() => {register()}}>{buttonDisabled ? ". . ." : "Register"}</button>}
        <div className="switch" onClick={e => {
          if(page === 'login'){setPage('register')}else{setPage('login')}
        }}>{lng(lang, page === 'login' ? 'to register' : 'to login')}</div>
        <div className="errorline">{error}</div>
      </div>
    </div>
  </>
}

const Play:FC = () => {
  const {user, setUser} = useContext(GlobalContext);
  const {page, setPage} = useContext(GlobalContext);
  const {lang, setLang} = useContext(GlobalContext);
  const {match, setMatch} = useContext(GlobalContext);
  const [myColor, setMyColor] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isStart, setIsStart] = useState<boolean>(false);
  const [startTransition, setStartTransition] = useState<number>(0);
  const [isFinish, setIsFinish] = useState<boolean>(false);
  const [finishTransition, setFinishTransition] = useState<number>(0);
  const [myuser, setMyuser] = useState<User|null>(null);
  const [enemyuser, setEnemyuser] = useState<User|null>(null);
  const [winner, setWinner] = useState<string>('');

  
  useEffect(() => {
    if(!match){return}
    let pos = [0, 0]
    let turn = 'black'
    let mcolor = match.blackSocketId === socket.id ? 'black' : 'white'
    setMyColor(mcolor)
    setMyuser(match.blackSocketId === socket.id ? match.blackUser : match.whiteUser)
    setEnemyuser(match.blackSocketId === socket.id ? match.whiteUser : match.blackUser)

    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const {engine, placeStone, addStone, posTo, removeSelection, initialMotion} = initGame(canvas, match.board)

    initialMotion()

    let t = 0;
    const loop_start = setInterval(() => {
      if(!match){return}
      t += 0.01;
      let x = t / 3
      let tr = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      setStartTransition(tr)
      if(t >= 3){clearTimeout(loop_start); return}
    }, 10);
  
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      engine.resize();
    }
    resize()
    window.addEventListener('resize', resize)
    
    socket.on('placeStone', (position:{x:number;y:number;color:string}) => {
      turn = position.color === 'black' ? 'white' : 'black'
      console.log(turn)
      addStone(position.x, position.y, position.color)
    })
    
    socket.on('start', (data:Match) => {
      canvas.addEventListener('click', click)
      setMatch(data)
      setIsStart(true)
    })

    socket.on('update', (data:Match) => {
      setMatch(data)
    })
    
    socket.on('finish', (winner:string) => {
      setIsFinish(true)
      let t = 0;
      const loop_finish = setInterval(() => {
        t += 0.01;
        let x = t / 3
        let tr = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        setFinishTransition(tr)
        if(t >= 3){clearTimeout(loop_finish); return}
      }, 10);
      setTimeout(() => {
        setIsFinish(false)
        setFinishTransition(0)
        setIsStart(false)
        setStartTransition(0)
        setMatch(null)
        setPage('main')
      }, 3001);
      console.log(winner)
      setWinner(winner)
    })
  
    const mousedown = () => {
    }

    const mouseup = () => {
    }

    const mousemove = (e:MouseEvent) => {
      pos = [e.clientX, e.clientY]
      if(mcolor !== turn){return removeSelection();};
      posTo(e.clientX, e.clientY);
    }

    const keydown = (e:KeyboardEvent) => {
      if(e.key === 'KeyV' && e.shiftKey){
        placeStone(pos[0], pos[1], socket, match?.ownerSocketId)
      }
    }

    document.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('keydown', keydown);
    
    const click = (e:MouseEvent) => {
      if(!match){return}
      placeStone(e.clientX, e.clientY, socket, match?.ownerSocketId)
    }
    
    return () => {
      window.removeEventListener('resize', resize);
      socket.off('placeStone');
      socket.off('start');
      socket.off('update')
      canvas.removeEventListener('click', click)
      engine.dispose();
      document.removeEventListener('mousedown', mousedown);
      document.removeEventListener('mouseup', mouseup);
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('keydown', keydown);
    }
  }, []);

  useEffect(() => {
    if(!match){return}
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    if(match.turn === myColor){
      canvas.style.cursor = 'pointer';
    } else {

      canvas.style.cursor = 'default';
    }
  }, [match]);

  return <>
    <div className="play-page">
      {isStart || <div className="intro">
        <div style={{left:`${(1 - startTransition*0.7)*100}%`}} className="text me">{myColor === 'black' ? match.blackUser.name : match.whiteUser.name}</div>
        <div style={{left:`${startTransition*70}%`}} className="text enemy">{myColor === 'white' ? match.blackUser.name : match.whiteUser.name}</div>
      </div>}
      {isFinish && <div className="finish">
        <div className="text winner" style={{top:`${finishTransition*50}%`}}>{myColor === winner ? lng(lang, 'win') : lng(lang, 'lose')}</div>
      </div>}
      {isStart && !isFinish && <div className="layout layout-me">
        <div className="timeline">
          <div className="timeline-bar" style={{width:`${(myColor === 'black' ? match.blackTime : match.whiteTime)/6}%`,
          backgroundColor:`rgba(${myColor === match.turn ? '0' : '255'}, 255, 255, 0.5)`}}></div>
        </div>
        <div className="text-name" style={{backgroundColor:myColor, color:myColor === 'black' ? 'white' : 'black'}}>{myuser?.name}</div>
      </div>}
      {isStart && !isFinish && <div className="layout layout-enemy">
        <div className="text-name" style={{backgroundColor:myColor === 'black' ? 'white' : 'black', color:myColor}}>{enemyuser?.name}</div>
        <div className="timeline">
        <div className="timeline-bar" style={{width:`${(myColor === 'white' ? match.blackTime : match.whiteTime)/6}%`,
        backgroundColor:`rgba(${myColor === match.turn ? '255' : '0'}, 255, 255, 0.5)`}}></div>
        </div>
      </div>}
      <canvas id="renderCanvas"></canvas>
    </div>
  </>
}