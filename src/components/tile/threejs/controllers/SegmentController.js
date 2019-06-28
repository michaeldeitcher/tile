import AppController from './ApplicationController'
import Stage from '../models/Stage'

export default class SegmentController {
    constructor() {}

    handleMouseUp(coord) {
        if (Stage.activeLayer().state === 'select_end') {
            AppController.activeLayerController().processAction('addTileSegment', {coordinates: coord});
            return true;
        } else {
            return false;
        }
    }
};