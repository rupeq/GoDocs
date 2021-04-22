import React from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { withStyles } from '@material-ui/core/styles';
import {Button, Modal, Table, TableContainer, TableHead, TableCell, TableBody, TableRow } from '@material-ui/core';
import styles from './DocumentStyles';
import debounce from '../debounce';
import io from 'socket.io-client'

const socket_document = io('http://127.0.0.1:8080/doc')
const socket_mail = io('http://127.0.0.1:8080/mail')

const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('jwt-token')}` }
};

class UpdateComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            redirect: false,
            author: "",
            title: "",
            body: "",
            status: "",
            date:"",
            editedBy:"",
            message:[],
            msg: "",
            isModalActive: false,
            isModalCommentActive: false,
            comments: [],
            commentBody: "",
            userComment: "",
        }
    }

    componentDidMount = async() => {
        await this.getDocument();
        await this.getComments();
    }

    componentDidUpdate = async(prevProps, prevState) => {
        if (!(JSON.stringify(prevState.comments) === JSON.stringify(this.state.comments))){
            this.getComments()
        }
    }

    removeHTMLTags = (str) => {
        return str.replace(/<[^>]*>?/gm, '');
    };

    getComments = async() => {
        await axios.get("http://127.0.0.1:8080/comments/" + this.props.document_uid + "/", config)
        .then(res => {
                this.setState({
                    comments: res.data
                })
        })
        .catch(err => console.log(err))
        console.log(this.state.comments)
    }

    getDocument = async() => {
        await axios.get("http://127.0.0.1:8080/document/" + this.props.document_uid + "/", config)
        .then(res => {
                this.setState({
                    author: res.data.author,
                    title: res.data.title,
                    body: res.data.body,
                    status: res.data.status,
                })
        })
        .catch(err => console.log(err))
    }

    updBody = (value) => {
        this.setState({date:new Date(), body:value, editedBy: this.props.user})
        this.updateBody()
    }

    updateBody = debounce(() => {
        let data = {
            body: this.state.body,
            uid: this.props.document_uid,
            edited_by: this.state.editedBy
        }

        socket_document.emit('document from user', data)

        socket_document.on('from flask body', (data) => {
            this.setState({body: data[0], editedBy: `${data[1]} in body`})
        })
    }, 550);

    updTitle = (value) => {
        this.setState({date:new Date(), title:this.removeHTMLTags(value), editedBy: this.props.user})
        this.updateTitle()
    }

    updateTitle = debounce(() => {
        let data = {
            title: this.state.title,
            uid: this.props.document_uid,
            edited_by: this.state.editedBy
        }

        socket_document.emit('title from user', data)

        socket_document.on('from flask title', (data) => {
            this.setState({title: data[0], editedBy: `${data[1]} in title`})
        })
        console.log("STATE " + this.state.title)
    }, 550);

    updStatus = (value) => {
        this.setState({date:new Date(), status:this.removeHTMLTags(value), editedBy: this.props.user})
        this.updateStatus()
    }

    updateStatus = debounce(() => {
        let data = {
            status: this.state.status,
            uid: this.props.document_uid,
            edited_by: this.state.editedBy
        }

        socket_document.emit('status from user', data)

        socket_document.on('from flask status', (data) => {
            this.setState({status: data[0], editedBy: `${data[1]} in status`})
        })
    }, 550);

    setModal = () => {
        let data = {
            username: this.props.user
        }

        socket_mail.emit('user join', data)

        socket_mail.on('usermessage', (data) => {
            console.log(data)
            this.setState({message: this.state.message.concat(`User ${data} has connected`)})
        })
        this.setState({isModalActive: !this.state.isModalActive})
    }

    disableModal = () => {
        let data = { 
            username: this.props.user
        }

        socket_mail.emit('user join', data)

        socket_mail.on('usermessage', (data) => {
            this.setState({message:this.state.message.concat(`User ${data} has disconnected`)})
        })
        this.setState({isModalActive: !this.state.isModalActive, message:[]})
    }

    disableModalComment = () => {
        this.setState({isModalCommentActive:!this.state.isModalCommentActive})
    }

    sendMessage = () => {
        let data = {
            username: this.props.user,
            message: this.state.msg
        }

        socket_mail.emit('user send', data)

        socket_mail.on('message', (data) => {
            this.setState({message: this.state.message.concat(`${data[0]}: ${data[1]}`)})
        })

        this.setState({msg:""})
    }

    applyComment = () => {
        let data = {
            uid: this.props.document_uid,
            body: this.state.commentBody,
            comment: this.state.userComment
        }

        axios.post('http://127.0.0.1:8080/comments/', data)
        .then(res => {
            this.setState({
                comments: this.state.comments.concat(res.data)
            })
        })
    }

    setMsg = (e) => {
        console.log(e)
        this.setState({msg:e})
    }

    setComment = (e) => {
        console.log(e)
        this.setState({userComment: e})
    }

    setCommentBody =(e) => {
        console.log(e);
        this.setState({commentBody: e})
    }

    signDocument = (e) => {
        let data = {
            is_sign: true,
            status: "archive"
        }

        axios.put('http://127.0.0.1:8080/document/' + this.props.document_uid + '/', data, config)
        .then(res => {
            this.setState({redirect: true})
        })
    }

    render() {
        if (this.state.redirect){
            return <Redirect to={'/'}/>;
        }

        const {classes} = this.props;
        let commentsList;
        let datetime;
        let text;
        let comments = this.state.comments;

        if (this.state.date) {
            datetime = this.state.date;

            text = "Last updated " + datetime + ` by ${this.state.editedBy}`;
        }

        const modalChat = (
            <div className={classes.modalChat}>
                <h3>Chat room</h3>
                <ul>
                    {this.state.message.map((m, i) => {
                        return (<li>{m}</li>)
                    })}
                </ul>
                <div align="right">
                    <input type="text" placeholde="write message" className={classes.messageContainer} onChange={e=>this.setMsg(e.target.value)} value={this.state.msg}/>
                    <Button color="primary" type="submit" onClick={this.sendMessage}>Send</Button>
                    <Button onClick={this.disableModal}>Close</Button>
                </div>
            </div>
        )
        const modalComment = (
            <div className={classes.modalChat}>
                <h3>Create comment</h3>
                <div align="right">
                    <span>Comment to: </span><input type="text" className={classes.messageContainer} onChange={e=>this.setCommentBody(e.target.value)}/><br/>
                    <span>Comment text: </span><input type="text" className={classes.messageContainer} onChange={e=>this.setComment(e.target.value)}/><br/>
                    <Button color="primary" type="submit" onClick={this.applyComment}>Apply</Button>
                    <Button onClick={this.disableModalComment}>Close</Button>
                </div>
            </div>
        )

        if (comments.Length != 0){
            commentsList = (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Author</TableCell>
                                <TableCell>To</TableCell>
                                <TableCell>Comment</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {comments.map((comment, index) => {
                            return(
                                <TableRow>
                                <TableCell>{comment.author}</TableCell>
                                <TableCell>{comment.body}</TableCell>
                                <TableCell>{comment.comment}</TableCell>
                                {/* <TableCell>
                                    <Button value={document.uid} onClick={this.documentEdit}><Edit disabled/></Button>
                                    <Button value={document.uid} onClick={this.documentDelete}><Delete disabled/></Button>
                                </TableCell> */}
                            </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )
        } else {
            commentsList = (<h5>No comments yet</h5>)
        }


        return (
            <div className={classes.editorContainer}>
                <Button className={classes.buttonContainer}  color='primary' variant="contained" onClick={this.setModal}>Room</Button>
                <h3>{text}</h3>
                <input
                    className={classes.titleInput}
                    placeholder='Note title'
                    value={this.state.title ? this.state.title : ''}
                    onChange={(e) => this.updTitle(e.target.value)}/>
                <ReactQuill
                    className={classes.quillContainer}
                    value={this.state.body}
                    onChange={(e) => this.updBody(e)}/>
                <input
                    className={classes.statusInput}
                    placeholder='Note status'
                    value={this.state.status ? this.state.status : ''}
                    onChange={(e) => this.updStatus(e.target.value)}/>
                <Modal open={this.state.isModalActive} onClose={this.setModal}>
                    {modalChat}
                </Modal>
                <Button className={classes.buttonContainer} color='primary' variant="contained" onClick={this.disableModalComment}>Create comment</Button>
                <Modal open={this.state.isModalCommentActive}>
                    {modalComment}
                </Modal>
                {commentsList}
                <Button onClick={this.signDocument}>Подписать документ как {this.props.role}</Button>
            </div>
        )
    }
}

export default withStyles(styles)(UpdateComponent);