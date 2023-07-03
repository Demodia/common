import {html, svg, render} from 'https://unpkg.com/uhtml?module';

export default function StateMaster(State, Path = window.location.pathname, Routes = State.Routes || [], Effects = [], Calcs = []) {
  // Retrieve state from local storage.
  if (State.LocalStorageKey && localStorage.getItem(State.LocalStorageKey)) {
    State =  {...State,...JSON.parse(localStorage.getItem(State.LocalStorageKey))} 
  }
  
  // Built-In State Methods
  State.GetState = prop => prop === undefined ? {...State} : {...State}[prop];
  State.ToJSON = () => JSON.stringify(State);
  State.HTML = html;
  State.SVG = svg;
  State.Navigate = path => event => {
    event.preventDefault();
    Path = path || event.target.attributes.href.value;
    window.history.pushState({ Path }, Path, `${Path}`);
    Render();
  };
  State.SetInterval = (moment,...transformers) => setInterval(_ => State.Update(...transformers),moment);
  State.SetTimeout = (moment,...transformers) => setTimeout(_ => State.Update(...transformers),moment);
  State.AddEffect = (effect,list) => {
    if(!Effects.some(e => e[0].toString() === effect.toString() && e[1] === list)) Effects.push([effect,list]);
  }
  State.AddCalculation = (calc,list) => {
    if(!Calcs.some(c => c[0].toString() === calc.toString() && c[1] === list)) Calcs.push([calc,list]);
  }

  // Setup event listeners
  setupEventListeners();

  State.Update = (...transformers) => {
    if (State.Before) updateState(State.Before);
    
    updateState(...transformers);
    
    if (State.After) updateState(State.After);

    if (State.LocalStorageKey){
      const localState = {...State};
      if(State.LocalStorageBlackList){
        State.LocalStorageBlackList.split(",").forEach(key => delete localState[key]);
      }
      localStorage.setItem(State.LocalStorageKey,JSON.stringify(localState));
    }

    if (State.Debug) console.log(State.ToJSON());
   
    Render();
  };
  
  // Run any setup code once and then render the initial state
  if (State.Initiate) updateState(State.Initiate)
  State.View(State);
  updateState(State);
  if (State.Debug) console.log(State.ToJSON());
  Render();
       
  // Helper functions
  function updateState(...transformers){
    State = transformers.reduce((state,transformer) => {
      const {Update,HTML,SVG,GetState,ToJSON,Navigate,SetInterval,SetTimeout,Content,AddEffect,AddCalculation...newState} = typeof(transformer) === "function" ? transformer(state) : transformer;
      update(state,newState);
      Effects.filter(effect => !effect[1] || effect[1].split(",").some(prop => newState.hasOwnProperty(prop))).forEach(effect => effect[0](state));    
      Calcs.filter(calc => !calc[1] || calc[1].split(",").some(prop => newState.hasOwnProperty(prop))).forEach(calc => update(state,calc[0](state)));
      return state
    },State);
  }

  function update(oldObj,newObj){
    Object.entries(newObj).forEach(([prop,value]) => oldObj[prop]  = value)
  }

  function setupEventListeners() {
    window.addEventListener("popstate", event => {
      Path = window.location.pathname;
      Render();
    });
  }

  function findRoute(path) {
    return (path === '/' ? ['/'] : path.split('/').filter(char => char !== ''))
    .reduce(
      (obj, path) => {     
       const param = obj.routes.find(r => r.path[0] === ':');
       return obj.routes.find(r => r.path === path)
          ? {...obj.routes.find(r => r.path === path),params: obj.params}
          : { ...param, params: {...obj.params,[param.path.slice(1)]: path} }
      },{ routes: Routes }
    );
  }

  function Render() {
    if (Routes.length){
      const route = findRoute(Path);
      document.title = route.title || document.title
      if (route.update) {
        updateState(route.params ? route.update(route.params) : route.update);
      }
      if (route.view) {
        State.Content = route.view(State);
      }
    }
    render(State.Element || document.body, State.View(State));
  }
  
  return State.Update
}
