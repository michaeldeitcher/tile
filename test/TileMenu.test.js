import React from 'react';
import renderer from 'react-test-renderer';
import TileMenu from './../src/components/TileMenu';

it('test to see if the menu renders correctly', () => {
    const tree = renderer
        .create(<TileMenu />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});