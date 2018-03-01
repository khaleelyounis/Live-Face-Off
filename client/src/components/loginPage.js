import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/login.css';
import DisplayMessages from './errorMessage';
import axios from 'axios';
import { connect } from 'react-redux';
import { signIn } from '../actions';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                email: '',
                password: ''
            },
            messages: null
        }
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        const { form } = this.state;
        event.preventDefault();
        console.log('login submitted');
        axios.post('/users/login', form)
            .then(res => {
                console.log("this is the response", res);
                if (res.data.hasOwnProperty('messages')) {
                    this.setState({
                        messages: res.data.messages
                    });
                } else {
                    //redux action creator
                    console.log('tesssing')
                    this.props.signIn();
                }


            }).catch(error => {
                console.log('catcherrr', error)
            });
    }
    handleInput(event) {
        const { value, name } = event.target;
        const { form } = this.state;
        form[name] = value;
        this.setState({
            form: { ...form }
        });
    }
    render() {
        const { handleInput, handleSubmit } = this;
        const { email, password, messages } = this.state;
        return (
            <div className='container'>
                <DisplayMessages messages={messages} />
                <div className='signInArea z-depth-5'>
                    <div className='row'>
                        <div className="col s12 homeTitle center-align">
                            <h1>Live Face Off</h1>
                        </div>
                    </div>
                    <div className="row">
                        <form className="col s12 center-align" onSubmit={handleSubmit}>
                            <div className='inputFieldCentering'>
                                <div className="row">
                                    <div className="input-field col s12">
                                        <i className="material-icons prefix">mail_outline</i><input type="text" className="validate" name="email" placeholder="Email" onChange={handleInput} value={email} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="input-field col s12">
                                        <i className="material-icons prefix">work</i><input id="password" type="password" className="validate" name="password" placeholder="Password" onChange={handleInput} value={password} />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className='buttonArea col s12'>
                                    <button type="submit" className='logInBtn waves-effect waves-light btn blue-grey darken-2'>Log In</button>
                                </div>
                            </div>

                            <div className="row">
                                <div className='buttonAreaTwo col s12 center-align'>
                                    <h5 className='center-align'>Or login with</h5>
                                    <br />
                                    <a className="facebookBtn waves-effect waves-light btn light-blue darken-4" href="/auth/facebook">Facebook</a>
                                    <a className="googleBtn waves-effect waves-light btn deep-orange darken-4" href="/auth/google">Google</a>
                                </div>
                            </div>
                            <br />
                            <div className="row">
                                <span>Don't have an account yet?</span><Link className='signInBtn waves-effect waves-light btn blue-grey darken-2' to='/register'>Sign Up</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}


export default connect(null, { signIn: signIn })(LoginPage);