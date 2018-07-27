react-router-preload-fetch
=====================
module to loop through matched react router handler to call fetch and preload methods for specifying data needs at the handler level with support to [react-loadable](https://github.com/jamiebuilds/react-loadable).

<!--
[![Dependency Status](https://david-dm.org/kellyrmilligan/react-router-fetch.svg)](https://david-dm.org/kellyrmilligan/react-router-fetch)
[![Build Status](https://travis-ci.org/kellyrmilligan/react-router-fetch.svg?branch=master)](https://travis-ci.org/kellyrmilligan/react-router-fetch)
[![Coverage Status](https://coveralls.io/repos/github/kellyrmilligan/react-router-fetch/badge.svg?branch=master)](https://coveralls.io/github/kellyrmilligan/react-router-fetch?branch=master)
-->

## react-router-fetch
This is a fork of [react-router-fetch](https://github.com/kellyrmilligan/react-router-fetch) that extends support for react-loadable to prevent navigation until loading is complete.
Most of the documentation is taken from the fork and edited to explain the module additions.

## Why?
Taken from `react-router-fetch`:
> I wanted a nice and contained module to be able to initiate requests for route handlers in an app, so that the data would be loaded before the route handler was rendered. This module doesn't accomplish that on it's own, but can be used as a part of a solution to that problem.

This module takes inspiration from `react-router-fetch` to suppport `react-loadable` so that the data **AND** the component would be loaded before the route handler was rendered.
This would be useful for people using `react-loadable` to perform Code Splitting as described [here](https://reacttraining.com/react-router/web/guides/code-splitting).


## Usage
react router fetch preload wraps [react-router-config](https://www.npmjs.com/package/react-router-config) `matchRoutes`. It then will go through the routes in a similar fashion as the `README` suggests.
```js
// Home.js
class Home extends Component {
  static fetch () {

  }
  render () {
    return (
      <div>Home</div>
    )
  }
}

// index.js
const App = (props) => (
  <div />
)

const HomeLoadable = Loadable({
  loader: () => import('./Home.js'),
  loading: () => null,
})

HomeLoadable.fetch = function fetch() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, { test: '1234' })
  })
}

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: HomeLoadable
      }
    ]
  }
]

reactRouterFetch(routes, { pathname: '/' })
  .then((results) => {
    //the results of the fetching and preloading are also here if you need them.
    //each result is in the form of { preload, fetch }.
  })
```

in a component you would want to pass the `this.props.location` from react-router in order to have full access to that in the static fetch method on the component.


## Specifying route data needs
This allows you to specify at the route handler level what data that route needs via a static fetch method. The fetching itself should be wired up to redux via thunks, or whatever way you want to handle that. the only requirement is that the static method returns a promise.

```js
// Page.js
import React, { Component } from 'react'

export default class Page extends Component {
  render() {
    //your stuff
  }
}

...

// LoadablePage.js
import Loadable from 'react-loadable'

const LoadablePage = Loadable({
  loader: () => import('./Page.js'),
  loading: () => null,
});

// creating static fetch method that would be called before rending the route.
LoadablePage.fetch =  function fetch(match, location, options) {
  //return a promise to be resolved later, superagent as an example
  return request('GET', '/search')
}

```

This module is intended to be a building block for other modules or as a low level part of your application.

## Using in a top level component
Assuming you have a top level component, you can export it using `withRouter` to get the location prop injected into your component.

```js
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import reactRouterPreloadFetch from 'react-router-preload-fetch'

class App extends Component {

  state = {
    isAppFetching: false,
    appFetchingError: null
  }

  componentWillMount () {
    this.fetchRoutes(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const current = `${this.props.location.pathname}${this.props.location.search}`
    const next = `${nextProps.location.pathname}${nextProps.location.search}`
    if (current === next) {
     return
    }
    this.preloadFetchRoutes(nextProps)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !nextState.isAppFetching
  }

  preloadFetchRoutes (props) {
    const { dispatch, location } = props
    this.setState({
      isAppLoading: true,
      appLoadingError: null
    })
    //maybe show a progress bar somewhere outside of react? go nuts!!
    reactRouterPreloadFetch(routeConfig, location, { dispatch })
      .then((results) => {
        this.setState({
          isAppLoading: false
        })
      })
      .catch((err) => {
        this.setState({
          isAppLoading: false,
          appLoadingError: err
        })
      })
  }

  render () {
    //do something with isAppLoading for the first render if single page app.
    // after the first render, the page contents will stay put until the next route's component and data is ready to go, so you'll have to do something outside of this.
    return (
      ...
    )
  }

}


const connectedApp = connect()(App)
export default withRouter(connectedApp)

```
