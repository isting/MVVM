// 发布订阅模式
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm  // 实例
        this.expr = expr // key值
        this.cb = cb    // 回调

        this.value = this.get()
    }
    get() { // 获取老值
        Dep.target = this;
        let value = this.getVal(this.vm, this.expr)
        Dep.target = null
        return value
    }
    getVal(vm, expr) {
        // 本函数的作用
        // 在data中  取到对应的key值  data.a.b.c.d 也就是expr
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
           return prev[next];
        }, vm.$data)
    }
    update() {
        let newValue = this.getVal(this.vm, this.expr)
        let oldValue = this.value
        if(newValue != oldValue) {
            this.cb.call(this)
        }
    }
}