<template>
  <v-container>
    <v-row>
      <v-col cols="8">
         <v-card>
           <v-toolbar><v-toolbar-title>CKEditor alpha</v-toolbar-title></v-toolbar>
           <v-card-text>...</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card>
          <v-card-title>Debug</v-card-title>
          <v-card-text>
            <p>siteid: [{{ siteid }}]</p>
            <p>pageid: [{{ pageid }}]</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, ComputedRef } from '@vue/composition-api'
import { useParams } from '@/lib/useParams'

interface PageRoute {
  siteid:string,
  pageid?:string
}

export default defineComponent({
  setup (props) {
    const siteid = ref('')
    const pageid = ref('')

    function setPage (p:Object) {
      const pageRoute = p as PageRoute
      siteid.value = pageRoute.siteid
      if (pageRoute.pageid) pageid.value = pageRoute.pageid
      else pageid.value = siteid.value
    }

    // useParams, to get the site and page id's
    const params = useParams()
    // reload/remount etc
    onMounted(() => { setPage(params.value) })
    // route changed
    watch(params, setPage)

    return { siteid, pageid }
  }
})
</script>