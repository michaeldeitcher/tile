import AppController from './ApplicationController'
import Stage from '../models/Stage'

export default class ControlPointController {
    constructor() {}

    handleMouseMove(coord) {
        switch (Stage.instance.activeLayer().state) {
            case 'select_control_point': case 'move_control_point':
            return AppController.activeLayerController().processAction('moveControlPoint', {coordinates: coord});
        }
    }

    handleMouseUp(coord) {
        switch (Stage.instance.activeLayer().state) {
            case 'select_control_point':
                return AppController.activeLayerController().processAction('removeControlPoint');
            case 'move_control_point':
                Stage.instance.activeLayer().controlPoint = null;
                Stage.instance.activeLayer().state = 'select_all';
            default:
                return false;
        }
    }
};