import { html, svg, render } from 'https://unpkg.com/uhtml?module';

/**
 * StateMachine is a state management library that provides a simple and efficient way to manage state in JavaScript applications.
 * @param {Object} initialState - The initial state of the application.
 * @param {string} initialPath - The initial path of the application.
 * @param {Array} initialRoutes - The initial routes of the application.
 * @param {Array} initialEffects - The initial effects of the application.
 * @param {Array} initialCalcs - The initial calculations of the application.
 * @returns {Function} The Update function that can be used to update the state.
 */
export default function StateMachine(initialState, initialPath = window.location.pathname, initialRoutes = initialState.Routes || [], initialEffects = [], initialCalcs = []) {
  // Copy the initial state, path, routes, effects, and calculations to prevent mutation
  let State = { ...initialState };
  let Path = initialPath;
  const Routes = [...initialRoutes];
  const Effects = [...initialEffects];
  const Calcs = [...initialCalcs];

  // Retrieve state from local storage if available
  if (State.LocalStorageKey && localStorage.getItem(State.LocalStorageKey)) {
    State = { ...State, ...JSON.parse(localStorage.getItem(State.LocalStorageKey)) };
  }

  // Built-In State Methods
  // GetState: Returns a copy of the current state or a specific property of the state
  State.GetState = prop => (prop === undefined ? { ...State } : { ...State }[prop]);
  // ToJSON: Returns the current state as a JSON string
  State.ToJSON = () => JSON.stringify(State);
  // HTML and SVG: Functions from the uhtml library for creating HTML and SVG elements
  State.HTML = html;
  State.SVG = svg;
  // Navigate: Changes the current path and updates the state
  State.Navigate = path => event => {
    event.preventDefault();
    Path = path || event.target.attributes.href.value;
    window.history.pushState({ Path }, Path, Path);
    Render();
  };
  // SetInterval and SetTimeout: Create intervals and timeouts that update the state
  State.SetInterval = (interval, ...transformers) => setInterval(() => State.Update(...transformers), interval);
  State.SetTimeout = (timeout, ...transformers) => setTimeout(() => State.Update(...transformers), timeout);
  // AddEffect and AddCalculation: Add effects and calculations to the state
  State.AddEffect = (effect, list) => {
    if (!Effects.some(e => e[0].toString() === effect.toString() && e[1] === list)) Effects.push([effect, list]);
  };
  State.AddCalculation = (calc, list) => {
    if (!Calcs.some(c => c[0].toString() === calc.toString() && c[1] === list)) Calcs.push([calc, list]);
  };

  // Setup event listeners for popstate events
  setupEventListeners();

  /**
   * Update the state with the given transformers.
   * @param  {...any} transformers - The transformers to update the state with.
   */
  State.Update = (...transformers) => {
    if (State.Before) updateState(State.Before);

    updateState(...transformers);

    if (State.After) updateState(State.After);

    if (State.LocalStorageKey) {
      const localState = { ...State };
      if (State.LocalStorageBlackList) {
        State.LocalStorageBlackList.split(',').forEach(key => delete localState[key]);
      }
      localStorage.setItem(State.LocalStorageKey, JSON.stringify(localState));
    }

    if (State.Debug) console.log(State.ToJSON());

    Render();
  };

  // Run any setup code once and then render the initial state
  if (State.Initiate) updateState(State.Initiate);
  State.View(State);
  updateState(State);
  if (State.Debug) console.log(State.ToJSON());
  Render();

  // Helper functions
  /**
   * Update the state with the given transformers.
   * @param  {...any} transformers - The transformers to update the state with.
   */
  function updateState(...transformers) {
    State = transformers.reduce((state, transformer) => {
      const { Update, HTML, SVG, GetState, ToJSON, Navigate, SetInterval, SetTimeout, Content, AddEffect, AddCalculation, ...newState } = typeof transformer === 'function' ? transformer(state) : transformer;
      return { ...state, ...newState };
    }, State);

    Effects.filter(effect => !effect[1] || effect[1].split(',').some(prop => State.hasOwnProperty(prop))).forEach(effect => effect[0](State));
    Calcs.filter(calc => !calc[1] || calc[1].split(',').some(prop => State.hasOwnProperty(prop))).forEach(calc => (State = { ...State, ...calc[0](State) }));
  }

  /**
   * Setup event listeners for popstate events.
   */
  function setupEventListeners() {
    window.addEventListener('popstate', () => {
      Path = window.location.pathname;
      Render();
    });
  }

  /**
   * Find the route for a given path.
   * @param {string} path - The path to find the route for.
   * @returns {Object} The route for the given path.
   */
  function findRoute(path) {
    return (path === '/' ? ['/'] : path.split('/').filter(char => char !== '')).reduce(
      (obj, path) => {
        const param = obj.routes.find(r => r.path[0] === ':');
        return obj.routes.find(r => r.path === path) ? { ...obj.routes.find(r => r.path === path), params: obj.params } : { ...param, params: { ...obj.params, [param.path.slice(1)]: path } };
      },
      { routes: Routes }
    );
  }

  /**
   * Render the current state to the DOM.
   */
  function Render() {
    if (Routes.length) {
      const route = findRoute(Path);
      document.title = route.title || document.title;
      if (route.update) {
        updateState(route.params ? route.update(route.params) : route.update);
      }
      if (route.view) {
        State.Content = route.view(State);
      }
    }
    render(State.Element || document.body, State.View(State));
  }

  return State.Update;
}
