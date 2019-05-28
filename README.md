# 移动端裁剪插件  

[![npm](https://img.shields.io/npm/v/xcrop.svg)](https://www.npmjs.com/package/xcrop) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)]()

> 移动端裁剪插件，原生 JavaScript 实现，无依赖，支持 Vue 2.0，React。  
 
<img src="https://static.webfed.cn/o_1danubjd06sqoagjn05o210639.gif" style="width: 329px;height:662px;">

## Demo
[Demo](https://ffx0s.github.io/xcrop/examples/crop.html)  

<img src="http://static.webfed.cn/o_1c8fs4vpu8sk1us8uisfge1n769.png" />  

## 安装

Install with [npm](https://www.npmjs.com/package/xcrop): `npm install xcrop --save`

## 直接使用

```html
<input type="file" id="file-input" accept="image/*">
```

``` js
import Crop from 'xcrop'

const options = {}
const crop = new Crop(options)

crop.on('cancle', crop => {
  crop.hide()
})
crop.on('confirm', crop => {
  const canvas = crop.get({ format: 'canvas' })
  document.body.appendChild(canvas)
  crop.hide()
})

function onChange (e) {
  var file = e.target.files[0]
  if (!file) return false
  crop.load(file)
  this.value = ''
}

document.getElementById('file-input').onchange = onChange
```  

## 基于 Vue 2.0 使用  
``` html
<Crop
  :file="file"
  :options="options"
  @on-cancle="onCancle"
  @on-confirm="onConfirm"
  @on-error="onError"
/>
<input type="file" @change="onChange($event)" accept="image/*" :value="''">
<img v-if="output" :src="output" width="100%">
```  

``` js
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
```  

## 基于 React 使用
```js
import React, { Component } from 'react'
import Crop from 'xcrop/src/components/ReactCrop'

export default class App extends Component {

  constructor (props) {
    super(props)

    this.state = {
      options: {},
      output: ''
    }

    this.onChange = this.onChange.bind(this)
    this.onCancle = this.onCancle.bind(this)
    this.onConfirm = this.onConfirm.bind(this)
    this.onError = this.onError.bind(this)
  }

  onChange (e) {
    this.crop[0].load(e.target.files[0])
  }

  onCancle (crop) {
    crop.hide()
  }

  onConfirm (crop) {
    this.setState({
      output: crop.get()
    })
    crop.hide()
  }

  onError (error) {
    console.log(error)
  }

  render () {
    return (
      <div className="App">
        <input type="file" onChange={this.onChange} accept="image/*" value="" />

        {this.state.output && <img src={this.state.output} width="100%" alt="" />}

        <Crop
          ref={component => this.crop = component || null}
          options={this.state.options}
          onCancle={this.onCancle}
          onConfirm={this.onConfirm}
          onError={this.onError}
        />
      </div>
    )
  }
}

```

## Options  
**Type:** _Object_  
> 实例化选项：new Crop(options)

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|el|false|Element|body|插入节点|
|viewWidth|false|Number|document.documentElement.clientWidth|容器宽度|
|viewHeight|false|Number|document.documentElement.clientHeight|容器高度|  
|border|false|Object|{x,y,width,height}|裁剪框位置大小，默认居中，为容器90%大小|
|circle|false|Boolean|false|裁剪框是否为圆形，仅样式改变，裁剪后输出的图片依然是矩形，不支持安卓<=4.1的版本|
|maxScale|false|Number|2|允许缩放的最大比例|
|confirmText|false|String|确认|确认按钮文字|
|cancleText|false|String|取消|取消按钮文字|
|beforeShowClass|false|String|crop_slide-to-left|显示的动画类名，会在显示之前添加，之后移除，可选：crop-slide-to*, *: left/right/top/bottom|
|beforeHideClass|false|String|crop_slide-to-bottom|隐藏的动画类名，会在隐藏之前添加，参数同上|


## 实例方法  
  
### load(target)  
> 加载图片  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|target|true|String/File/Element|-|图片目标，可以是flile/base64/imageElement/objectUrl/canvas|  

### get(options)  
> 获取裁剪图片  

|options 属性|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|width|false|Number|默认宽度基于原图比例|裁剪宽度|
|height|false|Number|默认高度基于原图比例|裁剪高度|
|type|false|String|image/jpeg|图片格式|
|format|false|String|base64|输出格式，可选：canvas/objectUrl/base64/file|  
|quality|false|Number|0.85|图片质量，对应canvas toDataURL方法|

|返回值|类型|说明|
|:-----|:------|:-----------------------------|
|result|String/Element/File|返回结果，根据输入选项返回对应结果|  


### show / hide  
> 显示/隐藏组件  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|transition|false|Boolean|true|是否需要过渡动画|


### setBorder
> 设置裁剪框位置大小：setBorder(border)  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|border|true|Object|-|裁剪框大小：{x, y, width, height}|  

### on
> 监听自定义事件，函数返回自身，可以链式调用，  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|eventName|true|String|-|事件名|
|fn|true|Function|-|事件函数|  
|once|false|Boolean|undefined|此事件是否只执行一次|  

可监听的事件有：  

|事件名|说明|
|:-----|-----------------------------|  
|loaded|图片加载完成|  
|error|图片加载失败|  
|cancle|按钮取消|  
|confirm|按钮确认|  
|dragstart|单指按下|  
|dragmove|单指拖动|  
|dragend|单指拖动结束|  
|pinchstart|双指按下  
|pinchmove|双指拖动|  
|pinchend|双指拖动结束|  

### emit  
> 分发自定义事件  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|eventName|true|String|-|事件名|  
|arguments|false|*|-|携带的参数|  

### off  
> 移除自定义事件  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|eventName|true|String|-|事件名|  
|fn|true|Function|-|移除的函数|  

### this.canvas.moveTo  
> 移动图片到指定位置  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|x|true|Number|-|x坐标|  
|y|true|Number|-|y坐标|

### this.canvas.sacleTo  
> 缩放图片  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|point|true|Object|-|以点为中心缩放：{x:0, y:0}|  
|scale|true|Number|-|缩放比例|  


### destroy  
> 销毁组件  


## 静态方法

### Crop.imageToCanvas  
> 图片转canvas  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|target|true|string/file/element|-|图片|  
|callback|true|Function|-|成功回调，回调函数中第一个参数为canvas|
|options|false|Object|{orientation: true, errorCallback: function () {}}|可选项，orientation：是否需要更正图片方向，errorCallback： 出错回调|  


## Browser support

Android 4.2+, iOS 8+
