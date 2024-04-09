import React, { Component } from 'react';
import './LoginPage.css';
import sendRequest from '../SendRequest';

export class LoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            errorMessage: null,
        };
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleLogin = async (e) => {
        e.preventDefault();

        const { email, password } = this.state;

        sendRequest("/api/User/Login", "POST", {email, password }, null)
            .then(data => {
                sessionStorage.setItem("userName", data.userName);
                sessionStorage.setItem("userId", data.userId);
                sessionStorage.setItem("number", data.number);
                sessionStorage.setItem("email", data.email);
                sessionStorage.setItem("role", data.role);
                sessionStorage.setItem("isAuthenticated", true);

                //await и перенаправление данных корзины    

                // Проверка роли и перенаправление
                if (data.role === 'User') {
                    window.location.href = "/"                  
                } else if (data.role === 'Admin') {
                    window.location.href = "/administrator/AdminPage"                
                } else {
                    window.location.href = "/manager/ManagerPage"
                }
        }).catch(error => {
            this.setState({ errorMessage: error.message || "Произошла ошибка при входе. Пожалуйста, попробуйте снова." });
        });
    }

    render() {
        const { email, password, errorMessage } = this.state;

        return (
            <div>
                <form className="form" onSubmit={this.handleLogin}>
                    <input
                        className="input"
                        type="email"
                        name="email"
                        placeholder="Ваш e-mail"
                        value={email}
                        onChange={this.handleInputChange}
                        required
                    />
                    <input
                        className="input"
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={this.handleInputChange}
                        required
                    />
                    <button className="btn" type="submit">Авторизация</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </form>
            </div>
        );
    }
}

export default LoginPage;
