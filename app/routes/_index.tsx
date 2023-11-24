import { json, type ActionFunction, type MetaFunction, LoaderFunction } from "@remix-run/node";
import { FC, createContext, useContext, useEffect, useState } from "react";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";
import { Engine } from "babylonjs";
import { init } from "~/logic/canvas";
import { lng } from "~/data/lang";

export const meta: MetaFunction = () => {
  return [
    { title: "omok.io" },
    { name: "description", content: "Online gomoku play" },
  ];
};

export const GlobalContext = createContext<any>({});

export const action:ActionFunction = async ({request}) => {
  const jsn = request.json() as unknown as req;
  console.log(jsn.mode);
  let res;
  switch(jsn.mode){
    case 'getUser':
      res = await getUser('id', jsn.id as string);
      break;
    case 'createUser':
      res = await createUser(jsn.user as unknown as User);
      break;
    case 'updateUser':
      res = await updateUser(jsn.id as string, jsn.user as unknown as User);
      break;
    case 'deleteUser':
      res = await deleteUser(jsn.id as string);
      break;
    default:
      res = null;
      break;
  }
  return res;
}

export default function Index() {
  const [hydra, setHydra] = useState<boolean>(false);
  const [user, setUser] = useState<User|null>(null);
  const [lang, setLang] = useState<string>('ko');
  const [page, setPage] = useState<Page>('login');

  useEffect(() => {
    setHydra(true);

    let userId = localStorage.getItem('userId')
    if(userId){
      const formData = new FormData()
      formData.append('mode', 'getUser')
      formData.append('id', userId)
      fetch(`/?index`, {
        method: 'POST',
        body: formData
      }).then(res => res.json()).then((res:{res:User}) => {
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
  return <>
    <h1>omok.io</h1>
    <p>Online gomoku play</p>
    <p>omok.io is a free online gomoku play site.</p>
    <p>It is currently under development.</p>
    <p>Thank you for your interest.</p>
  </>
}

const Login:FC = () => {
  const {user, setUser} = useContext(GlobalContext);
  const {page, setPage} = useContext(GlobalContext);
  const {lang, setLang} = useContext(GlobalContext);
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const login = () => {
    fetch(`/?index`, {method: 'GET'}).then(res => res.json()).then((res:{res:User}) => {
      if(res.res){
        if(res.res.password === password){
          localStorage.setItem('userId', res.res.id)
          setUser(res.res)
        }else{
          setError('wrong password')
        }
      }else{
        setError('cant find account')
      }
    })
  }

  const register = () => {
    fetch(`/?index`, {
      method: 'POST',
      body: JSON.stringify({mode: 'createUser', user: {name, password}})
    }).then(res => {
      console.log(res)
      return res.json()
    }).then((res:{res:User}) => {
      if(res.res){
        localStorage.setItem('userId', res.res.id)
        setUser(res.res)
      }else{
        setError('already used id')
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
    <div className="login-page">
      <canvas id="renderCanvas"></canvas>
      <div>
        <input type="text" name="name" id="" value={name} placeholder="Nickname"
        onChange={e => {setName(e.target.value);setError('')}}/>
        <input type="password" name="password" id="" value={password} placeholder="Password"
        onChange={e => {setPassword(e.target.value);setError('')}}/>
        {page === 'login' ? <button onClick={() => {login()}}>Login</button>:
        page === 'register' && <button onClick={() => {register()}}>Register</button>}
        <div className="switch" onClick={e => {
          if(page === 'login'){setPage('register')}else{setPage('login')}
        }}>{lng(lang, page === 'login' ? 'to register' : 'to login')}</div>
        <div className="errorline">{error}</div>
      </div>
    </div>
  </>
}
