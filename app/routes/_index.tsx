import { json, type ActionFunction, type MetaFunction, LoaderFunction } from "@remix-run/node";
import { FC, createContext, useContext, useEffect, useState } from "react";
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

  return <>
    <div className="main-page">
      <div className="main"></div>
      <div className="menu"></div>
      <div className="profile">
        <div className="profile-set">
          <div className="profile-img" style={{backgroundImage:`url(${user?.avatar})`}}></div>
          <div className="profile-information">
            <div className="profile-name">{user?.name}</div>
            <div className="profile-rank">{user?.rating}RT</div>
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
        setPage('main')
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
    const [engine] = init(window, canvas);

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
