// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react'
// eslint-disable-next-line no-unused-vars
import Crop from 'xcrop/src/components/ReactCrop'

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      options: {},
      output: ''
    }

    this.onChange = this.onChange.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onConfirm = this.onConfirm.bind(this)
    this.onError = this.onError.bind(this)
  }

  onChange (e) {
    this.crop[0].load(e.target.files[0])
  }

  onCancel (crop) {
    crop.hide()
  }

  onConfirm (crop) {
    this.setState({
      output: crop.get()
    })
    crop.hide()
  }

  onError (error) {
    console.log(error)
  }

  render () {
    return (
      <div className="App">
        <input type="file" onChange={this.onChange} accept="image/*" value="" />

        {this.state.output && <img src={this.state.output} width="100%" alt="" />}

        <Crop
          ref={component => { this.crop = component || null }}
          options={this.state.options}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          onError={this.onError}
        />
      </div>
    )
  }
}
