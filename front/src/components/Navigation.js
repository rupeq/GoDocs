import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';


export default class Navigation extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      anchorEl: null
    }
  }
  handleLogout = () => {
    localStorage.clear()
    this.props.setUser("");
  }

  handleClick = (event) => {
    this.setState({
      anchorEl:event.currentTarget
    })
  };

  handleClose = () => {
    this.setState({
      anchorEl:null
    })
  };


  render() {
    const title={flexGrow:1}
    const menubutton={marginRight: "50"}
    let buttons;

    if (this.props.user){
      buttons = (
        <Button color="inherit" onClick={this.handleLogout}><Link to={'/'}>Logout</Link></Button>
      )
    }
    else{
      buttons = (
        <Button color="inherit"><Link to={'/login'}>Login</Link></Button>
      )
    }

    return (
        <AppBar position="static">
          <Toolbar>
            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleClick}>
                <IconButton edge="start" className={menubutton} color="inherit" aria-label="menu">
                  <MenuIcon />
                </IconButton>
            </Button>
            <Menu id="simple-menu" anchorEl={this.state.anchorEl} keepMounte open={Boolean(this.state.anchorEl)} onClose={this.handleClose}>
              <Link  to={'/documents'}><MenuItem onClick={this.handleClose}>Documents</MenuItem></Link>
            </Menu>
            {/* </IconButton> */}
            <Typography variant="h6" style={title}>
            <Link to={'/'}>GoDocs</Link>
            </Typography>
            {buttons}
          </Toolbar>
        </AppBar>
    )
  }
}