<template>
  <div>
    <v-data-table
      :items="players.list"
      :loading="players.loading"
      :headers="headers">
      <template v-slot:item.actions="{ item }">
      <PlayerTagsDialog
        :siteid="site.siteid"
        :uid="item.uid"/>
      <v-icon
        small
        @click="removePlayer(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import firebase, { FirebaseError } from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import VueCompositionApi, { defineComponent } from '@vue/composition-api'
import { usePlayers, Player } from '@/lib/usePlayers'
import { useSite } from '@/lib/useSite'
import { useAppState } from '@/lib/useAppState'
import PlayerTagsDialog from './PlayerTagsDialog.vue'

Vue.use(VueCompositionApi)

export default defineComponent({
  components: {
    PlayerTagsDialog
  },
  setup (props) {
    const { players } = usePlayers()
    const { site } = useSite()
    const { raiseError } = useAppState()
    const headers = [
      { text: 'Nick', value: 'nick' },
      { text: 'Tags', value: 'tags' },
      { text: 'Actions', value: 'actions' }
    ]
    const removePlayer = (player:Player):void => {
      const db = firebase.firestore()
      const playerRef = db.collection('sites').doc(site.value.siteid).collection('players').doc(player.uid)
      playerRef.delete().catch((error:Error) => {
        raiseError(error as FirebaseError)
      })
    }
    return { players, headers, removePlayer, site }
  }
})
</script>
