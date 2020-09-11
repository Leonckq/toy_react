const RENDER_TO_DOM = Symbol('render to dom')


export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    this._vdom = this.vdom
    this.render()[RENDER_TO_DOM](range)
  }
  /*rerender() {
    const oldRange = this._range

    let range = document.createRange()
    range.setStart(this._range.startContainer, oldRange.startOffset)
    range.setEnd(this._range.startContainer, oldRange.startOffset)
    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }*/

  update() {
    // this._range = range
    const isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode) {
        return false
      }
      for(let name in newNode.props) {
        if(newNode.props[name] !== oldNode.props[name]) {
          return false
        }
      }
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
        return false
      }
      if(newNode.type === '#text') {
        if (newNode.content !== oldNode.content) {
          return false
        }
      }
      return true
    }
    const update = (oldNode, newNode) => {
      //type, props, , children
      //#text content
      if(isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }
      newNode._range = oldNode._range
      const newChildren = newNode.vchildren
      const oldChildren = oldNode.vchildren
      if(!newChildren || !newChildren.length) {
        return;
      }

      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]
        if (i < oldChild.length) {
          update(oldChild, newChild)
        } else {
          //TODO
        }
      }
    }
    let vdom = this.vdom
    update(this._vdom,vdom)
    this._vdom = vdom
  }
  get vdom() {
    return this.render().vdom
  }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      this.update()
      return
    }
    const merge = (oldState, newState) => {
      for(let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p]
        } else {
          merge(oldState[p],newState[p])
        }
      }
    }

    merge(this.state, newState)
    this.update()
  }
  // get root() {
  //   if (!this._root) {
  //     this._root = this.render().root
  //   }
  //   return this._root
  // }
}

export function createElement(type, attributes, ...children) {
  let e
  if (typeof type === 'string') {
    e = new ElementWrapper(type)
  } else {
    e = new type
  }
  for(let p in attributes) {
    e.setAttribute(p, attributes[p])
  }

  let insertChildren = (children) => {
    for(let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      if (child === null) {
        continue
      }
      if (Array.isArray(child)) {
        insertChildren(child)
      } else {
        e.appendChild(child)
      }
    }
  }
  insertChildren(children)
  return e
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    // this.root = document.createElement(type)
    this.type = type
  }
  [RENDER_TO_DOM](range) {
    this._range = range

    let root = document.createElement(this.type)

    for(let name in this.props) {
      const value = this.props[name]
      if (name.match(/^on([\s\S]+$)/)) {
        const type = RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()).toString()
        root.addEventListener(type, value)
      } else {
        if (name === 'className') {
          root.setAttribute('class', value)
        }
        root.setAttribute(name, value)
      }
    }
    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom)
    }
    for(let child of this.vchildren) {
      const childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }

    replaceContent(range, root)
  }

  get vdom() {
    this.vchildren = this.children.map(child => child.vdom)
    return this
  }
}



