import board from './components/board.js'
import login from './components/login.js'
import register from './components/register.js'
import addlist from './components/addlist.js'
import summary from './components/summary.js'



const name = localStorage.getItem('name')
const routes = [
  { path: '/board/:name', component: board},
  { path: '/sign_in', component: login },
  { path: '/sign_up', component: register },
  { path: `/bo*/${name}`, component: board},
  { path: '/addlist', component: addlist },
  { path: `/board/:name/summary`, component: summary}
]

const router = new VueRouter({
  routes,
  base: '/',
})

const app = new Vue({
  el: '#app',
  router,
})
