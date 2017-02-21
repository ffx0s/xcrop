# 移动端裁剪
视频演示：[video](https://www.youtube.com/watch?v=vSI-6g_sG5U)

<img src="http://7jptea.com1.z0.glb.clouddn.com/crop/crop-1.jpg" width="350" />

## demo

[https://ffx0s.github.io/xcrop/dist/crop.html](https://ffx0s.github.io/xcrop/dist/crop.html)

## 安装

Install with [npm](https://www.npmjs.com/package/xcrop): `npm install xcrop --save`

## 使用

``` js
import Crop from 'xcrop'

const options = {
    width: 300,
    height: 300,
    target: 'http://7jptea.com1.z0.glb.clouddn.com/test/images/test3.jpg',
    cancle: function () {
      this.hide()
    },
    confirm: function () {
      this.hide()
      console.log(this.get({width: 600}))
    }
  }
const crop = new Crop(options)
```

或者：

``` js
<script src="crop.js"></script>

<script>
  var options = {
    width: 300,
    height: 300,
    target: 'http://7jptea.com1.z0.glb.clouddn.com/test/images/test3.jpg',
    cancle: function () {
      this.hide()
    },
    confirm: function () {
      this.hide()
      console.log(this.get({width: 600}))
    }
  }
  var crop = new Crop(options)
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

### target

**Type:** _String_, _Element_ or _File_

``` js
target: 'http://xxx.jpg'
target: 'data:image/jpeg;base64,xxxxxx'
target: 'blob:http://localhost/24dfe01f-d581-4618-b595-f179cadc4e2f'
target: document.getElementById('image')
target: document.getElementById('canvas')
```

裁剪图片目标，支持二进制、base64、imageElement、objectUrl和canvas.

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

### get
**Type:** _Function_

``` js
/**
 * 裁剪函数，根据裁剪参数，输出裁剪后的图片
 * @param {object} options
 * @property {number} options.width - 裁剪宽度，默认值为裁剪框的width
 * @property {number} options.height - 裁剪高度，默认值为裁剪框的height
 * @property {string} options.type - 图片格式，默认'image/jpeg'
 * @property {number} options.quality - 图片质量，默认0.85，取值区间0~1
 * @return {object} 裁剪后的图片信息
 */
 
var options = {
 width: 300, 
 height: 300, 
 type: 'image/jpeg', 
 quality: 0.85
}
this.get(options)

输出： 
{
  // 文件对象
  blob: Blob,
  // canvas element
  canvas: canvas,
  // base64图片地址
  src: 'data:image/jpeg;base64,/xxxx',
  // objectUrl地址
  url: 'blob:http://localhost/24dfe01f-d581-4618-b595-f179cadc4e2f'
}
```

### moveTo
**Type:** _Function_

``` js
/**
 * 图片移动函数，以左上角为原点（不是以裁剪框为原点），移动到x，y坐标.
 * @param {number} x - x坐标.
 * @param {number} y - y坐标.
 */
this.moveTo(x, y)
```

### load
**Type:** _Function_

``` js
/**
 * 加载裁剪图片，实例化之后需要更换图片可以调用这个.
 * @param {(string|file|element)} target - 更换的图片，值可以是二进制、base64、imageElement、objectUrl或者canvas.
 */
this.load(target)
```

### show/hide
**Type:** _Function_

``` js
// 显示，改变css的display为block
this.show()
// 隐藏，改变css的display为none
this.hide()
```

### destroy
**Type:** _Function_

``` js
// 从dom节点上移除
this.destroy()
```

## 静态方法

### loadImage
**Type:** _Function_

``` js
/**
 * 图片加载函数，会自动更正图片的方向问题.
 * @param {(string|file|element)} target - 目标，值可以是二进制、base64、imageElement、objectUrl或者canvas.
 * @param {function} callback - 加载完成后的回调函数，function callback(canvas) {...}.
 */
Crop.loadImage(target, callback)
```

## Browser support

Android 4+, iOS 6+


## License

calendar is released under the [MIT License](http://desandro.mit-license.org/). Have at it.


  [1]: http://7jptea.com1.z0.glb.clouddn.com/crop/crop-1.jpg