import { Geometry } from './geometry' ;
import './styles/main.scss';
import React from 'react';
import ReactDOM from 'react-dom';

import TileCanvas from "./components/tile/TileCanvas";

const title = 'React with Webpack and Babel';

ReactDOM.render(
  <div>
    {title}
    <TileCanvas />
  </div>,
  document.getElementById('app')
);

console.log( Geometry.getDistance([0,0],[1,1]));
