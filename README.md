# 用ES6新语法class实现一个Promise

本写法主要思路参考了xieranmaya的实现方法，但有3点主要区别：
1、原作者写法利用构造函数实现，本写法利用ES6新语法class实现，逻辑更紧凑
2、原作者忽略了resolve/reject如果出现多次，只能成功回调第一个的情况
3、原作者忽略了resolve/reject接受一个Promise作为参数的情况，会导致和原生Promise运行结果产生出入

第2、3点的改进代码主要参考如下：
```javascript
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
  ```

# Promise3
Try to implement a Promise which compliance to promise A/+ Spec.

It's my third implementation thus it's called Promise3.

And now, it's done!

# How to run tests

`npm install -g promises-aplus-tests`

`promises-aplus-tests ./Promise3.js`
