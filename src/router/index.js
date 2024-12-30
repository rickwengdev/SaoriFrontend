import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/HomePage.vue';
import Dashboard from '../components/DashboardPage.vue';
import Guildmenber from '../components/Guildmenber.vue';
import LogChannelPage from '../components/LogChannelPage.vue';
import DynamicVoiceChannelPage from '../components/DynamicVoiceChannelPage.vue';
import ReactionRolePage from '../components/ReactionRolePage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
  },
  {
    path: '/:serverId/guildmenber',
    name: 'guildmenber',
    component: Guildmenber,
    props: true, // 自動將路由參數作為屬性傳遞到組件
  },
  {
    path: '/:serverId/logchannel',
    name: 'logchannel',
    component: LogChannelPage,
    props: true,
  },
  {
    path: '/:serverId/dynamicvoicechannel',
    name: 'dynamicvoicechannel',
    component: DynamicVoiceChannelPage,
    props: true,
  },
  {
    path: '/:serverId/reactionrole',
    name: 'reactionrole',
    component: ReactionRolePage,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;