<template>
  <div id="app">
    <input type="file" @change="onChange($event)" accept="image/*" :value="''">

    <img v-if="output" :src="output" width="100%">

    <Crop
      :file="file"
      :options="options"
      @on-cancle="onCancle"
      @on-confirm="onConfirm"
      @on-error="onError"
    />
  </div>
</template>

<script>
import Crop from 'xcrop/src/components/VueCrop'

export default {
  data () {
    return {
      file: null,
      options: {},
      output: ''
    }
  },
  methods: {
    onChange (e) {
      this.file = e.target.files[0]
    },
    onCancle (crop) {
      this.file = null
      crop.hide()
    },
    onConfirm (crop) {
      this.output = crop.get()
      this.file = null
      crop.hide()
    },
    onError (error) {
      console.log(error)
    }
  },
  components: {
    Crop
  }
}
</script>
