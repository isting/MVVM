class Mvvm {
    constructor(options) {
        this.$el = options.el,
        this.$data = options.data

        if(this.$el) {
            // 数据劫持
            new Observer(this.$data)
            // 模板编译
            new Compile(this.$el, this)
            // 代理
            this.proxyData(this.$data)
        }
    }
    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newValue) {
                    data[key] = newValue
                }
            })
        })
    }
}