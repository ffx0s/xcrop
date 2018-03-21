<template>
  <div class="crop-component"></div>
</template>

<script>
import Crop from 'xcrop'

const EVENTS = [
  'cancle',       // 取消
  'confirm',      // 确认
  'loaded',       // 图片加载完成
  'error',        // 图片加载出错
  'dragstart',    // 单指按下
  'dragmove',     // 单指拖动
  'dragend',      // 单指拖动结束
  'pinchstart',   // 双指按下
  'pinchmove',    // 双指拖动
  'pinchend'      // 双指拖动结束
]

export default {
  props: {
    file: {
      type: null
    },
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  watch: {
    file (file) {
      this.load(file)
    }
  },
  mounted () {
    this.init()
    this.addEvents()
  },
  methods: {
    init () {
      this.options.el = this.$el
      this[0] = new Crop(this.options)
    },
    load (file) {
      if (file && this[0]) {
        this[0].load(file)
      }
    },
    addEvents () {
      const vm = this
      const crop = vm[0]

      EVENTS.forEach(eventName => {
        crop.on(eventName, function () {
          vm.$emit(`on-${eventName}`, ...arguments)
        })
      })
    }
  },
  beforeDestroy () {
    this[0] && this[0].destroy()
    this[0] = null
  }
}
</script>
