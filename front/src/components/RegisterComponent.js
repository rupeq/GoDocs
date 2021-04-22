import React from 'react';
import { Grid,Paper, Avatar, TextField, Button } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import axios from 'axios';

export default class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: "",
            role: "",
            ceo: false,
            company: "",
        }
    }

    setUsername = e => {
        this.setState({username: e})
        console.log(e)
    }

    setCompany = e => {
        this.setState({company: e})
    }

    setRole = e => {
        if (e == "economist" || e == "lawyer"){
            console.log(e)
            this.setState({role:e})
        }
        else if (e == "ceo"){
            this.setState({ceo:true})
        }
    }

    submit = e => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8080/user/register/', {
            username: this.state.username,
            role: this.state.role,
            ceo: this.state.ceo,
            company: this.state.company
        })
        .catch(err => console.log(err))
    }

    render(){
        const paperStyle={padding :20,height:350, width:300, margin: "0 auto"}
        const avatarStyle={backgroundColor:'#1bbd7e'}
        const btnstyle={margin:'8px 0'}

        return(
            <form onSubmit={this.submit}>
                <Paper style={paperStyle}>
                    <Grid align='center'>
                        <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                        <h2>Sign up</h2>
                    </Grid>
                    <TextField type="login" label='Username' onChange={e=>this.setUsername(e.target.value)} placeholder='Enter username' fullWidth required/>
                    <TextField type="text" label='Company' placeholder='Enter your company' onChange={e=>this.setCompany(e.target.value)} fullWidth />
                    <TextField type="text" label='Role' placeholder='Enter your role: ceo, economist or lawyer' onChange={e=>this.setRole(e.target.value)} fullWidth />
                    <Button type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Sign up</Button>
                </Paper>
            </form>
        )
    }
}