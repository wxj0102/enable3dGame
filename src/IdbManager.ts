
// 关键词 indexDB 如果要改可以先看看对应资料
export default class IndexDBManager {
  name: string
  version: number
  request!: IDBOpenDBRequest
  db!: IDBDatabase
  dbResolve: any
  dbPromise: any

  constructor(name: string, version: number) {
    this.name = name
    this.version = version
    
    this.dbPromise = new Promise((resolve) => {
      this.dbResolve = resolve
    })
  }

  ready () {
    return this.dbPromise
  }

  init(createStoreCallback: () => void) {
    this.request = window.indexedDB.open(this.name, this.version)
    this.request.onsuccess = (e) => {
      this.db = this.request.result
      if(this.db) {
        this.dbResolve(e)
      }
    }
    this.request.onerror = (e) => {
      console.log('error', e)
    }
    this.request.onupgradeneeded = () => {
      this.db = this.request.result
      // 感觉可以先清理掉所有的表
      const storeNameList = this.db.objectStoreNames
      for(let i = 0; i < storeNameList.length; i++) {
        this.db.deleteObjectStore(storeNameList[i])
      }
      createStoreCallback()
    }
  }

  createStore(name: string, keyPath = 'id') {
    const store = this.db.createObjectStore(name, {
      keyPath: keyPath,
    })
    return store
  }

  add(storeName: string, value: any) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(value)
      request.onsuccess = (e) => {
        resolve(e)
      }
      request.onerror = (e) => {
        reject(e)
      }
    })
  }

  update(storeName: string, key: IDBKeyRange, value: Record<string, any>) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const range = IDBKeyRange.only(key)
      const request = store.get(range)
      request.onsuccess = (e: any) => {
        const data = e.target.result
        Object.assign(data, value)
        const updateRequest = store.put(data)

        updateRequest.onsuccess = (e) => {
          resolve(e)
        }
        updateRequest.onerror = (e) => {
          reject(e)
        }
      }
      request.onerror = (e) => {
        reject(e)
      }
    })
  }

  getAll(storeName: string): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll()
      request.onsuccess = (e: any) => {
        resolve(e?.target?.result)
      }
      request.onerror = (e) => {
        reject(e)
      }
    })
  }

  delete(storeName: string, key: IDBValidKey | IDBKeyRange) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const range = IDBKeyRange.only(key)
      const request = store.delete(range)

      request.onsuccess = (e) => {
        resolve(e)
      }
      request.onerror = (e) => {
        reject(e)
      }
    })
  }

  onUpgradeneeded() {

  }
}
