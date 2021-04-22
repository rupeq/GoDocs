import React from 'react';
import Login from './components/LoginComponent';
import Navigation from './components/Navigation';
import Document from './components/DocumentComponent';
import Home from './components/Home';
import Register from './components/RegisterComponent.js';
import UpdateComponent from './components/UpdateDocumentComponent';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import axios from 'axios';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        username: '',
        userRole: '',
        uid: ''
    }
}

  componentDidMount(){
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt-token')}` }
    }
    axios.get('http://127.0.0.1:8080/users/', config).then(
        res => {
            this.setUser(res.data.username)
            this.setUserRole(res.data.role ? res.data.role : res.data.ceo)
        },
        err => {
            console.log(err);
        }
    )
}

setUser = user => {
  console.log(user)
  this.setState({
    username:user,
  })
}

setUserRole = role => {
  if (role == true) {
    role = "ceo"
  } else {
    role = role
  }
  this.setState({
    userRole:role
  })
}

setUid = uid => {
  this.setState({
    uid:uid
  })
}

  render() {
    return(
      <BrowserRouter>
        <div className="App">
          <Navigation user={this.state.username} setUser={this.setUser}/>
          <div className="auth-wrapper">
            <div className="auth-inner">
              <Switch>
                <Route exact path="/" component={()=><Home user={this.state.username} role={this.state.userRole}/>}/>
                <Route exact path="/login" component={()=><Login setUser={this.setUser} setUserRole={this.setUserRole}/>}/>
                <Route exact path="/register" component={Register}/>
                <Route exact path="/documents" component={()=><Document user={this.state.username} setUid={this.setUid}/>}/>
                <Route exact path={`/document/update/${this.state.uid}`} component={()=><UpdateComponent document_uid={this.state.uid} user={this.state.username} role={this.state.userRole}/>}/>
              </Switch>
            </div>
          </div>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
