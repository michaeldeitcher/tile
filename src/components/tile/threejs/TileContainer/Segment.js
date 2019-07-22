import * as THREE from 'three'
import TileConfig from '../../../../TileConfig'
import ActionManager from '../ActionManager'
import SceneManager from '../SceneManager'
import Selection from './Selection'

export default class Segment {
    constructor(tile) {
        this.data = null;
        this.tile = tile;
        this.threeGroup = tile.threeGroup;
        this.state = null;
        this.threeObject = null;

        this.pressed = false;
    }

    render(state) {
        if( this.data !== null && this.data.equals(state.get("geometryPoints"))){
            return;
        }
        this.removeFromGroup();
        this.id = state.get('id');
        this.data = state.get("geometryPoints");
        const material = this.getMaterial();
        material.side = THREE.DoubleSide;
        this.threeObject = new THREE.Mesh(this.geometry(), material);
        this.threeObject['view'] = this;
        this.threeGroup.add(this.threeObject);
        SceneManager.addToObjects(this.threeObject);
    }

    removeFromGroup() {
        this.threeGroup.remove(this.threeObject);
        SceneManager.removeFromObjects(this.threeObject);
    }

    getMaterial() {
        const materialName = this.tile.state.getIn(['material','material']);
        const colorName = this.tile.state.getIn(['material','color']);
        const material = this.tile.state.get('material').toObject();
        switch (materialName) {
            case 'Basic':
                return new THREE.MeshBasicMaterial(material);
            case 'Lambert':
                return new THREE.MeshLambertMaterial({color: colorName});
            case 'Phong':
                return new THREE.MeshPhongMaterial(material);
            case 'Wireframe':
                $.extend(attr, {wireframe: true}, material);
                return new THREE.MeshBasicMaterial(attr);
        }
        return null;
    }

    mouseMove(coord) {
        return false;
    }

    mouseDown(coord) {
        this.pressed = true;
        return true;
    }

    mouseUp(coord) {
        const selection = {tileId: this.tile.id, segmentId: this.id};
        if ( this.pressed ) {
            ActionManager.addAction('splitTileSegment', selection);
        } else {
            ActionManager.addAction('selectTileSegment', selection);
        }
        this.pressed = false;
        return true;
    }

    tilePosZ() {
        return this.tileView.tilePosZ();
    }

    geometry() {
        const geom = new THREE.Geometry();
        let pointIndex = 0;
        while (pointIndex < this.data.size) {
            geom.vertices.push(this.dataPoint(pointIndex, TileConfig.tile.prefs.depth));
            geom.vertices.push(this.dataPoint(pointIndex, 0));
            pointIndex++;
        }
        // front
        geom.faces.push( new THREE.Face3( 0,2,4) );
        geom.faces.push( new THREE.Face3( 0,6,4) );

        // back
        geom.faces.push( new THREE.Face3( 1,3,5) );
        geom.faces.push( new THREE.Face3( 1,7,5) );

        // top
        geom.faces.push( new THREE.Face3( 7,6,4) );
        geom.faces.push( new THREE.Face3( 5,7,4) );

        // bottom
        geom.faces.push( new THREE.Face3( 3,2,0) );
        geom.faces.push( new THREE.Face3( 1,3,0) );

        // left
        geom.faces.push( new THREE.Face3( 1,0,6) );
        geom.faces.push( new THREE.Face3( 7,1,6) );

        // right
        geom.faces.push( new THREE.Face3( 5,4,2) );
        geom.faces.push( new THREE.Face3( 3,5,2) );

        geom.computeFaceNormals();
        return geom;
    }

    dataPoint(pointIndex, depth) {
        let point = this.data.get(pointIndex);
        const vector3 = new THREE.Vector3(point.get(0), point.get(1), point.get(2 + depth));
        return vector3;
    }
};