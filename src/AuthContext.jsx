import { createStore } from 'solid-js/store';
import { createContext, useContext, onMount } from 'solid-js';
import { url } from './modules/pbConnection';
import refreshAuthorization from './modules/refreshAuthorization';
import logIn from './modules/logIn';
import getLocalToken from './modules/getLocalToken';

export const PocketContext = createContext();

// login maneja states {1: 'refetch', 2: 'loading', 3: 'OK', 4: 'error'}

export function PocketProvider(props) {
  const [ login, setLogin ] = createStore({state:'refetch',user: false, token: false}),
    getAuthorization = async (username, password) => {
      setLogin({ state: 'loading'});
      const data = await logIn(url, username, password);
      data.token ? setLogin({state: 'authorized', user: data.record}) : setLogin({state: 'error'});
    },
    clearAuthorization = () => (sessionStorage.clear(),setLogin({state: 'refetch'})),
    authData = [
      login,
      getAuthorization,
      clearAuthorization,
    ];

  onMount( () => {
    const data = getLocalToken();
    if (data){
      setLogin({ state: 'loading' });
      refreshAuthorization(url, data.token)
        .then( e => {
          e.token ? setLogin({state: 'authorized', user: e.record, token: e.token}) : (sessionStorage.clear(),setLogin({state: 'error'}));
        });}
    else setLogin({state: 'refetch'});
  });
    
  return (
    <PocketContext.Provider value={authData}>
      {props.children}
    </PocketContext.Provider>
  );
}

export function usePocket() { return useContext(PocketContext); }