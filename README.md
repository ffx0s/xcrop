# 移动端裁剪

### 使用原生javascript，基于canvas实现的移动端裁剪插件，压缩后大小为22KB，无任何依赖。  
效果：[gif] (https://o818xvhxo.qnssl.com/o_1c67cjdgr10g81afk1bsd1qvsgjn9.gif)

<img src="http://7jptea.com1.z0.glb.clouddn.com/crop/crop-1.jpg?imageView2/2/w/350" width="350" />

## Demo

<img src="http://7jptea.com1.z0.glb.clouddn.com/crop/crop-qrcode.png" />

## 安装

Install with [npm](https://www.npmjs.com/package/xcrop): `npm install xcrop --save`

## 使用

``` js
import Crop from 'xcrop'

const options = {
  width: 300,
  height: 300,
  cancle: function () {
    this.hide()
  },
  confirm: function () {
    this.hide()
    console.log(this.get({width: 600}))
  }
}
const file = 'http://7jptea.com1.z0.glb.clouddn.com/test/images/test3.jpg'
const crop = new Crop(options)
crop.load(file)
```

或者：

``` js
<script src="crop.js"></script>

<script>
  var options = {
    width: 300,
    height: 300,
    cancle: function () {
      this.hide()
    },
    confirm: function () {
      this.hide()
      console.log(this.get({width: 600}))
    }
  }
  var file = 'http://7jptea.com1.z0.glb.clouddn.com/test/images/test3.jpg'
  var crop = new Crop(options)
  crop.load(file)
</script>
```

## Options

### width

**Type:** _Number_

**Value:** `300`

``` js
width: 300
```

裁剪框宽度.

### height

**Type:** _Number_ 

**Value:** `300`

``` js
height: 300
```

裁剪框高度.

### maxScale

**Type:** _Number_

``` js
maxScale: 2
```

可以缩放的最大比例, 默认值是2倍

### created

**Type:** _Function_

``` js
created: function () {}
```

节点创建完成，等待渲染到html页面的回调函数

### mounted

**Type:** _Function_

``` js
mounted: function () {}
```

渲染到html页面完成的回调函数

### loaded

**Type:** _Function_

``` js
loaded: function () {}
```

图片加载完成的回调函数

## 实例方法
  
### load
**Type:** _Function_

``` js
/**
 * 加载裁剪图片.
 * @param {(string|file|element)} target - 图片目标，可以是二进制、base64、imageElement、objectUrl或者canvas.
 */
this.load(target)
```  

### get
**Type:** _Function_

``` js
/**
 * 裁剪函数，根据裁剪参数，输出裁剪后的图片
 * @param {object} options
 * @property {number} options.width - 裁剪宽度，默认值为裁剪框的width
 * @property {number} options.height - 裁剪高度，默认值为裁剪框的height
 * @property {string} options.type - 图片类型，默认'image/jpeg'
 * @property {number} options.quality - 图片质量，默认0.85，取值区间0~1
 * @property {string} options.format - 裁剪图片的格式，影响最终返回的结果，默认 'canvas'， 可选：canvas、src、blob、url
 * @return {object} 裁剪后的图片数据
 */
 
var options = {
 width: 300, 
 height: 300, 
 type: 'image/jpeg', 
 quality: 0.85
}
this.get(options)

返回结果为以下对象中的一个：
{
  // 文件对象
  blob: Blob,
  // canvas element
  canvas: canvas,
  // base64
  src: 'data:image/jpeg;base64,/xxxx',
  // objectUrl
  url: 'blob:http://localhost/24dfe01f-d581-4618-b595-f179cadc4e2f'
}
```  

### moveTo
**Type:** _Function_

``` js
/**
 * 图片移动函数，以裁剪组件的左上角为原点，而不是以裁剪区域为原点，移动到x，y坐标.
 * @param {number} x - x坐标.
 * @param {number} y - y坐标.
 */
this.moveTo(x, y)
```

### show/hide
**Type:** _Function_

``` js
// 显示组件
this.show()
// 隐藏组件
this.hide()
```

### destroy
**Type:** _Function_

``` js
// 销毁组件
this.destroy()
```

## 静态方法

### loadImage
**Type:** _Function_

``` js
/**
 * 图片加载函数，会自动更正图片的方向、图片像素过大等问题.
 * @param {(string|file|element)} target - 目标，值可以是二进制、base64、imageElement、objectUrl或者canvas.
 * @param {function} callback - 加载完成后的回调函数，function callback(canvas) {...}.
 */
Crop.loadImage(target, callback)
```

## 其他

### 如何监听触摸的事件：
``` js
const crop = new Crop({
  mounted: function () {
    const pinch = this.pinch
    ;['dragstart', 'dragmove', 'dragend', 'pinchstart', 'pinchmove', 'pinchend'].forEach(eventName => {
      pinch.on(eventName, function (e) {
        console.log(eventName)
      })
    })
  }
})
```

## Browser support

Android 4.2+, iOS 8+


## License

xcrop is released under the [MIT License](http://desandro.mit-license.org/). Have at it.


  [1]: http://7jptea.com1.z0.glb.clouddn.com/crop/crop-1.jpg?imageView2/2/w/350