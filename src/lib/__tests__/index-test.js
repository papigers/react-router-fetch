/* global describe, it, expect */
import React, { Component } from 'react'
import Loadable from 'react-loadable'

import reactRouterPreloadFetch from 'lib/index'

const App = (props) => (
  <div />
)
class Home extends Component {
  render () {
    return (
      <div>Home</div>
    )
  }
}

class HomeFetch extends Component {
  static fetch () {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1000, { test: '1234' })
    })
  }
  render () {
    return (
      <div>Home</div>
    )
  }
}

const HomeLoadableFetch = Loadable({
  loader: () => new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, Home)
  }),
  loading: () => null
})
HomeLoadableFetch.fetch = HomeFetch.fetch

const HomeLoadable = Loadable({
  loader: () => new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, Home)
  }),
  loading: () => null
})

const HomeLoadableMap = Loadable.Map({
  loader: {
    HomeFetch: () => new Promise((resolve, reject) => {
      setTimeout(resolve, 1200, HomeFetch)
    }),
    Home: () => new Promise((resolve, reject) => {
      setTimeout(resolve, 1000, Home)
    })
  },
  loading: () => null,
  render: (loaded, props) => {
    let Home = loaded.HomeFetch
    let Home2 = loaded.Home
    return (
      <div>
        <Home {...props} />
        <Home2 {...props} />
      </div>
    )
  }
})

const routesFetch = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: HomeFetch
      }
    ]
  }
]

const routesPreload = [
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

const routesPreloadMap = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: HomeLoadableMap
      }
    ]
  }
]

const routesPreloadFetch = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: HomeLoadableFetch
      }
    ]
  }
]

const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Home
      }
    ]
  }
]

const routesNoMatch = [
  {
    path: '/',
    exact: true,
    component: App
  }
]

describe('react-router-preload-fetch', function () {
  it('can be imported', function () {
    expect(reactRouterPreloadFetch).toBeTruthy()
  })
  it('will call fetch on a route handler if it has one', function (done) {
    reactRouterPreloadFetch(routesFetch, { pathname: '/' })
      .then((results) => {
        expect(results[0].fetch.test).toBe('1234')
        done()
      })
  })
  it('will call preload on a route handler if it has one: Loadable', function (done) {
    reactRouterPreloadFetch(routesPreload, { pathname: '/' })
      .then((results) => {
        expect(results[0].preload).toBe(Home)
        done()
      })
  })
  it('will call preload on a route handler if it has one: LoadableMap', function (done) {
    reactRouterPreloadFetch(routesPreloadMap, { pathname: '/' })
      .then((results) => {
        expect(results[0].preload).toContain(Home)
        expect(results[0].preload).toContain(HomeFetch)
        done()
      })
  })
  it('will call preload and fetch on a route handler if it has both', function (done) {
    reactRouterPreloadFetch(routesPreloadFetch, { pathname: '/' })
      .then((results) => {
        expect(results[0].preload).toBe(Home)
        expect(results[0].fetch.test).toBe('1234')
        done()
      })
  })
  it('will resolve with empty if no fetch or preload exists', function (done) {
    reactRouterPreloadFetch(routes, { pathname: '/' })
      .then((results) => {
        expect(results).toBeUndefined()
        done()
      })
  })
  it('will resolve with empty if no match', function (done) {
    reactRouterPreloadFetch(routesNoMatch, { pathname: '/test' })
      .then((results) => {
        expect(results).toBeUndefined()
        done()
      })
  })
})
