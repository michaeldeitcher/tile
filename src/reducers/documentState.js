import { fromJS } from 'immutable'
import {generate} from 'shortid'
import ActionManager from '../components/TileCanvas/ActionManager'

const documentId = generate();

const initialDocumentState = fromJS({
    id: documentId,
    tiles: {},
    selection: {
        tileId: null,
        pointId: null,
        color: '#FF0000',
    }
});

const documents = {};
documents[documentId] = initialDocumentState;

const initialState = fromJS({
    state: 'create',
    currentDocumentId: documentId,
    documents: documents
});

const getDocumentState = (state) => {
    const currentDocumentId = state.get('currentDocumentId');
    return state.getIn(['documents', currentDocumentId]);
}

const mergeDocumentState = (state, documentState) => {
    const currentDocumentId = state.get('currentDocumentId');
    return state.setIn(['documents',currentDocumentId], documentState);
}


export default function tileDocument(state = initialState, action) {
    const documentState = getDocumentState(state);
    switch (action.type) {
        case 'ACTION_MANAGER':
            var newDocumentState = ActionManager.processAction(documentState, action);
            return mergeDocumentState(state, newDocumentState);
        case 'SELECT_COLOR':
            const tileId = documentState.getIn(['selection', 'tileId']);
            var newDocumentState = documentState.setIn(['selection','color'], action.color);
            if(tileId !== null)
                newDocumentState = newDocumentState.setIn(['tiles',tileId.toString(),'material', 'color'], action.color);
            return mergeDocumentState(state, newDocumentState);
        case 'CREATE_NEW_DOCUMENT':
            const newDocumentId = generate();
            var newState = state.setIn(['documents',newDocumentId], initialDocumentState.set('id', newDocumentId));
            return newState.set( 'currentDocumentId', newDocumentId);
        case 'SELECT_DOCUMENT':
            return state.set( 'currentDocumentId', action.documentId);
        default:
            return state;
    }
}