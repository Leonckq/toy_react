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
    this.render()[RENDER_TO_DOM](range)
  }
  rerender() {
    const oldRange = this._range

    let range = document.createRange()
    range.setStart(this._range.startContainer, oldRange.startOffset)
    range.setEnd(this._range.startContainer, oldRange.startOffset)
    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }
  get vdom() {
    return this.render().vdom
  }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      this.rerender()
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
    this.rerender()
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
  }
  /*setAttribute(name, value) {
    if (name.match(/^on([\s\S]+$)/)) {
      const type = RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()).toString()
      this.root.addEventListener(type, value)
    } else {
      if (name === 'className') {
        this.root.setAttribute('class', value)
      }
      this.root.setAttribute(name, value)
    }
    
  }

  appendChild(component) {
    const range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }*/

  get vdom() {
    return this
    /*return {
      type: this.type,
      props: this.props,
      children: this.children.map(child => child.vdom)
    }*/
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
    /*return {
      type: '#text',
      content: this.content
    }*/
  }
  [RENDER_TO_DOM](range) {
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

