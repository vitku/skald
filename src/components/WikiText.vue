<template>
  <div class="wikipage">
    <div :class="this.theme">
      <!--div v-html="rended"></div-->
      <component v-bind:is="rended"></component>
    </div>
  </div>
</template>

<script>
import ViewAttachment from './page/ViewAttachment.vue'
import ViewUpload from './page/ViewUpload.vue'
import GameTrack from './trackers/GameTrack.vue'
import PointCounter from './trackers/PointCounter.vue'
import Vue from 'vue'
import Skaldmd from '../lib/skaldmd'

Vue.component('ViewAttachment', ViewAttachment)
Vue.component('ViewUpload', ViewUpload)
Vue.component('GameTrack', GameTrack)
Vue.component('PointCounter', PointCounter)
export default {
  props: [
    'content',
    'theme',
    'siteid',
    'userTags'
  ],
  computed: {
    rended () {
      const skaldmd = new Skaldmd(this.siteid)
      let rendedContent = skaldmd.toHtml(this.content, this.userTags)
      // rendedContent = skaldmd.toHtml()

      // These we need to run on html
      rendedContent = attachLinks(rendedContent, this.siteid)
      rendedContent = fileLinks(rendedContent, this.siteid)
      rendedContent = tracks(rendedContent, this.siteid)
      rendedContent = counters(rendedContent, this.siteid)

      return {
        template: '<div>' + rendedContent + '</div>'
      }
    }
  }
}
function attachLinks (page, siteid) {
  const re = new RegExp('([\\[(]attach:)(.+?)([\\])])', 'g')
  return page.replace(re, function (match, p1, p2, p3, offset, string) {
    p2 = p2.trim()
    if (p2.includes('|')) {
      const parts = p2.split('|')
      if (parts[1].trim() === 'wide') return `<ViewAttachment wide="attachment-wide" path="${siteid}/${parts[0]}"/>`
      if (parts[1].trim() === 'sm') return `<ViewAttachment wide="attachment-sm" path="${siteid}/${parts[0]}"/>`
      if (parts[1].trim() === 'xs') return `<ViewAttachment wide="attachment-xs" path="${siteid}/${parts[0]}"/>`
      const opts = parts[1].split(' ')
      let w = ''
      if (opts.includes('inline')) w += ' inline'
      if (opts.includes('sm')) w += ' attachment-sm'
      return `<ViewAttachment wide="${w}" path="${siteid}/${parts[0]}"/>`
    }
    return `<ViewAttachment wide="attachment-normal" path="${siteid}/${p2}"/>`
  })
}
function fileLinks (page, siteid) {
  const re = new RegExp('\\[file:([a-öA-Ö. \\-_0-9]*)\\]', 'gmu')
  return page.replace(re, (match, p1) => {
    p1 = p1.trim()
    if (p1.includes('|')) {
      const parts = p1.split('|')
      return `<ViewUpload path="${siteid}/uploads/${parts[0].trim()}" title="${parts[1].trim()}"/>`
    }
    return `<ViewUpload path="${siteid}/uploads/${p1}"/>`
  })
}
/**
 * [track Kalkki-Tarmo]
 */
function tracks (page, siteid) {
  const re = new RegExp('\\[track([a-öA-Ö. \\-_0-9]*)\\]', 'gmu')
  return page.replace(re, (match, p1) => {
    const name = p1.trim()
    if (name) return `<GameTrack site="${siteid}" id="${name}"/>`
    return '[track: ... ]'
  })
}
/**
 * [track Kalkki-Tarmo]
 */
function counters (page, siteid) {
  const re = new RegExp('\\[counter([a-öA-Ö. \\-_0-9]*)\\]', 'gmu')
  return page.replace(re, (match, p1) => {
    const name = p1.trim()
    if (name) return `<PointCounter max=33 name="${name}"/>`
    return '[track: ... ]'
  })
}
</script>
