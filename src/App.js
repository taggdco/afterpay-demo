import React, { Component } from 'react';
import './App.css';

const getMedia = (items = 2, brand, categories, order) => {
  const params = `page_size=${items}&brand=${brand}&category=${categories}&order=${order}`
  return fetch(
    `https://api.taggd.co/api/v2/media/www.afterpay.com.au.json?${params}`
  )
}

class App extends Component {
  state = {
    categories: null,
    mediaByBrand: null,
    selectedCategories: [],
    selectedBrand: 'all',
    selectedOrder: 'approved_at'
  }

  async componentDidMount() {
    const mediaByBrand = {}
    const categoryRes = await fetch('https://api.taggd.co/api/v2/categories/www.afterpay.com.au.json')
    const categories = await categoryRes.json();
    await categories.data.filter((category) => category.group === 'brand').map(async ({name}) => {
      const mediaRes = await getMedia(2, encodeURIComponent(name.toLowerCase()), encodeURIComponent(this.state.selectedCategories.join(',')), encodeURIComponent(this.state.selectedOrder))
      const media = await mediaRes.json();
      mediaByBrand[name.toLowerCase()] = media.data;
      this.setState({mediaByBrand})
    })
    this.setState({categories: categories.data});
  }

  apply = async () => {
    const mediaByBrand = {}
    if (this.state.selectedBrand === 'all') {
      await this.state.categories.filter((category) => category.group === 'brand').map(async ({name}) => {
        const mediaRes = await getMedia(2, encodeURIComponent(name.toLowerCase()), encodeURIComponent(this.state.selectedCategories.join(',')), encodeURIComponent(this.state.selectedOrder))
        const media = await mediaRes.json();
        mediaByBrand[name.toLowerCase()] = media.data;
        this.setState({mediaByBrand})
      })
    } else {
      const mediaRes = await getMedia(10, encodeURIComponent(this.state.selectedBrand), encodeURIComponent(this.state.selectedCategories.join(',')), encodeURIComponent(this.state.selectedOrder))
      const media = await mediaRes.json();
      mediaByBrand[this.state.selectedBrand] = media.data;
      this.setState({mediaByBrand})
    }
  }

  selectOrder = (evt) => {
    this.setState({selectedOrder: evt.target.value})
  }

  selectBrand = (evt) => {
    this.setState({selectedBrand: evt.target.value})
  }

  toggleCategory = (evt) => {
    let selectedCategories = [];
    if (this.state.selectedCategories.indexOf(evt.target.value) !== -1) {
      selectedCategories = this.state.selectedCategories.filter((category) => category !== evt.target.value)
    } else {
      selectedCategories = this.state.selectedCategories.concat(evt.target.value)
    }
    this.setState({selectedCategories})
  }

  render() {
    
    return (
      <div className="App">
        <div className="filter">
          <div className="brand">
            <p>Brand</p>
            {this.state.categories && (
              <select onChange={this.selectBrand}>
                <option value="all">All</option>
                {this.state.categories.filter((category) => category.group === 'brand').map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="categories">
            <p>Categories</p>
            {this.state.categories && this.state.categories.filter((category) => category.group === 'afterpay').map((category) => (
              <label key={category.id}>
                <input type="checkbox" onChange={this.toggleCategory} value={category.name}/>
                {category.name}
                <br />
              </label>
            ))}
          </div>
          <div className="sort">
            <p>Order</p>
            <select onChange={this.selectOrder}>
              <option value="approved_at">Newest</option>
              <option value="likes">Most Popular</option>
            </select>
          </div>
          <button className="button" onClick={this.apply}>Apply</button>
        </div>
        {this.state.mediaByBrand && Object.entries(this.state.mediaByBrand).map(([brand, media]) => (
          <div className="media" key={brand}>
            <p>{brand.toUpperCase()}</p>
            {media.map(({ id, image_std_res, link, products }) => (
              <div className="medium" key={id}>
                <img className="mediumImage" src={image_std_res} alt={link}/>
                <img className="productImage" src={products[0].image_url} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default App;
