import './styles/main.scss';
import React from 'react';
import ReactDOM from 'react-dom';

import TileCanvas from "./components/tile/TileCanvas";
import TileMenu from "./components/tile/TileMenu";

const title = 'React with Webpack and Babel';

ReactDOM.render(
  <div>
    <TileMenu />
    <TileCanvas />
  </div>,
  document.getElementById('app')
);