class  TextWrapper extends Component{
  constructor(content) {
    super(content)
    this.type = '#text'
    this.content = content
    this.root = document.createTextNode(content)
  }
  get vdom() {
    return this
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export function render (component, parentElement) {
  // parentElement.appendChild(component.root)
  const range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}



// const RENDER_TO_DOM = Symbol("render to dom");

// export class Component {
//     constructor() {
//         this.props = Object.create(null);
//         this.children = [];
//         this._root = null;
//         this._range = null;
//     }
//     setAttribute(name, value) {
//         this.props[name] = value;
//     }
//     appendChild(component) {
//         this.children.push(component);
//     }
//     get vdom() {
//        return this.render().vdom;
//     }
//     [RENDER_TO_DOM](range){
//         this._range = range;
//         //赋值的vdom是一个getter，将会重新render得到一棵新的dom树
//         this._vdom = this.vdom;
//         this._vdom[RENDER_TO_DOM](range);
//     }

//     update() {
//         let isSameNode = (oldNode, newNode) => {
//             if (oldNode.type != newNode.type) 
//                 return false;
//             for (let name in newNode.props) {
//                 if (newNode.props[name] !== oldNode.props[name]) {
//                     return false;
//                 }
//             }

//             if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length)
//                 return false;

//             if (newNode.type === "#text") {
//                 if(newNode.content !== oldNode.content)
//                     return false;
//             }
//             return true;
//         }
//         //递归访问vdom的内容
//         let update = (oldNode, newNode) => {
//             //type, props, children
//             //#text content
//             if(!isSameNode(oldNode, newNode)) {
//                 newNode[RENDER_TO_DOM](oldNode._range);
//                 return;
//             }
//             newNode._range = oldNode._range;

//             //处理children的问题
//             let newChildren = newNode.vchildren;
//             let oldChildren = oldNode.vchildren;

//             if(!newChildren || !newChildren.length) {
//                 return;
//             }

//             let tailRange = oldChildren[oldChildren.length - 1]._range;
            
//             for (let i = 0; i < newChildren.length; i++) {
//                 let newChild = newChildren[i];
//                 let oldChild = oldChildren[i];
//                 if (i < oldChildren.length) {
//                     update(oldChild, newChild);
//                 } else {
//                     //如果oldchildre的数量小于newchildren的数量，我们就要去执行插入
//                     let range = document.createRange();
//                     range.setStart(tailRange.endContainer, tailRange.endOffseet);
//                     range.setEnd(tailRange.endContainer, tailRange.endOffseet);
//                     newChild[RENDER_TO_DOM](range);
//                     tailRange = range;
//                 }
//             }

//         }
//         let vdom = this.vdom;
//         update(this._vdom, vdom);
//         this._vdom = vdom;
//     }
//     // rerender() {
//     //     //保存老的range，避免调用RENDER_TO_DOM方法插入后修改了this._range
//     //     let oldRange = this._range;
//     //     let range = document.createRange();
//     //     range.setStart(this._range.startContainer, this._range.startOffset);
//     //     range.setEnd(this._range.startContainer, this._range.startOffset);
//     //     this[RENDER_TO_DOM](range);
//     //     //将老的range挪到插入之后
//     //     oldRange.setStart(range.endContainer, range.endOffset);
//     //     oldRange.deleteContents();
//     // }
//     setState(newState) {
//         if (this.state === null || typeof this.state !== "object") {
//             this.state = newState;
//             this.update();
//             return;
//         }
//         let merge = (oldState, newState) => {
//             for (let p in newState) {
//                 //js著名的坑，因为null的typeof也是object类型的
//                 if(oldState[p] === null || typeof oldState[p] !== "object") {
//                     oldState[p] = newState[p];
//                 } else {
//                     merge(oldState[p], newState[p]);
//                 }
//             }

//         }
//         merge(this.state, newState);
//         this.update();
//     }
// }

// class ElementWrapper extends Component{
//     constructor(type) {
//         super(type)
//         this.type = type;
//     }
//     // setAttribute(name, value) {
//     //     if(name.match(/^on([\s\S]+)$/)) {
//     //         //大小写敏感事件若采用驼峰命名则单独处理
//     //         this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
//     //     } else {
//     //         if(name == "className") {
//     //             this.root.setAttribute("class", value);
//     //         } else {
//     //             this.root.setAttribute(name, value);
//     //         }
//     //     }
//     // }

//     get vdom(){
//         this.vchildren = this.children.map(child => child.vdom);
//         return this;
//         // {
//         //     type: this.type,
//         //     props: this.props,
//         //     children: this.children.map(child => child.vdom)
//         // }
//     }
//     // appendChild(component) {
//     //     let range = document.createRange();
//     //     range.setStart(this.root, this.root.childNodes.length);
//     //     range.setEnd(this.root, this.root.childNodes.length);
//     //     component[RENDER_TO_DOM](range);
//     // }
//     [RENDER_TO_DOM](range){
//         this._range = range;

//         let root = document.createElement(this.type);

//         //所有prop里面的内容要抄写到attribute上
//          for(let name in this.props) {
//              let value = this.props[name];
//             if(name.match(/^on([\s\S]+)$/)) {
//                 //大小写敏感事件若采用驼峰命名则单独处理
//                 root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
//             } else {
//                 if(name == "className") {
//                     root.setAttribute("class", value);
//                 } else {
//                     root.setAttribute(name, value);
//                 }
//             }
//          }

//          if(!this.vchildren) {
//             this.vchildren = this.children.map(child => child.vdom);
//          }

//          //处理children
//          for (let child of this.vchildren) {
//             let childRange = document.createRange();
//             childRange.setStart(root, root.childNodes.length);
//             childRange.setEnd(root, root.childNodes.length);
//             child[RENDER_TO_DOM](childRange);
//          }

//          replaceContent(range, root)
//     }
// }

// class TextWrapper extends Component {
//     constructor(content) {
//         super(content);
//         this.type = "#text";
//         this.content = content;
//     }
//     get vdom() {
//         return this;
//         // {
//         //     type:"#text",
//         //     content: this.content
//         // }
//     }

//     [RENDER_TO_DOM](range){
//         this._range = range;
//         let root = document.createTextNode(this.content)
//         replaceContent(range, root)
//     }
// }

function replaceContent(range, node) {
    range.insertNode(node);
    range.setStartAfter(node);
    range.deleteContents();

    range.setStartBefore(node);
    range.setEndAfter(node);
}

// export function createElement(type, attributes, ...children) {
//     let e;
//     if (typeof type === "string") {
//         e = new ElementWrapper(type);
//     } else {
//         e = new type;
//     }
//     for (let p in attributes) {
//         e.setAttribute(p, attributes[p]);
//     }

//     let insertChildren = (children) => {
//         for (let child of children) {
//             if(typeof child === "string") {
//                 child = new TextWrapper(child)
//             }
//             if(child === null) {
//                 continue;
//             }
//             if(typeof child == "object" && (child instanceof Array)) {
//                 insertChildren(child);
//             } else {
//                 e.appendChild(child);
//             }
//         }
//     }
//     insertChildren(children);

//     return e;
// }

// export function render(component, parentElement) {
//     let range = document.createRange();
//     range.setStart(parentElement, 0);
//     range.setEnd(parentElement, parentElement.childNodes.length);
//     range.deleteContents(); 
//     component[RENDER_TO_DOM](range);
// }