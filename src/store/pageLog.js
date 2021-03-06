import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/firestore'

const state = {
  all: []
}
const getters = {
  /**
   * Returns pagelog
   */
  latest: (context) => () => {
    return context.all.slice(0, 10)
  }
}
const mutations = {
  patchLog (context, { data }) {
    // Ingore e2e testing site from the results
    if (data.siteid === 'e2e-testing') return
    // Add to all if not found
    if (context.all.length === 0) context.all.push(data)
    else {
      var filtered = context.all.filter((value, index, arr) => {
        if ((value.siteid + '.' + value.pageid) === (data.siteid + '.' + data.pageid)) {
          return false
        }
        return true
      })
      // filtered = filtered.reverse()
      filtered.push(data)
      // filtered = filtered.reverse()
      Vue.set(context, 'all', filtered)
    }
  }
}
const actions = {
  init (context) {
    // console.log('pagelog/init')

    const db = firebase.firestore()

    db.collection('pagelog').orderBy('timestamp', 'desc').onSnapshot((querySnapshot) => { /* where('silent', '==', false). */
      querySnapshot.forEach((doc) => {
        context.commit('patchLog', { data: doc.data() })
      })
    })
  },
  stamp (context, { action, pageid, siteid, authorNick, authorID, silent }) {
    // console.log('pagelog/stamp', action, pageid, siteid, authorID)
    const silenced = !!silent
    // console.log('updating firestore for', siteid, pageid
    var log = {
      action: action,
      pageid: pageid,
      siteid: siteid,
      creator: authorNick,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      silent: silenced
    }

    // Stamp to global pagelog
    const db = firebase.firestore()
    const logRef = db.collection('pagelog').doc(siteid + '.' + pageid)
    logRef.set(log)

    // Stamp to author pagelog
    const authorRef = db.collection('profiles').doc(authorID)
    const authorPageLogRef = authorRef.collection('pagelog').doc(siteid + '.' + pageid)
    authorPageLogRef.set(log)
  }
}
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
