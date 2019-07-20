import * as THREE from 'three'
import ControlPoint from './ControlPoint'
import Segment from './Segment'
import SceneManager from '../SceneManager'
import { Geometry } from '../../../../geometry' ;

export default class Tile {
    constructor(id) {
        this.id = id;
        this.segments = {};
        this.points = [];
        this.threeGroup = new THREE.Group();
        SceneManager.addToScene(this.threeGroup);
    }

    renderSegments(state) {
        for( let segment of state.entries() ) {
            this.renderSegment(...segment);
        }
    }

    renderSegment(key, state) {
        let segment = this.segments[key];
        if(segment == null){
            segment = new Segment(this);
            this.segments[key] = segment;
        }
        segment.render(state);
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
        if(this.state.get("selected")){
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