import React from 'react';
import { Link } from 'react-router-dom';
import './TopSection.css';
import sendRequest from './SendRequest';
import MenuSection from './MenuSection';



class TopSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { user: null };
        this.singOut = this.singOut.bind(this);
    }
    componentDidMount() {
        if (sessionStorage.getItem("userId") === null) {
            sendRequest("/api/User/Check", "Get", null)
                .then(n => {
                    this.setState({
                        user: n,
                    })
                    sessionStorage.setItem("userName", n.userName);
                    sessionStorage.setItem("userId", n.userId);
                    sessionStorage.setItem("number", n.number);
                    sessionStorage.setItem("email", n.email);
                    sessionStorage.setItem("role", n.role);
                    sessionStorage.setItem("isAuthenticated", true);

                    if (n.role === 'Admin') {
                        window.location.href = "/administrator/AdminPage"
                    }
                    if (n.role === 'Manager') {
                        window.location.href = "/manager/ManagerPage"
                    }                    
                }).catch(e => console.error(e))
        }       
    }


    singOut() {
        sendRequest("/api/User/singOut", "Post", null)
            .catch(function (error) {
                console.log(error);
            })
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
            })
    }

    render() {
        return (
            <div className="top-section">
                <Link className="logo" to="/"> 
                    <img src="/images/qq.png"/>
                </Link>
                <div className="work-time">
                    <div>А1: +375 29 666 66 66</div> 
                    <div>Работаем без выходных</div>                    
                    <div>C 9:00 до 19:00</div>                    
                </div>    
                <MenuSection />
                <Link className="no-line" to="/user/CartPage">
                    <button className="cart-button-on-top-section">Корзина</button>
                </Link>
                
                {sessionStorage.getItem("userId") !== null ?
                (
                        <div className="auth-buttons">
                            <Link className="text-dark" to="/user/UserProfilePage">
                                <button>Мой профиль</button>
                            </Link>
                            <Link className="text-dark" to="/">
                                <button onClick={this.singOut}>Выход</button>
                            </Link>
                        </div>
                ) : (
                        <div className="auth-buttons">
                            <Link className="text-dark" to="/Authentication/RegisterPage">
                                <button>Регистрация</button>
                            </Link>
                            <Link className="text-dark" to="/Authentication/LoginPage">
                                <button>Авторизация</button>
                            </Link>
                        </div> 
                )}
                
            </div>
        );
    }
}

export default TopSection;
