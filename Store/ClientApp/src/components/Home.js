import React, { Component } from 'react';
import SliderComponent from '../components/slider/SliderComponent';
import ProductSelection from './ProductSelection';
import BestSellers from './BestSellers';
import './Home.css'; 
export class Home extends Component {
    static displayName = Home.name;


    

    render() {        

        return (
            <div>
                <SliderComponent />
                <ProductSelection />
            {/*    <BestSellers />*/}
            </div>
        );
    }
}

export default Home;
