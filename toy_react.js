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
    this._vdom[RENDER_TO_DOM](range)
  }

  get vdom() {
    return this.render().vdom
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
      if (oldNode.type !== newNode.type) {
        return false
      }
      for(let name in newNode.props) {
        if(newNode.props[name] !== oldNode.props[name]) {
          return false
        }
      }
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {// 删除了
        return false
      }
      if(newNode.type === '#text') { // 文本节点
        if (newNode.content !== oldNode.content) {
          return false
        }
      }
      return true
    }
    const update = (oldNode, newNode) => {
      //type, props, , children
      //#text content
      if(!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }
      newNode._range = oldNode._range
      const newChildren = newNode.vchildren
      const oldChildren = oldNode.vchildren
      if(!newChildren || !newChildren.length) {
        return;
      }
      let tailRange = oldChildren[oldChildren.length -1]._range
      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]
        if (i < oldChildren.length) {
          update(oldChild, newChild)
        } else {
          //TODO
          const range = document.createRange()
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[RENDER_TO_DOM](range)
          tailRange = range
        }
      }
    }
    let vdom = this.vdom
    update(this._vdom,vdom)
    this._vdom = vdom
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
        } else {
          root.setAttribute(name, value)
        }
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
  }
  get vdom() {
    return this
  }
  [RENDER_TO_DOM](range) {
    this._range = range
    // range.deleteContents()
    // range.insertNode(this.root)
    const root = document.createTextNode(this.content)
    replaceContent(range, root)
  }
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

export function render (component, parentElement) {
  // parentElement.appendChild(component.root)
  const range = document.createRange()
  range.setStart(parentElement, 0)
  range.setEnd(parentElement, parentElement.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}

function replaceContent(range, node) {
if(!node || !range) {
    return
  }
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}

