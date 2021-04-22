import React from 'react';
import {Modal, Button, TextField, Table, TableContainer, TableHead, TableCell, TableBody, TableRow} from '@material-ui/core'
import {Edit, Delete} from "@material-ui/icons"
import {Redirect} from 'react-router-dom'
import axios from 'axios'

export default class Document extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            documents: [],
            modalInsert: false,
            modalUpdate: false,
            redirect: false,
            author: this.props.user,
            uid: "",
            title: "",
            status: "",
            body: "",
            editedBy: "",
            isArchive: false
        }
    }

    handleChange = e => {
        const {name, value} = e.target
        this.setState({
            [name]: value
        })
    }

    changeModalInsert = () => {
        this.setState({
            modalInsert:!this.state.modalInsert
        })
    }

    activeArchive = () => {
        this.setState({
            isArchive: true
        })
        this.componentDidMount()
    }

    disableArchive = () => {
        this.setState({
            isArchive: false
        })
        this.componentDidMount()
    }

    componentDidMount = async() => {
        console.log(this.state.isArchive)
        if (this.state.isArchive == false){
            await this.documentGet();
        } else {
            await this.archiveDocumentGet();
        }
    }

    componentDidUpdate = async(prevProps, prevState) => {
        if (!(JSON.stringify(prevState.documents) === JSON.stringify(this.state.documents)) && this.state.isArchive == false){
            this.documentGet()
        } else if ((!(JSON.stringify(prevState.documents) === JSON.stringify(this.state.documents)) && this.state.isArchive == true)){
            this.archiveDocumentGet()
        }
    }

    documentGet = async() => {
        await axios.get('http://127.0.0.1:8080/document/')
        .then(res => {
            this.setState({
                documents: res.data
            })
        })
    }

    archiveDocumentGet = async() => {
        console.log("ARCHIVE")
        await axios.get('http://127.0.0.1:8080/document/archive/')
        .then(res => {
            this.setState({
                documents: res.data
            })
        })
        console.log(this.state.documents)
    }

    documentPost = async() => {
        const data = {
            author: this.state.author,
            title: this.state.title,
            body: this.state.body,
            status: this.state.status,
            editedBy: this.state.editedBy
        }
        await axios.post('http://127.0.0.1:8080/document/', data)
        .then(res => {
            this.setState({
                documents: this.state.documents.concat(res.data)
            })
            this.changeModalInsert()
        })
    }

    documentDelete = (e) => {
        e.preventDefault()
        let uid = e.target.value
        axios.delete('http://127.0.0.1:8080/document/' + uid + '/')
        .then(res => {this.documentGet()})
    }

    documentEdit = (e) => {
        e.preventDefault();
        let uid = e.target.value;
        if (uid !== undefined){
            this.setState({
                redirect: true,
                uid: uid
            })
        }
    }

    render() {
        const modal = {
            position: 'absolute',
            width: 400,
            backgroundColor:"#fff",
            border: '2px solid #000',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }
        const icons = {
            cursor: 'pointer'
        }
        const inputMaterial = {
            width: '100%'
        }
        let documents = this.state.documents

        const bodyInsert = (
            <div style={modal}>
                <h3>Insert Document</h3>
                <TextField style={inputMaterial} name="title" label="Title" onChange={this.handleChange}/>
                <TextField style={inputMaterial} name="author" label="Author" value={this.state.author} onChange={this.handleChange} disabled/>
                <TextField style={inputMaterial} name="body" label="Body" onChange={this.handleChange}/>
                <TextField style={inputMaterial} name="status" label="Status" onChange={this.handleChange}/>
                <div align="right">
                    <Button color="primary" onClick={this.documentPost}>Insert</Button>
                    <Button onClick={this.changeModalInsert}>Cancel</Button>
                </div>
            </div>
        )

        if (this.state.redirect){
            let uid = this.state.uid
            this.props.setUid(uid);
            return <Redirect to={'/document/update/' + uid}/>;
        }

        return(
            <div>
            <Button onClick={this.changeModalInsert}>Add document</Button>
            <Button onClick={this.disableArchive}>All documents</Button>
            <Button onClick={this.activeArchive}>Archived documents</Button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {documents.map((document, index) => {
                        return(
                            <TableRow>
                            <TableCell>{index+1}</TableCell>
                            <TableCell>{document.author}</TableCell>
                            <TableCell>{document.title}</TableCell>
                            <TableCell>{document.status}</TableCell>
                            <TableCell>
                                <Button value={document.uid} onClick={this.documentEdit}><Edit disabled/></Button>
                                <Button value={document.uid} onClick={this.documentDelete}><Delete disabled/></Button>
                            </TableCell>

                        </TableRow>
                        )
                    })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal open={this.state.modalInsert} onClose={this.changeModalInsert}>
                {bodyInsert}
            </Modal>
        </div>
        )
    }
}