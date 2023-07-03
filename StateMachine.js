import { html, svg, render } from 'https://unpkg.com/uhtml?module';

export default function StateMachine(state, currentPath = window.location.pathname, routes = state.Routes || [], effects = [], calculations = []) {
  // Retrieve state from local storage.
  if (state.localStorageKey && localStorage.getItem(state.localStorageKey)) {
    state = { ...state, ...JSON.parse(localStorage.getItem(state.localStorageKey)) };
  }

  // Built-In State Methods
  state.evaluate = prop => (prop === undefined ? { ...state } : { ...state }[prop]);
  state.toJSON = () => JSON.stringify(state);
  state.toHTML = html;
  state.toSVG = svg;
  state.navigate = path => event => {
    event.preventDefault();
    currentPath = path || event.target.attributes.href.value;
    window.history.pushState({ currentPath }, currentPath, `${currentPath}`);
    renderState();
  };
  window.addEventListener('popstate', event => {
    currentPath = window.location.pathname;
    renderState();
  });
  state.schedule = (interval, ...transformers) => setInterval(_ => state.update(...transformers), interval);
  state.delay = (interval, ...transformers) => setTimeout(_ => state.update(...transformers), interval);
  state.effect = (effect, list) => {
    if (!effects.some(e => e[0].toString() === effect.toString() && e[1] === list)) effects.push([effect, list]);
  };
  state.calculate = (calc, list) => {
    if (!calculations.some(c => c[0].toString() === calc.toString() && c[1] === list)) calculations.push([calc, list]);
  };
  state.update = (...transformers) => {
    if (state.beforeUpdate) setState(state.beforeUpdate);

    setState(...transformers);

    if (state.afterUpdate) setState(state.afterUpdate);

    if (state.localStorageKey) {
      const localState = { ...state };
      if (state.localStorageBlackList) {
        state.localStorageBlackList.split(',').forEach(key => delete localState[key]);
      }
      localStorage.setItem(state.localStorageKey, JSON.stringify(localState));
    }

    if (state.debug) console.log(state.toJSON());

    renderState();
  };

  // Run any setup code once and then render the initial state
  if (state.init) setState(state.init);
  state.view(state);
  setState(state);
  if (state.debug) console.log(state.toJSON());
  renderState();

  // Helper functions
  function update(oldObj, newObj) {
    Object.entries(newObj).forEach(([prop, value]) => (oldObj[prop] = value));
  }

  function setState(...transformers) {
    state = transformers.reduce((state, transformer) => {
      const { update, toHTML, toSVG, evaluate, toJSON, navigate, schedule, delay, content, effect, calculate, ...newState } = typeof transformer === 'function' ? transformer(state) : transformer;
      update(state, newState);
      effects.filter(effect => !effect[1] || effect[1].split(',').some(prop => newState.hasOwnProperty(prop))).forEach(effect => effect[0](state));
      calculations.filter(calc => !calc[1] || calc[1].split(',').some(prop => newState.hasOwnProperty(prop))).forEach(calc => update(state, calc[0](state)));
      return state;
    }, state);
  }

  const findRoute = path =>
    (path === '/' ? ['/'] : path.split('/').filter(char => char !== '')).reduce(
      (obj, path) => {
        const param = obj.routes.find(r => r.path[0] === ':');
        return obj.routes.find(r => r.path === path) ? { ...obj.routes.find(r => r.path === path), params: obj.params } : { ...param, params: { ...obj.params, [param.path.slice(1)]: path } };
      },
      { routes: routes }
    );

  function renderState() {
    if (routes.length) {
      const route = findRoute(currentPath);
      document.title = route.title || document.title;
      if (route.update) {
        setState(route.params ? route.update(route.params) : route.update);
      }
      if (route.view) {
        state.content = route.view(state);
      }
    }
    render(state.element || document.body, state.view(state));
  }

  return state.update;
}
