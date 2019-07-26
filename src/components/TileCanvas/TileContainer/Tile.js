import * as THREE from 'three'
import ControlPoint from './ControlPoint'
import Segment from './Segment'
import SceneManager from '../SceneManager'
import Selection from './Selection'

export default class Tile {
    constructor(id) {
        this.id = id;
        this.segments = [];
        this.points = [];
        this.threeGroup = new THREE.Group();
        SceneManager.addToScene(this.threeGroup);
    }

    remove(){
        this.removeSegments();
        this.removePoints();
    }

    removeSegments(){
        var segment = this.segments.pop();
        while(segment) {
            segment.removeFromGroup();
            segment = this.segments.pop();
        }
    }

    renderSegments(state) {
        this.removeSegments();
        for( let segment of state ) {
            this.renderSegment(segment);
        }
    }

    renderSegment(state) {
        const segment = new Segment(this);
        segment.render(state);
        this.segments.push(segment);
    }

    removePoints(){
        var point = this.points.pop();
        while(point) {
            point.removeFromGroup();
            point = this.points.pop();
        }
    }

    renderPoints(state){
        this.removePoints();
        if(Selection.tileId == this.id){
            for( let point of state ) {
                this.renderControlPoint(point);
            }
        }
    }

    renderControlPoint(state) {
        const point = new ControlPoint(state.get("id"), this);
        point.render(state);
        this.points.push(point);
    }

    render(state) {
        this.state = state;
        this.position = state.get('position');
        this.threeGroup.position.set(...this.position);
        this.renderPoints(state.get("points"));
        this.renderSegments(state.get("segments"));
    }
}