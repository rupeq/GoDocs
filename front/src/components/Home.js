import React from 'react';


export default class Home extends React.Component {e
    render() {
        let role = this.props.role;
        if (this.props.user){
            return(
                <div>
                    <h2>Hi {this.props.user}</h2>
                    <h3>You are {role}</h3>
                </div>
            )
        }
        return (
            <div>
                <h2>You are not logged in</h2>
            </div>
        )
    }
}