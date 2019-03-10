class Observer {
	constructor(data) {
		this.data = data
		if (this.data) {
			this.observer(this.data)
		}
	}
	observer(data) {
		if(!data || typeof data != "object")return
		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key])
			this.observer(data[key]) // 递归
		})
	}
	defineReactive(obj, key, value) {
		let _this = this
		let dep = new Dep()
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,
			get() {
				Dep.target && dep.addSub(Dep.target)
				return value
			},
			set(newValue) {
				if(value != newValue) {
					_this.observer(newValue)
					value = newValue
					dep.notify()
				}
			}
		})

	}
}

// 发布订阅

class Dep {
	constructor() {
		this.subs = []
	}
	addSub(watcher) {
		this.subs.push(watcher)
	}
	notify() {
		this.subs.forEach(watcher => watcher.update())
	}
}