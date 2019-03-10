class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    if(this.el) {
      // 把真是的dom  移入fragment中
      // 编译  提取想要的元素节点v-model  和文本节点
      // 把编译好的的fragment 塞回到页面中区
      let fragment = this.node2Fragment(this.el)
      
      this.Compile(fragment)
      this.el.append(fragment)
    }
  }
  /* 辅助方法 */
  isElementNode(node) { // 判断节点类型
    return node.nodeType === 1
  }
  isDirective(name) {
    return name.includes("v-")
  }
  /* 辅助方法结束 */
  node2Fragment(node) {  // 把页面中dom移入 文档碎片中
    let fragment = document.createDocumentFragment()
    let firstChild;
    while(firstChild = node.firstChild) {
      fragment.append(firstChild)
    }
    return fragment
  }
  Compile(fragment) {
    let childNodes = fragment.childNodes // 转为伪数组  研究下这个api
    Array.from(childNodes).forEach(node => {
      if(this.isElementNode(node)) {
        this.Compile(node)
        this.compileElement(node)
      } else {
        this.compileText(node)
      }
    })
  }
  compileElement(node) {
    let attrs = node.attributes
    Array.from(attrs).forEach(el => {
      if(this.isDirective(el.name)) {
        // console.log(el.value)
        let expr = el.value
        let [, type] = el.name.split('-')
        CompileUtil[type](node, this.vm, expr)
      }
    })
  }
  compileText(node) {
    let Text = node.textContent
    let reg = /\{\{[^{]*\}\}/g;
    if(reg.test(Text)) {
      // console.log(node);
      CompileUtil['text'](node, this.vm, Text)
    }
  }
}

CompileUtil = {
  getVal(vm, expr) {
    expr = expr.split(".")

    return expr.reduce((prev, next) => {
      return prev[next]
    }, vm.$data)
  },
  getTextValue(expr, vm) { // 这里有点问题 {{}} 没替换
    return expr.replace(/\{\{^}*\}\}/g, (...arguments) => {
      return this.getVal(vm, arguments[1])
    })
  },
  text(node, vm, expr) {
    // node当前节点  vm当前实例  expr data key值
    let updateFn = this.updater["textUpdater"]
    let value = this.getTextValue(expr, vm)

    expr.replace(/\{\{^}*\}\}/g, (...arguments) => {  // 这个地方很绕  研究下
      new Watcher(vm, arguments[1], (newValue) => {
        updateFn && updateFn(node, this.getTextVal(vm, expr))
      })
    })

    updateFn && updateFn(node, value)
  },
  setVal(vm, expr, value) {
    expr = expr.split('.')
    return expr.reduce((prev, next, currentIndex) => {
      if(currentIndex === expr.length-1) {
        console.log(vm.$data.InputEle)
        return prev[next] = value
      }
      return prev[next]
    }, vm.$data)
  },
  model(node, vm, expr) {
    let updateFn = this.updater["modelUpdater"]

    new Watcher(vm, expr, (newValue) => {
      // 当输入框的值变化的时候  通过cb 将新值更新
      updateFn && updateFn(node, this.getVal(vm, expr))
    })
    node.addEventListener('input', e => {
      let newValue = e.target.value
      this.setVal(vm, expr, newValue)
    })

    updateFn && updateFn(node, this.getVal(vm, expr))
  },
  updater: {
    textUpdater(node, value) {
      node.textContent = value
    },
    modelUpdater(node, value) {
      node.value = value
    }
  }
}