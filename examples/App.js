import React, { Component } from 'react'
import Crop from 'xcrop/src/components/ReactCrop'

export default class App extends Component {

  constructor (props) {
    super(props)

    this.state = {
      options: {},
      output: ''
    }

    this.onChange = this.onChange.bind(this)
    this.onCancle = this.onCancle.bind(this)
    this.onConfirm = this.onConfirm.bind(this)
    this.onError = this.onError.bind(this)
  }

  onChange (e) {
    this.crop[0].load(e.target.files[0])
  }

  onCancle (crop) {
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
          ref={component => this.crop = component || null}
          options={this.state.options}
          onCancle={this.onCancle}
          onConfirm={this.onConfirm}
          onError={this.onError}
        />
      </div>
    )
  }
}
