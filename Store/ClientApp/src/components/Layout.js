import React, { Component } from 'react';
import TopSection from './TopSection';
import CategoryList from './CategoryList';
import sendRequest from './SendRequest';
import './Layout.css';


export class Layout extends Component {
  static displayName = Layout.name;
    constructor(props) {
        super(props);

        this.state = {
            categories: [],
            subcategories: [],
        };
    }

    componentDidMount() {
        this.getCategories();
        this.getSubcategories();
    }

    getCategories() {
        sendRequest('/api/Categories/GetCategories', 'GET', null, null)
            .then((categories) => {
                console.log(categories);
                this.setState({ categories });
            })
            .catch((error) => {
                console.error('Ошибка при получении категорий:', error);
            });
    }

    getSubcategories() {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET', null, null)
            .then((subcategories) => {
                console.log(subcategories);
                this.setState({ subcategories });
            })
            .catch((error) => {
                console.error('Ошибка при получении подкатегорий:', error);
            });
    }
  render() {
      return (
      <div className="full-container">        
        <TopSection />            
            <div className="main-container">
                <div className="base">
                    <div className="left-section">
                        <CategoryList
                            categories={this.state.categories}
                            subcategories={this.state.subcategories}
                        />
                    </div>
                    <div className="right-section">                    
                        {this.props.children} 
                    </div>
                </div>
            </div>                     
      </div>
    );
  }
}
