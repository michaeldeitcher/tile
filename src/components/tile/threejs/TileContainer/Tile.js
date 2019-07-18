import * as THREE from 'three'
import ControlPoint from './ControlPoint'
import SceneManager from '../SceneManager'

export default class Tile {
    constructor(id) {
        this.id = id;
        this.segments = [];
        this.points = [];
        this.threeGroup = new THREE.Group();
        SceneManager.addToScene(this.threeGroup);
    }

    removeSegments(){
        var segment = this.segments.pop();
        while(segment) {
            segment.removeFromGroup();
            segment = this.segments.pop();
        }
    }

    renderSegment(id, state) {
        var segment = this.segments[id];
        if(segment == null)
            segment = new Segment(this.threeGroup);
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
        this.threeGroup.position.set(...state.get('position'));
        this.removeSegments();
        this.renderPoints(state.get("points"))
    }
}