
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/tasks', component: () => import('pages/TaskList.vue'), name: 'taskList', },
      { path: '/tasks/:id', component: () => import('pages/TaskDetail.vue'), name: 'taskDetail' },
      { path: '/tasks/create', component: () => import('pages/TaskDetail.vue'), name: 'create', },
      { path: '/login', component: () => import('pages/Login.vue') },
      { path: '/settings', component: () => import('pages/Settings.vue'), name: 'settings' },
      { path: '/categories', component: () => import('pages/CategoryList.vue'), name: 'categoryList' },
      { path: '/lists', component: () => import('pages/Lists.vue'), name: 'lists' },
    ]
  }
]

// Always leave this as last one
// if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
// }

export default routes
