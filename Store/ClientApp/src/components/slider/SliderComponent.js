import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SliderComponent.css';
import { PrevArrow, NextArrow } from './Arrows'; // Импортируем кастомные стрелки

const SliderComponent = () => {
    const images = [
        '/images/1.jpg',
        '/images/2.jpg',
        '/images/4.jpg',
    ];

    const sliderSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        prevArrow: <PrevArrow />, // Используем кастомные стрелки
        nextArrow: <NextArrow />, // Используем кастомные стрелки
    };

    return (
        <div className="image-slider">
            <Slider {...sliderSettings}>
                {images.map((image, index) => (
                    <div key={index}>
                        <img src={image} alt="" />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default SliderComponent;
