// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.prototype.$THREE = THREE
Vue.prototype.$Stats = Stats
Vue.prototype.$WEBGL = WEBGL

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
