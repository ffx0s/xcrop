<template>
  <div id="app">
    <input type="file" @change="onChange($event)" accept="image/*" :value="''">
    <button @click="isDestroy = true">销毁</button>

    <img v-if="output" :src="output" width="100%">

    <template v-if="!isDestroy">
      <Crop
        :file="file"
        :options="options"
        @on-cancle="onCancle"
        @on-confirm="onConfirm"
      />
    </template>
  </div>
</template>

<script>
import Crop from 'xcrop/src/components/VueCrop'

export default {
  data () {
    return {
      isDestroy: false,
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
    }
  },
  components: {
    Crop
  }
}
</script>
