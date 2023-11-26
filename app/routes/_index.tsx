import { json, type ActionFunction, type MetaFunction, LoaderFunction } from "@remix-run/node";
import { FC, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { init } from "~/logic/canvas";
import { lng } from "~/data/lang";
import { checkNick, checkPass, sha256 } from "~/data/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "omok.io" },
    { name: "description", content: "Online gomoku play" },
  ];
};

export const GlobalContext = createContext<any>({});

const menuTypes = ['rank', 'skin', 'play', 'profile', 'settings'];

export default function Index() {
  const [hydra, setHydra] = useState<boolean>(false);
  const [user, setUser] = useState<User|null>(null);
  const [lang, setLang] = useState<string>('ko');
  const [page, setPage] = useState<Page>('login');

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
  }, []);

  return (hydra && <GlobalContext.Provider value={{
    user, setUser,
    page, setPage,
    lang, setLang,
  }}>
    {page === 'main' ? <Main />:
    page === 'login' || page === 'register' ? <Login />:
    <></>}
  </GlobalContext.Provider>);
}

const Main:FC = () => {
  const {user, setUser} = useContext(GlobalContext);
  const {page, setPage} = useContext(GlobalContext);
  const {lang, setLang} = useContext(GlobalContext);
  const [menu, setMenu] = useState<string>('play');
  const [gamemode, setGamemode] = useState<string>('general');
  const [cengine, setCengine] = useState<BABYLON.Engine|null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [shopMenu, setShopMenu] = useState<string>('theme');
  const leftOf:{[key:string]:string} = {
    'rank': '',
    'general': 'rank',
    'custom': 'general',
  }
  const rightOf:{[key:string]:string} = {
    'rank': 'general',
    'general': 'custom',
    'custom': '',
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
      const {engine} = init(window, canvas, 'rotate');
      setCengine(engine as unknown as SetStateAction<BABYLON.Engine | null>);
    }
    if(menu === 'rank'){
      setIsFetching(true)
      fetch('/getAllUsers').then(res => res.json()).then((res:{res:User[]}) => {
        setUsers(res.res.sort((a, b) => b.rating - a.rating))
        setIsFetching(false)
      })
    } else {setUsers([])}
  }, [menu]);

  return <>
    <div className="main-page">
      <div className="main" style={{height:`calc(100% - ${document.querySelector('.menu')?.clientHeight}px)`}}>
        {menu === 'play' ? <div className="main-play">
          <div className="gamemode">
            <div className={`gamemode-item ${leftOf[gamemode] == '' ? 'rm' : ''}`} onClick={e => {
              if(leftOf[gamemode] !== ''){setGamemode(leftOf[gamemode])}
            }}>{lng(lang, `${leftOf[gamemode]}mode`)}</div>
            <div className={`arrow left ${leftOf[gamemode] == '' ? 'rm' : ''}`}>&lt;</div>
            <div className="gamemode-item center">{lng(lang, `${gamemode}mode`)}</div>
            <div className={`arrow right ${rightOf[gamemode] == '' ? 'rm' : ''}`}>&gt;</div>
            <div className={`gamemode-item ${rightOf[gamemode] == '' ? 'rm' : ''}`} onClick={e => {
              if(rightOf[gamemode] !== ''){setGamemode(rightOf[gamemode])}
            }}>{lng(lang, `${rightOf[gamemode]}mode`)}</div>
          </div>
          <canvas width={500} height={200} id="renderCanvas"></canvas>
          <button className="match">{lng(lang, 'match')}</button>
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
            <div className={`shop-menu-item ${shopMenu === "theme" ? "active" : ""}`} onClick={e => {setShopMenu('theme')}}>{lng(lang, 'theme')}</div>
            <div className={`shop-menu-item ${shopMenu === "board" ? "active" : ""}`} onClick={e => {setShopMenu('board')}}>{lng(lang, 'board')}</div>
            <div className={`shop-menu-item ${shopMenu === "stone" ? "active" : ""}`} onClick={e => {setShopMenu('stone')}}>{lng(lang, 'stone')}</div>
          </div>
          <div className="shop-item-list">
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
            <div className="shop-item">
              <div className="shop-item-img"></div>
              <div className="shop-item-name">Default</div>
              <button className="purchase">Free</button>
            </div>
          </div>
        </div>:
        menu === 'profile' ? <div className="main-profile">
          <div className="profile-title">{lng(lang, 'profile')}</div>
        </div>:
        menu === 'settings' && <div className="main-settings">
          <div className="settings-title">{lng(lang, 'settings')}</div>
        </div>}
      </div>
      <div className="menu">
        {menuTypes.map((v, i) => (
          <div className={`menu-item ${menu === v ? 'active' : ''}`} key={i} onClick={() => {setMenu(v)}}>
            <div className="menu-item-icon" style={{backgroundImage:`url(icons/${v}.svg)`}}></div>
            <div className="menu-item-text">{lng(lang, v)}</div>
          </div>
        ))}
      </div>
      <div className="profile">
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
      </div>
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
      console.log(res)
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
          setError('wrong password')
        }
      }else{
        setButtonDisabled(false)
        setError('cant find account')
      }
    })
  }

  const register = () => {
    if(!checkNick(name)){return setError('Name must be 3~12 characters long including numbers and alphabets')}
    if(!checkPass(password)){return setError('Password must be more than 8 characters long including numbers and alphabets')}
    setButtonDisabled(true)
    fetch(`/createUser/name/${name}/password/${password}`).then(res => {
      console.log(res)
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
        setError('already used id')
        setButtonDisabled(false)
      }
    })
  }

  useEffect(() => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize()
    window.addEventListener('resize', resize)
    const {engine} = init(window, canvas, 'rotate');

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
