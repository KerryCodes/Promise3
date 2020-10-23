class MyPromise{
  static resolve(value){
    if(value instanceof MyPromise){
      return value
    }else{
      return new MyPromise(resolve=>{
        resolve(value)
      })
    }
  }
  static reject(reason){
    return new MyPromise((_, reject)=>{
      reject(reason)
    })
  }
  static all(promisesAry){
    return new MyPromise((resolve, reject)=>{
      const len= promisesAry.length
      const results= Array(len)

      if(len === 0){
        resolve(results)
        return
      }
      promisesAry.forEach(p=>{
      // 如果不是Promise实例需要转化为Promise实例
        MyPromise.resolve(p).then(value=>{
          results.push(value)
          if(--len === 0){
            resolve(results)
          }
        }, reason=>{
          reject(reason)
        })
      })
    })
  }
  static race(promisesAry){
      // 如果不是Promise实例需要转化为Promise实例
    return new MyPromise((resolve, reject)=>{
      promisesAry.forEach(p=>{
        MyPromise.resolve(p).then(value=>{
          resolve(value)
        }, reason=>{
          reject(reason)
        })
      })
    })
  }
  
  constructor(executor){
    const self= this

    this.called= false
    this.status= 'pending'
    this.data= undefined
    this.fulfilledQueue= []
    this.rejectedQueue= []
    try{
      executor(self._resolve, self._reject)
      // 如果_resolve和_reject不是箭头函数，则需要利用bind绑定this
      // executor(self._resolve.bind(self), self._reject.bind(self))
    }catch(e){
      self._reject(e)
    }
  }
  _resolve= (value)=>{
    const self= this
    
    if(this.called){
      return
    }else{
      this.called= true
      if(value instanceof MyPromise){
        value.then(val=>{
          if(self.status === 'pending'){//因为有called做判断，此处其实不需要再确认pending
          self.status= 'fulfilled'
          self.data= val
          self.fulfilledQueue.forEach(callback => callback(self.data))
          }
        }, reason=>{
          if(self.status === 'pending'){//因为有called做判断，此处其实不需要再确认pending
          self.status= 'rejected'
          self.data= reason
          self.rejectedQueue.forEach(callback => callback(self.data))
          }
        })
      }else{
        setTimeout(()=>{
          if(self.status === 'pending'){//因为有called做判断，此处其实不需要再确认pending
            self.status= 'fulfilled'
            self.data= value
            self.fulfilledQueue.forEach(callback => callback(self.data))
          }
        })
      }
    }
  }
  _reject= (reason)=>{
    const self= this

    if(this.called){
      return
    }else{
      this.called= true
      setTimeout(()=>{
        if(self.status === 'pending'){//因为有called做判断，此处其实不需要再确认pending
          self.status= 'rejected'
          self.data= reason
          self.rejectedQueue.forEach(callback => callback(self.data))
        }
      })
    }
  }
  then(fulCallback, rejCallback){
    const self= this

    fulCallback= typeof fulCallback === 'function' ? fulCallback : function(value){return value}
    rejCallback= typeof rejCallback === 'function' ? rejCallback : function(reason){throw reason}
    if(self.status === 'pending'){
      return new MyPromise((resolve, reject)=>{
        self.fulfilledQueue.push(function(data){
          try{
            const result= fulCallback(data)

            if(result instanceof MyPromise){
              result.then(resolve, reject)
            }else{
              resolve(result)
            }
          }catch(e){
            reject(e)
          }
        })
        self.rejectedQueue.push(function(data){
          try{
            const result= rejCallback(data)

            if(result instanceof MyPromise){
              result.then(resolve, reject)
            }else{
              resolve(result)
            }
          }catch(e){
            reject(e)
          }
        })
      })
    }
    if(self.status === 'fulfilled'){
      return new MyPromise((resolve, reject)=>{
        try{
          const result= fulCallback(self.data)

          if(result instanceof MyPromise){
            result.then(resolve,reject)
          }else{
            resolve(result)
          }
        }catch(e){
          reject(e)
        }
      })
    }
    if(self,status === 'rejected'){
      return new MyPromise((resolve, reject)=>{
        try{
          const result= rejCallback(self.data)

          result.then(resolve, reject)
        }catch(e){
          reject(e)
        }
      })
    }
  }
  catch(rejCallback){
    return this.then(null, rejCallback)
  }

}