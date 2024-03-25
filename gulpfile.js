// Gulp 详细介绍与案例使用: https://blog.csdn.net/zz00008888/article/details/129717179
// 基础库
const gulp = require('gulp')
// 文件管理
const fs = require('fs')
const path = require('path')
// ES6 转 ES5
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
// HTML 处理
const htmlmin = require('gulp-htmlmin')
// CSS 处理
const cssmin = require('gulp-cssmin')
// 自动给 css 文件样式添加浏览器前缀
const autoPrefixer = require('gulp-autoprefixer')
// 文件重命名
const rename = require('gulp-rename')
// 清空文件夹
const clean = require('gulp-clean')

// 目标文件夹地址
const targetPath = '/Users/dengzemiao/Desktop/Project/script/vue_script/demo/luckydrawpro'
// dist文件夹地址
const distPath = './dist'
// 忽略隐藏文件
const isIgnoreHiddenFiles = true
// 忽略文件夹或文件，不要进行处理，直接拷贝过去
const ignorePaths = [
  '/Users/dengzemiao/Desktop/Project/script/vue_script/demo/luckydrawpro/lib',
  // '/Users/dengzemiao/Desktop/GitHub/DZMLuckyDrawPro/js/index.js'
]
// 任务列表
const tasks = []

// 任务：删除文件夹
gulp.task('clean', function () {
  return gulp
    // read：是否读取文件，true 读取， false 不读取，加快程序
    // allowEmpty：允许文件夹为空或不存在，要不然会报错
    .src(distPath, { read: false, allowEmpty: true })
    .pipe(clean())
})
// 添加任务
tasks.push('clean')

// 任务：循环添加所有任务
addTasks(targetPath)

// 获取任务列表
function addTasks(filePath) {
  // 输出路径
  const outputPath = distPath + filePath.replace(targetPath, '')
  // 任务名称
  const taskName = `task${tasks.length}`
  // 忽略的文件夹或文件，直接移植过去
  if (ignorePaths.includes(filePath)) {
    // 是文件夹还是文件
    if (isDirectory(filePath)) {
      // 文件夹
      gulp.task(taskName, function (cb) {
        // 拷贝指定文件夹到指定目录
        copyDirectory(filePath, outputPath)
        // 完成
        cb()
      })
    } else {
      // 文件
      gulp.task(taskName, function () {
        return gulp
          .src(filePath)
          .pipe(gulp.dest(path.dirname(outputPath)))
      })
    }
    // 添加任务
    tasks.push(taskName)
    // 终止
    return
  }
  // 是否为文件夹
  if (isDirectory(filePath)) {
    // 读取文件夹内所有文件
    const files = getDirectoryFiles(filePath)
    // 便利所有文件
    files.forEach((file) => {
      // 是否为隐藏文件
      if (isIgnoreHiddenFiles && file.startsWith('.')) {
        return
      }
      // 递归获取
      addTasks(path.join(filePath, file))
    })
  } else {
    // 不是文件夹，根据文件后缀判断处理
    let ext = path.extname(filePath)
    // 不同文件使用不同插件处理
    if (ext === '.js') {
      // js 处理
      gulp.task(taskName, function () {
        return gulp
          // 定位需要压缩的 JS 文件
          .src(filePath)
          // ES6 转 ES5，看需求而定
          // .pipe(babel({
          //   presets: ['@babel/env']
          // }))
          // 文件压缩
          .pipe(uglify())
          // 文件重命名
          // .pipe(rename(function (path) {
          //   path.basename = 'index'
          //   path.extname = ".min.js"
          // }))
          // 输出
          .pipe(gulp.dest(path.dirname(outputPath)))
      })
    } else if (ext === '.css') {
      // css 处理
      gulp.task(taskName, function () {
        return gulp
          .src(filePath)
          .pipe(autoPrefixer())
          .pipe(cssmin())
          .pipe(gulp.dest(path.dirname(outputPath)))
      })
    } else if (ext === '.html') {
      // html 处理
      gulp.task(taskName, function () {
        return gulp
          .src(filePath)
          .pipe(htmlmin({
            // 移除空格压缩代码
            collapseWhitespace: true,
            // 删除空属性值(仅限于原生属性)
            removeEmptyAttributes: true,
            // 移除注释
            removeComments: true
          }))
          .pipe(gulp.dest(path.dirname(outputPath)))
      })
    } else {
      // 其他文件直接拷贝
      gulp.task(taskName, function () {
        return gulp
          .src(filePath)
          .pipe(gulp.dest(path.dirname(outputPath)))
      })
    }
    // 添加任务
    tasks.push(taskName)
  }
}

// 获取指定文件夹内所有文件
function getDirectoryFiles(filePath) {
  try {
    const files = fs.readdirSync(filePath)
    return files
  } catch (err) {
    return []
  }
}

// 指定路径是否为文件夹
function isDirectory(filePath) {
  try {
    const stat = fs.statSync(filePath)
    return stat.isDirectory()
  } catch (err) {
    return false
  }
}

// 复制指定目录到指定目录
function copyDirectory(source, destination) {
  // 创建目标目录
  fs.mkdirSync(destination, { recursive: true })
  // 读取源目录的内容
  const entries = fs.readdirSync(source, { withFileTypes: true })
  // 遍历目录
  entries.forEach(entry => {
    // 拼接路径
    const srcPath = path.join(source, entry.name)
    const destPath = path.join(destination, entry.name)
    // 根据文件类型复制
    if (entry.isDirectory()) {
      // 递归复制子目录
      copyDirectory(srcPath, destPath)
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

// 配置默认任务
// module.exports.default = gulp.series('clean', 'build')
gulp.task('default', gulp.series(...tasks))


