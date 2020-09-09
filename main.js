import { createElement, Component, render } from './toy_react'


class MyComponent extends Component {
  render() {
    return <div>
      <h1>MyComponent</h1>
      {JSON.stringify(this.children)}
      {this.children}
    </div>
  }
}

render(<MyComponent id="a" name="qing">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</MyComponent>, document.body)

window.a = <div>
  <div name="2">32</div>
  <div name="2">33</div>
  <div name="2">34</div>
  <div name="2">35</div>
</div>