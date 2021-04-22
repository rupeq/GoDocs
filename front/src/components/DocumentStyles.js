const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
      height: 'calc(100% - 35px)',
      position: 'absolute',
      left: '0',
      width: '300px',
      boxShadow: '0px 0px 2px black'
    },
    titleInput: {
      height: '50px',
      boxSizing: 'border-box',
      border: 'none',
      padding: '5px',
      fontSize: '24px',
      width: '100%',
      backgroundColor: '#29487d',
      color: 'white',
      paddingLeft: '50px',
      display: 'block',
    },
    statusInput: {
      height: '50px',
      boxSizing: 'border-box',
      border: 'none',
      padding: '5px',
      fontSize: '24px',
      width: '100%',
      backgroundColor: '#29487d',
      color: 'white',
      paddingLeft: '50px',
      display: 'block',
      margin:'43px 0 0 0'
    },
    editIcon: {
      position: 'absolute',
      left: '310px',
      top: '12px',
      color: 'white',
      width: '10',
      height: '10'
    },
    editorContainer: {
      height: '100%',
      boxSizing: 'border-box'
    },
    quillContainer: {
      height: '500px'
    },
    buttonContainer: {
      width: '100%'
    },
    modalChat: {
      position: 'absolute',
      width: '400px',
      backgroundColor:"#fff",
      border: '2px solid #000',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    messageContainer: {
      width: "73%"
    }
  });

export default styles;