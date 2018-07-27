import { matchRoutes } from 'react-router-config'

function reactRouterPreloadFetch (routes, location, options) {
  const branch = matchRoutes(routes, location.pathname)
  if (branch.length > 0) {
    const promises = branch
      .filter(({ route }) => route.component && (route.component.fetch || route.component.preload))
      .map(({ route, match }) => {
          return Promise.all([
            route.component.fetch ? route.component.fetch(match, location, options) : undefined,
            route.component.preload ? route.component.preload() : undefined
          ]).then((results) => {
            return {
              fetch: results[0],
              preload: results[1]
            }
          })
      })
    if (promises && promises.length > 0) {
      return Promise.all(promises)
    } else {
      return Promise.resolve()
    }
  } else {
    return Promise.resolve()
  }
}

export default reactRouterPreloadFetch
