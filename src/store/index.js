import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    editPwdCode: null
  },
  mutations: {
    setPwdCode (state, param) {
      state.editPwdCode = param
    }
  }
})
export default store
