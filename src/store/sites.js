import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import Vue from 'vue'

// const LS_SITE_LIST = 'store/site/list'

const state = {
  list: {},
  description: {},
  loading: false,
  activeSiteID: null,
  posterURL: null
}
const getters = {
  /**
   * Returns pagelog (filtered with user if needed)
   */
  list: (context) => () => {
    return context.list
  },
  description: (contex) => () => {
    return contex.description
  },
  posterURL: (context) => () => {
    return context.posterURL
  },
  sitePosterURL: (context) => (siteid) => {
    return context.list[siteid].fullPosterURL
  },
  activeSiteID: (contex) => () => {
    return contex.activeSiteID
  }
}
const mutations = {
  /**
     * Adds a Site to site listing, with doc.key as it's JSON key value with
     * Vue.set() to force the refresh of the object
     * @param {*} state Vuex store.state
     * @param {*} param1 firebase Sites json { doc.key(), doc.data() }
     */
  patchSite (state, { key, data }) {
    if (data.link === null ||
      typeof data.link === 'undefined') {
      data.link = key + '.' + key
    }
    Vue.set(state.list, key, data)
  },
  setList (context, list) {
    Vue.set(context, 'list', list)
  },
  setDescription (context, desc) {
    Vue.set(context, 'description', desc)
  },
  setActiveSite (context, id) {
    Vue.set(context, 'activeSiteID', id)
  },
  setPosterURL (context, url) {
    Vue.set(context, 'posterURL', url)
  },
  setSitePosterURL (context, { siteid, posterURL }) {
    Vue.set(context.list[siteid], 'fullPosterURL', posterURL)
  }
}
const actions = {
  /**
     * Updates store.Sites metadata from firebase snapshot
     * @param {*} contex Vuex context
     */
  init (context) {
    /* const cachedList = window.localStorage.getItem(LS_SITE_LIST)
    if (cachedList) {
      try {
        context.commit('setList', JSON.parse(cachedList))
      } catch (e) {
        context.commit('error', e.message, { root: true })
      }
    } */

    const db = firebase.firestore()
    db.collection('sites').orderBy('lastUpdate', 'desc').onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // If the site is nonlisted, we do not read any data to Sites store!
        if (doc.data().nonlisted !== true) {
          context.commit('patchSite', { key: doc.id, data: doc.data() })

          if (doc.data().posterURL) {
            // Get a reference to the storage service, which is used to
            // create references in your storage bucket
            const storage = firebase.storage()
            var pathRef = storage.ref(doc.id + '/' + doc.data().posterURL)
            pathRef.getDownloadURL().then((url) => {
              context.commit('setSitePosterURL', { siteid: doc.id, posterURL: url })
            }).catch((err) => {
              this.message = doc.id + '/' + doc.data().posterUR + ' not found.' + err
              // console.log(err.message)
            })
          } else {
            context.commit('setSitePosterURL', { siteid: doc.id, posterURL: null })
          }
        }
      })
      // window.localStorage.setItem(LS_SITE_LIST, JSON.stringify(context.state.list))
    })
  },
  /**
   * Opens a site for editing, viewing - with all child attributes
   * @param {*} siteid firebase id for the site
   */
  openSite (context, siteid) {
    const db = firebase.firestore()

    // context.commit('loading', true)
    // context.commit('flushOwners')

    db.collection('sites').doc(siteid).get().then((doc) => {
      if (doc.exists) {
        context.commit('setActiveSite', doc.id)
        context.commit('setDescription', doc.data().description)

        if (doc.data().posterURL) {
          // Get a reference to the storage service, which is used to
          // create references in your storage bucket
          const storage = firebase.storage()
          var pathRef = storage.ref(siteid + '/' + doc.data().posterURL)
          pathRef.getDownloadURL().then((url) => {
            context.commit('setPosterURL', url)
          }).catch((err) => {
            this.message = siteid + '/' + doc.data().posterUR + ' not found.' + err
            // console.log(err.message, this.message)
          })
        } else {
          context.commit('setPosterURL', null)
        }
      }
    })
  },
  setDescription (context, description) {
    const siteid = context.getters.activeSiteID()

    const db = firebase.firestore()
    db.collection('sites').doc(siteid).update({ description: description })

    context.commit('setDescription', description)
  },
  createSite (context, { siteid, name, description, author, nick }) {
    if (!exists(siteid)) {
      context.commit('error', 'Can not create site without a site id', { root: true })
      return
    }

    description = exists(description) ? description : 'A new site'

    const site = {
      description: description,
      hidden: false,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
      locked: true,
      name: name,
      theme: 'Skald'
    }

    const db = firebase.firestore()
    const siteRef = db.collection('sites').doc(siteid)

    siteRef.get().then((doc) => {
      if (doc.exists) {
        context.dispatch('error', 'site exists', { root: true })
      } else {
        siteRef.set(site).then(() => {
          siteRef.collection('owners').doc(author).set({ nick: nick })
          siteRef.collection('members').doc(author).set({ nick: nick })
          context.dispatch('binder/createPage', {
            pageid: siteid,
            name: name,
            content: description,
            siteid: siteid,
            author: author,
            nick: nick
          },
          { root: true })
        })
      }
    })
  }
}
function exists (thing) {
  return thing !== null && typeof thing !== 'undefined'
}

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state
}
