import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AddToPhotos } from '@material-ui/icons';

const createNewDocument = title => ({
    type: 'CREATE_NEW_DOCUMENT',
    title
})

const selectDocument = documentId => ({
    type: 'SELECT_DOCUMENT',
    documentId
})

const mapStateToProps = state => {
    return {documents: state.getIn(['documentState', 'documents'])};
}

class DocumentGallery extends Component {
    createNewDocument() {
        this.props.createNewDocument(Date.now());
    }

    selectDocument(id) {
        this.props.selectDocument(id);
    }

    render () {
        return (
            <div>
                <button onClick={() => this.createNewDocument()}><AddToPhotos/></button>
                {
                    this.props.documents.entrySeq().map(([id, document]) => {
                        return <button key={id} onClick={() => this.selectDocument(id)}></button>
                    })
                }
            </div>
        );
    };
}

export default connect(
    mapStateToProps,
    { createNewDocument, selectDocument }
)(DocumentGallery);