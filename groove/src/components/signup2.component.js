import React, { Component } from 'react';
import { supabase } from '../supabase/supabaseClient';

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    };
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = this.state;
    let { user, error } = await supabase.auth.signUp({ email, password });
    if (error) console.error('Error: ', error.message);
    else console.log('User signed up: ', user);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {/* ... */}
        <input
          type="text"
          className="form-control"
          placeholder="First name"
          name="firstName"
          onChange={this.handleInputChange}
        />
        {/* ... */}
        <input
          type="text"
          className="form-control"
          placeholder="Last name"
          name="lastName"
          onChange={this.handleInputChange}
        />
        {/* ... */}
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          name="email"
          onChange={this.handleInputChange}
        />
        {/* ... */}
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          name="password"
          onChange={this.handleInputChange}
        />
        {/* ... */}
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
        {/* ... */}
      </form>
    );
  }
}
