import { ComponentWithProps } from './component'

type Params = Record<string, string>
type Page = ComponentWithProps
type RouteHandler = (params?: Params) => Page
type Route = {
  path: string
  handler: RouteHandler
  regex: RegExp
  params: string[]
}

export class Router {
  private routes: Route[] = []
  private outlet: Element
  private notFoundHandler: RouteHandler

  constructor({
    routes,
    outletSelector,
    notFoundHandler,
  }: {
    routes: Record<string, RouteHandler>
    outletSelector: string
    notFoundHandler: RouteHandler
  }) {
    const outlet = document.querySelector(outletSelector)
    if (!outlet) throw new Error('router outlet not found')
    this.outlet = outlet

    this.notFoundHandler = notFoundHandler

    this.routes = Object.entries(routes).map(([path, handler]) =>
      this.createRoute({ path, handler })
    )

    window.addEventListener('popstate', () => this.handleRoute())
    this.handleRoute()
  }

  navigate(path: string) {
    history.pushState({}, '', path)
    this.handleRoute()
  }

  private createRoute({
    path,
    handler,
  }: {
    path: string
    handler: RouteHandler
  }) {
    const params: string[] = []

    // replace :name with a capturing group
    const regexPath = path.replace(/:([^/]+)/g, (_, name) => {
      params.push(name)
      return '([^/]+)'
    })

    const regex = new RegExp(`^${regexPath}$`)
    return { path, handler, regex, params }
  }

  private handleRoute() {
    const path = window.location.pathname

    for (const route of this.routes) {
      const match = path.match(route.regex)
      if (match) {
        const params: Params = {}

        route.params.forEach((name, index) => {
          params[name] = match[index + 1]
        })

        this.render(route.handler(params))
        return
      }
    }

    this.render(this.notFoundHandler())
  }

  private render(page: Page) {
    this.outlet.innerHTML = ''
    page.mount(this.outlet)
  }
}
