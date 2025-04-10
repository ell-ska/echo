import { Router } from './core/router'
import { TemporaryPage } from './pages/temporary'
import './style.css'

export const router = new Router({
  routes: {
    '/': () => new TemporaryPage(),
    '/sent': () => new TemporaryPage(),
    '/received': () => new TemporaryPage(),
    '/capsule/:id': () => new TemporaryPage(),
    '/capsule/create': () => new TemporaryPage(),
    '/capsule/edit': () => new TemporaryPage(),
    '/profile': () => new TemporaryPage(),
    '/profile/edit': () => new TemporaryPage(),
    '/auth/register': () => new TemporaryPage(),
    '/auth/log-in': () => new TemporaryPage(),
  },
  outletSelector: '#app',
  notFoundHandler: () => new TemporaryPage(),
})
