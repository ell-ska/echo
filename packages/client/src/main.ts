import { Toaster } from './components/toaster'
import { Params, Router } from './core/router'
import { UnauthenticatedLayout } from './layouts/unauthenticated'
import { CapsulePage } from './pages/capsule'
import { CreateCapsulePage } from './pages/create-capsule'
import { ExplorePage } from './pages/explore'
import { LogInPage } from './pages/log-in'
import { RegisterPage } from './pages/register'
import { TemporaryPage } from './pages/temporary'
import './style.css'

export const router = new Router({
  routes: {
    '/': () =>
      new UnauthenticatedLayout({ children: [new ExplorePage().element] }),
    '/sent': () => new TemporaryPage(),
    '/received': () => new TemporaryPage(),
    '/capsule/create': () => new CreateCapsulePage(),
    '/capsule/:id': (params) =>
      new UnauthenticatedLayout({
        children: [new CapsulePage({ params: params as Params }).element],
      }),
    '/capsule/:id/edit': () => new TemporaryPage(),
    '/profile': () => new TemporaryPage(),
    '/profile/edit': () => new TemporaryPage(),
    '/auth/register': () =>
      new UnauthenticatedLayout({
        children: [new RegisterPage().element],
      }),
    '/auth/log-in': () =>
      new UnauthenticatedLayout({
        children: [new LogInPage().element],
      }),
  },
  outletSelector: '#app',
  notFoundHandler: () => new TemporaryPage(),
})

const toaster = new Toaster()
toaster.mount(document.body)
