import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import sendRequest from '../SendRequest';


export class ALayout extends Component {
    static displayName = ALayout.name;
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            categories: [],
            subcategories: [],
        };
        this.singOut = this.singOut.bind(this);

    }

    singOut() {
        sendRequest("/api/User/singOut", "Post", null)
            .then(n => {
                this.setState({
                    user: null,
                })
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("email");
                sessionStorage.removeItem("number");
                sessionStorage.removeItem("userName");
                sessionStorage.removeItem("role");
                sessionStorage.removeItem("isAuthenticated");
                window.location.href = "/";
            }).catch(e => console.error(e))
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
        sendRequest('/api/Categories/GetSubcategories', 'GET', null, null)
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
            <div>
                <button onClick={this.singOut}>Выход</button>
                
                    
                
                {this.props.children} 
            </div>
        );
    }
}
