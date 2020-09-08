export function createElement(type, attributes, ...children) {
  let e
  if (typeof type === 'string') {
    e = document.createElement(tagName)
  } else {
    e = new type
  }
  for(let p in attributes) {
    e.setAttribute(p, attributes[p])
  }
  for(let child of children) {
    if (typeof child === "string") {
      child = document.createTextNode(child)
    }
    e.appendChild(child)
  }
  return e
}

export class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(component) {
    this.root.appendChild(component.root)
  }
}

export class  TextWrapper{
  constructor(content) {
    this.root = document.createElement(content)
  }
}

export function render (component, prentElement) {

}

export class Componet {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this
  }
  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }
}