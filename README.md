# 移动端裁剪插件  

[![npm](https://img.shields.io/npm/v/xcrop.svg)](https://www.npmjs.com/package/xcrop) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)]()

> 原生javascript移动端裁剪插件

## 例子
[GIF](https://o818xvhxo.qnssl.com/o_1c67cjdgr10g81afk1bsd1qvsgjn9.gif)  


<img src="https://o818xvhxo.qnssl.com/o_1c8fr886nekl1i4u7k6ap41hdu9.png" />  

## 安装

Install with [npm](https://www.npmjs.com/package/xcrop): `npm install xcrop --save`

## 使用

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

## Options  
**Type:** _Object_  
> 实例化选项：new Crop(options)

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|el|false|Element|body|插入节点|
|viewWidth|false|Number|document.documentElement.clientWidth|容器宽度|
|viewHeight|false|Number|document.documentElement.clientHeight|容器高度|
|maxScale|false|Number|2|允许缩放的最大比例|
|confirmText|false|String|确认|确认按钮文字|
|cancleText|false|String|取消|取消按钮文字|
|showClass|false|String|crop-slide-left|动画类名：crop-slide-*, *: left/right/top/bottom|
|hideClass|false|String|crop-slide-bottom|动画类名，同上|


## 实例方法  
  
### load(target)  
> 加载图片  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|target|true|String/File/Element|-|图片目标，可以是flile/base64/imageElement/objectUrl/canvas|  

### get(options)  
> 获取裁剪图片  

|options 属性|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|width|false|Number|默认宽度基于原图比例|裁剪宽度|
|height|false|Number|默认高度基于原图比例|裁剪高度|
|type|false|String|image/jpeg|图片格式|
|format|false|String|base64|输出格式，可选：canvas/objectUrl/base64/file|  
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
|border|true|Object|-|裁剪框大小：{x, y, width, height}|  

### on
> 监听自定义事件  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|eventName|true|String|-|事件名|
|fn|true|Function|-|事件函数|  

返回自身，可以链式调用。  

### emit  
> 分发自定义事件  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|eventName|true|String|-|事件名|  
|arguments|false|*|-|携带的参数|  

### off  
> 移除自定义事件  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|eventName|true|String|-|事件名|  
|fn|true|Function|-|移除的函数|  

### this.canvas.moveTo  
> 移动图片到指定位置  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|x|true|Number|-|x坐标|  
|y|true|Number|-|y坐标|

### this.canvas.sacleTo  
> 缩放图片  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|point|true|Object|-|以点为中心缩放：{x:0, y:0}|  
|scale|true|Number|-|缩放比例|  


### destroy  
> 销毁组件  


## 静态方法

### Crop.imageToCanvas  
> 图片转canvas  

|参数|必选|类型|默认|说明|
|:-----|:-------|:-----|:-----|-----------------------------|
|target|true|string/file/element|-|图片|  
|callback|true|Function|-|成功回调，回调函数中第一个参数为canvas|
|options|false|Object|{orientation: true, errorCallback: function () {}}|可选项，orientation：是否需要更正图片方向，errorCallback： 出错回调|  


## Browser support

Android 4.2+, iOS 8+


## License

xcrop is released under the [MIT License](http://desandro.mit-license.org/). Have at it.  
