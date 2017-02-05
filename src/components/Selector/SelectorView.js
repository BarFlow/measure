import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

import ListItem from './ListItem'

import './selector.css'

const apiUrl = 'https://api.stockmate.co.uk'

const limit = 30

class SelectorView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      skip: parseInt(localStorage.getItem('selector_skip'), 10) || 0,
      name: '',
      products: []
    }
    this.next = this.next.bind(this)
    this.back = this.back.bind(this)
    this.fetchCurrentProducts = this.fetchCurrentProducts.bind(this)
    this.deleteProduct = this.deleteProduct.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
  }

  componentDidMount () {
    this.fetchCurrentProducts()
  }

  fetchCurrentProducts () {
    const req = new Request(`${apiUrl}/products?limit=${limit}&skip=${this.state.skip}&name=${this.state.name}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.props.token}`
      }
    })
    fetch(req)
      .then(response => response.json())
      .then(products => this.setState({ products }))
  }

  deleteProduct (product) {
    const req = new Request(`${apiUrl}/products/${product._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      }
    })
    return fetch(req).then(() => this.setState({
      products: this.state.products.filter(item => item._id !== product._id)
    }))
  }

  next () {
    window.scrollTo(0, 0)
    if (this.state.name === '') {
      localStorage.setItem('selector_skip', this.state.skip + limit)
    }
    this.setState({
      skip: this.state.skip + limit
    }, () => this.fetchCurrentProducts())
  }

  back () {
    window.scrollTo(0, 0)
    if (this.state.name === '') {
      localStorage.setItem('selector_skip', this.state.skip - limit)
    }
    this.setState({
      skip: this.state.skip - limit
    }, () => this.fetchCurrentProducts())
  }

  handleSearchChange (e) {
    clearTimeout(this.timer)
    const skip = e.currentTarget.value === '' ? localStorage.getItem('selector_skip') : 0
    this.setState({ name: e.currentTarget.value, skip })
    this.timer = setTimeout(() => {
      this.fetchCurrentProducts()
    }, 500)
  }

  render () {
    const { products } = this.state
    return (
      <div className='selector'>
        <input type='text' className='form-control' onChange={this.handleSearchChange} placeholder='Search' />
        {!!products.length &&
            products.map(product =>
              <ListItem key={product._id} item={product} deleteCatalogItem={this.deleteProduct} />
            )
        }
        <div className='actions'>
          <Button onClick={this.back}>
            Back
          </Button>
          <Button onClick={this.next} className='pull-right'>
            Next
          </Button>
        </div>
      </div>
    )
  }
}

SelectorView.propTypes = {
  token: React.PropTypes.string.isRequired
}

export default SelectorView
