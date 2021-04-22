import React from 'react';
import { Grid,Paper, Avatar, TextField, Button, Typography } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import axios from 'axios';
import {Link, Redirect} from 'react-router-dom'

// const config = {
//     headers: { Authorization: `Bearer ${localStorage.getItem('jwt-token')}` }
// };

export default class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            login: false
        }
        this.submit = this.submit.bind(this);
    }

    setUsername(u){
        this.setState({username: u});
    }


    submit = e => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8080/user/login/', {
            username: this.state.username
        })
        .then(res => {
            localStorage.setItem("jwt-token", res.data.token)
            this.setState({login: true})
            this.props.setUser(this.state.username)
        })
        .catch(err => console.log(err))
    }

    render(){
        const paperStyle={padding :20,height:350, width:300, margin: "0 auto"}
        const avatarStyle={backgroundColor:'#1bbd7e'}
        const btnstyle={margin:'8px 0'}

        if (this.state.login){
            return <Redirect to={'/'}/>;
        }

        return(
            <form onSubmit={this.submit}>
                <Paper style={paperStyle}>
                    <Grid align='center'>
                        <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                        <h2>Login</h2>
                    </Grid>
                    <TextField type="login" onChange={e=>this.setUsername(e.target.value)} label='Username' placeholder='Enter username' fullWidth required/>
                    <Button type="submit" color='primary' variant="contained" style={btnstyle} fullWidth>Sign In</Button>
                    <Typography > You don't have an account ?<br/>
                         <Link to={'/register'}>Register new account</Link>
                    </Typography>
                </Paper>
            </form>
        )
    }
}