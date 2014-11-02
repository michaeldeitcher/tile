window.TileWebGL = {
  Models: {},
  Controllers: {},
  Views: {},
  appController: void 0,
  appView: void 0,
  stage: void 0,
  prefs: {
    width: 30,
    segmentStartLength: 100,
    depth: 10
  },
  svgOverlay: void 0,
  updateTileProject: void 0,
  activeLayerController: void 0,
  planes: {},
  config: {
    tile: {
      material: {
        color: "#ff3300",
        colorAmbient: "#FFFFFF",
        colorEmissive: "#FFFFFF",
        colorSpecular: "#FFFFFF",
        shininess: 30,
        opacity: 1,
        material: "Basic"
      }
    }
  }
};

window.App = window.Overlay = Ember.Application.create();

//# sourceMappingURL=abc.js.map
;TileWebGL.Controllers.AppController = (function() {
  function AppController(state) {
    TileWebGL.appController = this;
    this.initStateMachine();
    this.appView = new TileWebGL.Views.AppView();
    TileWebGL.activeLayerController = this.activeLayerController;
  }

  AppController.prototype.start = function() {
    this.stage = new TileWebGL.Models.Stage();
    this.layerControllers = [new TileWebGL.Controllers.LayerController()];
    this.activeLayerController().start();
    return this.changeState('show');
  };

  AppController.prototype.activeLayerController = function() {
    return TileWebGL.appController.layerControllers[0];
  };

  AppController.prototype.clearStage = function() {
    this.stage.clear();
    this.start();
    return this.enableEditing();
  };

  AppController.prototype.replayHistoryString = function(historyString) {
    return this.replayHistory(JSON.parse(historyString));
  };

  AppController.prototype.historyString = function() {
    return JSON.stringify(this.activeLayerController().layer.history);
  };

  AppController.prototype.enableEditing = function() {
    return this.changeState('create');
  };

  AppController.prototype.replayHistory = function(history) {
    this.lastState = this.changeState('replay');
    return this.activeLayerController().layer.animateHistory(history.reverse());
  };

  AppController.prototype.replayCanvas = function() {
    var history, lastState;
    this.stage.clear();
    history = this.activeLayerController().layer.history;
    lastState = this.state;
    this.start();
    this.changeState('replay');
    this.lastState = lastState;
    return this.activeLayerController().layer.animateHistory(history.reverse());
  };

  AppController.prototype.onDoneReplay = function() {
    return this.changeState(this.lastState);
  };

  AppController.prototype.setMaterial = function(material) {
    var layer, _i, _len, _ref, _results;
    _ref = this.layerControllers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      _results.push(layer.setMaterial(material));
    }
    return _results;
  };

  AppController.prototype.toggleOrbitControls = function() {
    if (this.orbitOn) {
      TileWebGL.appView.disableOrbitControls();
      return this.orbitOn = false;
    } else {
      TileWebGL.appView.enableOrbitControls();
      return this.orbitOn = true;
    }
  };

  AppController.prototype.initStateMachine = function() {
    this.states = ['init', 'create', 'replay', 'show'];
    this.stateHandlers = [];
    return this.changeState('init');
  };

  AppController.prototype.changeState = function(state) {
    var handler, lastState, _i, _len, _ref;
    if (this.state === state) {
      return;
    }
    if ($.inArray(state, this.states) === -1) {
      throw 'not a valid state';
    }
    lastState = this.state;
    this.state = state;
    _ref = this.stateHandlers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      handler = _ref[_i];
      handler(state);
    }
    return lastState;
  };

  AppController.prototype.onStateChange = function(handler) {
    return this.stateHandlers.push(handler);
  };

  return AppController;

})();

//# sourceMappingURL=application.js.map
;TileWebGL.Controllers.LayerController = (function() {
  function LayerController(svg, stageSize) {
    this.svg = svg;
    this.stageSize = stageSize;
  }

  LayerController.prototype.start = function() {
    this.layer = TileWebGL.stage.activeLayer();
    this.layerView = new TileWebGL.Views.Layer();
    this.layer.layerView = this.layerView;
    this.tileController = new TileWebGL.Controllers.TileController(this.layer);
    this.tileController.loadTiles();
    this.segmentController = new TileWebGL.Controllers.SegmentController();
    this.controlPointController = new TileWebGL.Controllers.ControlPointController();
    this.processAction('setVersionInfo', {
      version: '0.2'
    });
    return this.selectedTileSegment = null;
  };

  LayerController.prototype.mouseMove = function(point) {
    if (this.controlPointMoving) {
      return this.processAction('moveControlPoint', {
        coordinates: point
      });
    }
  };

  LayerController.prototype.mouseUp = function(coord) {
    if (this.controlPointMoving) {
      return this.controlPointMoving = false;
    }
    if (this.layer.segment) {
      return this.processAction('clearSelection');
    } else {
      return this.processAction('addTile', {
        coordinates: [coord[0], coord[1] - (.5 * TileWebGL.prefs.width)]
      });
    }
  };

  LayerController.prototype.setMaterial = function(material) {
    return this.processAction('setMaterial', {
      material: material
    });
  };

  LayerController.prototype.selectTileSegment = function(selection) {
    if (this.selectedTileSegment) {
      this.processAction('clearSelection');
    }
    this.selectedTileSegment = selection;
    return this.processAction('selectTileSegment', {
      tile: selection[0],
      segment: selection[1]
    });
  };

  LayerController.prototype.splitTileSegment = function(selection) {
    this.processAction('splitTileSegment', {
      tile: selection[0],
      segment: selection[1]
    });
    return this.selectedControlPoint = null;
  };

  LayerController.prototype.isCurrentSegmentSelected = function(selection) {
    if (this.selectedTileSegment == null) {
      return false;
    }
    return this.selectedTileSegment[0] === selection[0] && this.selectedTileSegment[1] === selection[1];
  };

  LayerController.prototype.toggleWall = function() {
    return this.layerView.showWall(this.layerView.wall == null);
  };

  LayerController.prototype.controlPointMouseDown = function(id) {
    if (this.selectedControlPoint !== id) {
      this.processAction('selectControlPoint', {
        id: id
      });
      this.selectedControlPoint = id;
      return this.controlPointMoving = true;
    }
  };

  LayerController.prototype.controlPointMouseUp = function(id) {
    if (this.controlPointMoving) {
      return this.controlPointMoving = false;
    } else {
      if (this.selectedControlPoint === id) {
        return this.processAction('removeControlPoint');
      }
    }
  };

  LayerController.prototype.processAction = function(action, d) {
    if (d == null) {
      d = {};
    }
    d['action'] = action;
    this.layer.addAction(d);
    return this.layer.processActions();
  };

  return LayerController;

})();

//# sourceMappingURL=layer.js.map
;TileWebGL.Controllers.TileController = (function() {
  function TileController(layer) {
    this.layer = layer;
  }

  TileController.prototype.loadTiles = function() {
    var t, _i, _len, _ref, _results;
    _ref = this.layer.tiles;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      _results.push(this.addTileView(t.tile, t.location));
    }
    return _results;
  };

  TileController.prototype.addTile = function(location) {
    if (this.tile) {
      return;
    }
    this.tile = this.layer.addTile(location);
    return this.addTileView(this.tile, location);
  };

  TileController.prototype.addTileView = function(tile, location) {
    var layerView;
    layerView = this.layer.layerView;
    layerView.addTile(tile, location);
    return layerView.enableEditing();
  };

  TileController.prototype.handleMouseUp = function(coord) {
    if (TileWebGL.stage.activeLayer().tile != null) {
      TileWebGL.activeLayerController().processAction('clearSelection');
      return true;
    } else {
      return false;
    }
  };

  return TileController;

})();

TileWebGL.Controllers.SegmentController = (function() {
  function SegmentController() {}

  SegmentController.prototype.handleMouseUp = function(coord) {
    if (TileWebGL.stage.activeLayer().state === 'select_end') {
      TileWebGL.activeLayerController().processAction('addTileSegment', {
        coordinates: coord
      });
      return true;
    } else {
      return false;
    }
  };

  return SegmentController;

})();

TileWebGL.Controllers.ControlPointController = (function() {
  function ControlPointController() {}

  ControlPointController.prototype.handleMouseMove = function(coord) {
    switch (TileWebGL.stage.activeLayer().state) {
      case 'select_control_point':
      case 'move_control_point':
        return TileWebGL.activeLayerController().processAction('moveControlPoint', {
          coordinates: coord
        });
    }
  };

  ControlPointController.prototype.handleMouseUp = function(coord) {
    switch (TileWebGL.stage.activeLayer().state) {
      case 'select_control_point':
        return TileWebGL.activeLayerController().processAction('removeControlPoint');
      case 'move_control_point':
        TileWebGL.stage.activeLayer().controlPoint = null;
        return TileWebGL.stage.activeLayer().state = 'select_all';
      default:
        return false;
    }
  };

  return ControlPointController;

})();

//# sourceMappingURL=tile.js.map
;TileWebGL.Controllers.ToolbarController = (function() {
  function ToolbarController(svg) {
    this.svg = svg;
    TileWebGL.toolbarController = this;
    this.toolbar = new TileWebGL.Views.Toolbar(this);
    this.addTile = true;
    TileWebGL.appController.onStateChange((function(_this) {
      return function(state) {
        switch (state) {
          case 'replay':
            return _this.toolbar.enableReplay();
          case 'create':
            return _this.toolbar.enableEdit();
          case 'show':
            return _this.toolbar.enableShow();
        }
      };
    })(this));
  }

  ToolbarController.prototype.flashMessage = function(msg) {
    this.msg = msg;
    return this.hud.flashMessage(this.msg);
  };

  ToolbarController.prototype.toolbarOpen = function() {
    if (this.toolbar.opened) {
      d3.event.stopPropagation();
      return true;
    } else {
      return false;
    }
  };

  ToolbarController.prototype.addPressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    this.addTile = true;
    return this.closeToolbar();
  };

  ToolbarController.prototype.clearPressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    TileWebGL.appController.clearStage();
    return this.closeToolbar();
  };

  ToolbarController.prototype.exitPressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    return this.closeToolbar();
  };

  ToolbarController.prototype.replayPressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    this.closeToolbar();
    return TileWebGL.appController.replayCanvas();
  };

  ToolbarController.prototype.continueReplayPressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    this.closeToolbar();
    return TileWebGL.stage.activeLayer().continueAnimation();
  };

  ToolbarController.prototype.completeReplayPressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    this.closeToolbar();
    return TileWebGL.stage.activeLayer().completeAnimation();
  };

  ToolbarController.prototype.savePressed = function() {
    if (!this.toolbarOpen()) {
      return;
    }
    this.closeToolbar();
    return TileWebGL.updateTileProject();
  };

  ToolbarController.prototype.showToolbar = function(coord) {
    this.toolbar.open();
    if (TileWebGL.appController.state === 'create') {
      this.addTile = true;
    }
    return this.targetCoord = coord;
  };

  ToolbarController.prototype.closeToolbar = function() {
    this.toolbar.close();
    this.targetCoord = null;
    return this.addTile = false;
  };

  return ToolbarController;

})();

//# sourceMappingURL=toolbar.js.map
;var updateColor;

Overlay.Router.map(function() {
  this.resource('planes', {
    path: "/"
  });
  this.resource('plane', {
    path: "/plane/:plane_id"
  });
  return this.resource('commands');
});

Overlay.PlanesRoute = Ember.Route.extend({
  model: function(params) {
    return TileWebGL.Models.Plane.all();
  }
});

Overlay.PlanesController = Ember.ArrayController.extend({
  actions: {
    createPlane: function() {
      var plane;
      plane = TileWebGL.Models.Plane.create();
      TileWebGL.Models.Plane.save();
      return this.transitionToRoute('plane', plane.id);
    }
  }
});

Overlay.PlaneRoute = Ember.Route.extend({
  model: function(params) {
    return TileWebGL.Models.Plane.find(params.plane_id);
  }
});

Overlay.MenuController = Ember.ObjectController.extend({
  menuToggleText: 'Hide menu',
  menuVisible: true,
  actions: {
    menuToggle: function() {
      if (this.get('menuVisible')) {
        $("ul#menu li:not('#menuToggle')").fadeOut();
        this.set('menuVisible', false);
        return this.set('menuToggleText', 'Show Menu');
      } else {
        $("ul#menu li:not('#menuToggle')").fadeIn();
        this.set('menuVisible', true);
        return this.set('menuToggleText', 'Hide Menu');
      }
    }
  }
});

Overlay.PlaneController = Overlay.MenuController.extend({
  start: (function() {
    var history, model;
    if (!this.started) {
      TileWebGL.appController.start();
      TileWebGL.appController.changeState('create');
      this.started = true;
      model = this.get('model');
      history = model.history;
      if (history.length > 0) {
        TileWebGL.appController.replayHistoryString(history);
      }
    }
    return '';
  }).property(),
  actions: {
    save: function() {
      var model;
      model = this.get('model');
      model.history = TileWebGL.appController.historyString();
      return TileWebGL.Models.Plane.save();
    },
    replay: function() {
      return TileWebGL.appController.replayCanvas();
    },
    clear: function() {
      return TileWebGL.appController.clearStage();
    }
  }
});

updateColor = function(color) {
  var layer, material;
  layer = TileWebGL.activeLayerController().layer;
  material = layer.material;
  material.color = color;
  return layer.setMaterial({
    material: material
  });
};

Overlay.CommandsController = Overlay.MenuController.extend({
  actions: {
    red: function() {
      return updateColor('#FF0000');
    },
    blue: function() {
      return updateColor('#0000FF');
    },
    white: function() {
      return updateColor('#999999');
    },
    startRecording: function() {
      return TileWebGL.Models.Macro.startRecordingMacro();
    },
    play: function() {
      var d, macro;
      TileWebGL.Models.MacroReplay.stop = false;
      macro = TileWebGL.Models.Macro.recordingMacro();
      d = {
        macro_id: macro.id
      };
      return TileWebGL.activeLayerController().layer.playMacro(d);
    },
    stop: function() {
      return TileWebGL.Models.MacroReplay.stop = true;
    }
  }
});

//# sourceMappingURL=overlay.js.map
;TileWebGL.Models.Config = (function() {
  function Config() {}

  return Config;

})();

//# sourceMappingURL=config.js.map
;TileWebGL.Models.Layer = (function() {
  function Layer(stage) {
    this.stage = stage;
    this.startTime = new Date().getTime();
    this.history = [];
    this.tiles = [];
    this.actions = [];
    this.tile = null;
    this.segment = null;
    this.controlPoint = null;
    this.material = TileWebGL.config.tile.material;
  }

  Layer.prototype.clear = function() {
    this.layerView.clear();
    this.tiles = [];
    this.tile = null;
    this.segment = null;
    return this.controlPoint = null;
  };

  Layer.prototype.addAction = function(action) {
    var ptCoord;
    if (this.controlPoint && action.action === 'moveControlPoint') {
      ptCoord = addPoint(this.controlPoint.coord(), this.tile.location);
      action.location_delta = subtractPoint(ptCoord, action.coordinates);
    }
    return this.actions.push(action);
  };

  Layer.prototype.processActions = function() {
    var action, macro, _results;
    _results = [];
    while (this.actions.length > 0) {
      action = this.actions.pop();
      macro = TileWebGL.Models.Macro.recordingMacro();
      if (macro) {
        macro.recordAction(action);
      }
      _results.push(this.processAction(action));
    }
    return _results;
  };

  Layer.prototype.processAction = function(d, elapsedTime) {
    var now, p;
    if (elapsedTime == null) {
      elapsedTime = null;
    }
    if (d.action !== 'moveControlPoint') {
      console.log(d);
    }
    if (this.version === '0.01') {
      p = d.coordinates;
      if (p) {
        d.coordinates = [p[0] - 250, 250 - p[1]];
      }
    }
    switch (d.action) {
      case 'addTile':
        this.addTile(d);
        break;
      case 'addTileSegment':
        this.addTileSegment(d);
        break;
      case 'selectTileSegment':
        this.selectTileSegment(d);
        break;
      case 'splitTileSegment':
        this.splitTileSegment(d);
        break;
      case 'selectControlPoint':
        this.selectControlPoint(d);
        break;
      case 'clearSelection':
        this.clearSelection(d);
        break;
      case 'moveControlPoint':
        this.moveControlPoint(d);
        break;
      case 'removeControlPoint':
        this.removeControlPoint(d);
        break;
      case 'setMaterial':
        this.setMaterial(d);
        break;
      case 'setVersionInfo':
        this.setVersion(d);
        break;
      case 'playMacro':
        this.playMacro(d);
        break;
      case 'startMacro':
        this.startMacro(d);
        break;
      case 'macroAddTileSegment':
        this.macroAddTileSegment(d);
        break;
      default:
        throw 'unsupported action';
    }
    if (elapsedTime == null) {
      now = new Date().getTime();
      elapsedTime = this.lastTime != null ? now - this.lastTime : 0;
    }
    this.history.push([d, elapsedTime]);
    return this.lastTime = now;
  };

  Layer.prototype.animateHistory = function(replay) {
    var processHistoryAction;
    this.replay = replay;
    processHistoryAction = (function(_this) {
      return function() {
        var timeOut;
        if (_this.paused) {
          return;
        }
        _this.processAction(_this.history_item[0]);
        _this.history_item = _this.replay.pop();
        if (_this.history_item != null) {
          timeOut = _this.history_item[1] > 250 ? 250 : _this.history_item[1];
          return setTimeout(processHistoryAction, timeOut);
        } else {
          return TileWebGL.appController.onDoneReplay();
        }
      };
    })(this);
    this.history_item = this.replay.pop();
    return processHistoryAction();
  };

  Layer.prototype.pauseAnimation = function() {
    return this.paused = true;
  };

  Layer.prototype.continueAnimation = function() {
    this.paused = false;
    return this.animateHistory(this.replay);
  };

  Layer.prototype.completeAnimation = function() {
    while (this.replay.length > 0) {
      this.processAction(this.replay.pop()[0]);
    }
    this.clearSelection();
    return TileWebGL.appController.onDoneReplay();
  };

  Layer.prototype.addTile = function(d) {
    this.tile = new TileWebGL.Models.Tile(this.tiles.length, d.coordinates);
    this.tile.setMaterial(this.material);
    this.tiles.push(this.tile);
    this.segment = this.tile.getSegment(0);
    return this.layerView.redrawTile(this.tile, true);
  };

  Layer.prototype.addTileSegment = function(d) {
    var segment;
    segment = this.tile.addTileSegment(subtractPoint(d.coordinates, this.tile.location));
    this.layerView.redrawTile(this.tile);
    return this.selectTileSegment({
      tile: this.tile.id,
      segment: segment.id
    });
  };

  Layer.prototype.selectTileSegment = function(d, state) {
    var segment;
    this.state = state != null ? state : 'select_all';
    this.tile = this.tiles[d.tile];
    segment = this.tile.getSegment(d.segment);
    return this.segment = segment;
  };

  Layer.prototype.isSegmentSelected = function(tileId, segmentId) {
    return this.tile && this.tile.id === tileId && this.segment && this.segment.id === segmentId;
  };

  Layer.prototype.splitTileSegment = function() {
    this.tile = this.tiles[this.tile.id];
    this.segment = this.tile.getSegment(this.segment.id);
    this.segment.split();
    return this.layerView.redrawTile(this.tile);
  };

  Layer.prototype.selectControlPoint = function(d) {
    this.controlPoint = this.tile.getControlPoint(d.id);
    return this.state = 'select_control_point';
  };

  Layer.prototype.clearSelection = function() {
    this.layerView.clearSelection();
    this.tile = null;
    this.segment = null;
    this.controlPoint = null;
    return this.state = 'none';
  };

  Layer.prototype.moveControlPoint = function(d) {
    if (d.location_delta != null) {
      this.controlPoint.moveDelta(d.location_delta);
    } else {
      this.controlPoint.move(subtractPoint(d.coordinates, this.tile.location));
    }
    this.layerView.redrawTile(this.tile);
    return this.state = 'move_control_point';
  };

  Layer.prototype.removeControlPoint = function(d) {
    this.controlPoint.remove();
    return this.layerView.redrawTile(this.tile, true);
  };

  Layer.prototype.setVersion = function(d) {
    return this.version = d.version;
  };

  Layer.prototype.playMacro = function(d) {
    return this.replayMacro = new TileWebGL.Models.MacroReplay(d, this).play();
  };

  Layer.prototype.stopMacro = function() {
    return this.replayMacro.stop();
  };

  Layer.prototype.macroAddTileSegment = function(d) {
    var segment;
    segment = this.tile.addTileSegment();
    this.layerView.redrawTile(this.tile);
    return this.selectTileSegment({
      tile: this.tile.id,
      segment: segment.id
    });
  };

  Layer.prototype.setMaterial = function(d) {
    this.material = Object.create(d.material);
    if (this.tile) {
      this.tile.setMaterial(this.material);
      return this.layerView.redrawTile(this.tile);
    }
  };

  return Layer;

})();

//# sourceMappingURL=layer.js.map
;TileWebGL.Models.Macro = (function() {
  Macro._numMacros = 0;

  Macro._macros = {};

  Macro.find = function(id) {
    return this._macros[id];
  };

  Macro.recordingMacro = function() {
    return this._recordingMacro;
  };

  Macro.startRecordingMacro = function() {
    return this._recordingMacro = new TileWebGL.Models.Macro();
  };

  function Macro() {
    this.id = this.constructor._numMacros;
    this.constructor._macros[this.id] = this;
    this.constructor._numMacros++;
    this._actionRecording = [];
  }

  Macro.prototype.recordAction = function(d) {
    var elapsedTime, now;
    if (['addTile', 'selectTileSegment', 'splitTileSegment', 'selectControlPoint', 'clearSelection', 'moveControlPoint', 'removeControlPoint'].indexOf(d.action) === -1) {
      return;
    }
    now = new Date().getTime();
    elapsedTime = this.lastTime != null ? now - this.lastTime : 0;
    return this._actionRecording.push([d, elapsedTime]);
  };

  Macro.prototype.actions = function() {
    return this._actionRecording.slice().reverse();
  };

  return Macro;

})();

TileWebGL.Models.MacroReplay = (function() {
  MacroReplay.stop = false;

  function MacroReplay(d, layer) {
    this.d = d;
    this.layer = layer;
    this.macro = TileWebGL.Models.Macro.find(d.macro_id);
    if (this.macro == null) {
      throw 'could not find macro';
    }
    this.controlPoint = this.layer.controlPoint;
    if (this.controlPoint) {
      this.controlPointOffset = this.controlPoint.id;
    }
    this.tileSegmentOffset = this.layer.tile.numOfSegments();
  }

  MacroReplay.prototype.play = function() {
    var processMacroAction;
    this.macroActions = this.macro.actions();
    processMacroAction = (function(_this) {
      return function() {
        var timeOut;
        if (TileWebGL.Models.MacroReplay.stop) {
          return;
        }
        _this.layer.processAction(_this.transposeAction(_this.macroAction[0]));
        _this.macroAction = _this.macroActions.pop();
        if (_this.macroAction != null) {
          timeOut = _this.macroAction[1] > 250 ? 250 : _this.macroAction[1];
          return setTimeout(processMacroAction, timeOut);
        }
      };
    })(this);
    this.macroAction = this.macroActions.pop();
    return processMacroAction();
  };

  MacroReplay.prototype.transposeAction = function(pretransposed) {
    var d;
    d = $.extend({}, pretransposed);
    if (d.action === 'selectTileSegment' && (this.tileSegmentOffset != null)) {
      d.segment += this.tileSegmentOffset;
    }
    if (d.action === 'selectControlPoint' && (this.controlPointOffset != null)) {
      d.id += this.controlPointOffset;
    }
    if (d.action === 'addTile') {
      d.action = 'macroAddTileSegment';
    }
    return d;
  };

  MacroReplay.prototype.stop = function() {
    return TileWebGL.Models.MacroReplay.stop = true;
  };

  return MacroReplay;

})();

//# sourceMappingURL=macro.js.map
;TileWebGL.Models.Stage = (function() {
  function Stage() {
    TileWebGL.stage = this;
    this.layers = [];
    this.macros = [];
    this.layers[0] = new TileWebGL.Models.Layer(this);
  }

  Stage.prototype.clear = function() {
    var layer, _i, _len, _ref, _results;
    _ref = this.layers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      _results.push(layer.clear());
    }
    return _results;
  };

  Stage.prototype.activeLayer = function() {
    return this.layers[0];
  };

  return Stage;

})();

TileWebGL.Models.Plane = (function() {
  var obj, planes;

  planes = localStorage.getItem('planes');

  if (planes) {
    obj = JSON.parse(planes);
    Plane._planes = obj.planes;
    Plane._numPlanes = obj.numPlanes;
  } else {
    Plane._numPlanes = 0;
    Plane._planes = [];
  }

  Plane.find = function(id) {
    obj = this._planes[id];
    console.log(obj);
    return obj;
  };

  Plane.create = function() {
    return new TileWebGL.Models.Plane();
  };

  Plane.all = function() {
    var plane, _i, _len, _ref;
    planes = [];
    _ref = this._planes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      plane = _ref[_i];
      planes.push(plane);
    }
    return planes;
  };

  Plane.save = function() {
    return localStorage.setItem('planes', JSON.stringify({
      numPlanes: this._numPlanes,
      planes: this._planes
    }));
  };

  function Plane() {
    this.id = this.constructor._numPlanes;
    this.version = 'v0.2';
    this.date = new Date();
    this.title = "Plane# " + this.id;
    this.history = "";
    this.constructor._planes[this.id] = this;
    this.constructor._numPlanes++;
  }

  return Plane;

})();

//# sourceMappingURL=stage.js.map
;TileWebGL.Models.Config = (function() {
  function Config() {}

  Config.prototype.contructor = function() {
    return this.materials = {};
  };

  Config.prototype.load = function() {
    var key, materialsData, value, _results;
    materialsData = JSON.parse(localStorage.getItem('materials'));
    _results = [];
    for (key in materialsData) {
      value = materialsData[key];
      _results.push(this.materials[key] = new TileWebGL.Models.Material().load(value));
    }
    return _results;
  };

  Config.prototype.save = function() {
    var data, key, value, _ref;
    data = {};
    _ref = this.materials;
    for (key in _ref) {
      value = _ref[key];
      data[key] = value.data;
    }
    return localStorage.setItem('car', JSON.stringify(data));
  };

  return Config;

})();

TileWebGL.Models.Material = (function() {
  function Material() {
    this.data = {
      color: 0xFFFFFF,
      ambient: 0xFFFFFF,
      colorEmissive: 0xFFFFFF,
      specular: 0xFFFFFF,
      shininess: 30,
      opacity: 1,
      transparent: false
    };
  }

  Material.prototype.load = function(value) {
    if (value == null) {
      value = {};
    }
    return $.extend(this.data, value);
  };

  return Material;

})();

//# sourceMappingURL=storage.js.map
;var pad;

pad = function(n, width, z) {
  z = z || "0";
  n = n + "";
  if (n.length >= width) {
    return n;
  } else {
    return new Array(width - n.length + 1).join(z) + n;
  }
};

TileWebGL.Models.ControlPoint = (function() {
  function ControlPoint(tile, id) {
    var segmentId;
    this.tile = tile;
    this.id = id;
    this.segment = this.tile.getSegment(this.id === 0 ? 0 : this.id - 1);
    segmentId = this.id < 2 ? 0 : this.id - 1;
  }

  ControlPoint.prototype.coord = function() {
    var pt;
    pt = this.isStart() ? midPoint(this.segment.data[0], this.segment.data[3]) : midPoint(this.segment.data[1], this.segment.data[2]);
    return [Math.ceil(pt[0]), Math.ceil(pt[1])];
  };

  ControlPoint.prototype.isStart = function() {
    return this.id === 0;
  };

  ControlPoint.prototype.isEnd = function() {
    return !this.isStart();
  };

  ControlPoint.prototype.moveDelta = function(delta) {
    return this.move(subtractPoint(this.coord(), delta));
  };

  ControlPoint.prototype.move = function(coordinates) {
    if (this.isStart()) {
      this.tile.moveStart(this.segment, coordinates);
    } else {
      this.tile.moveEnd(this.segment, coordinates);
      if (this.tile.startEndConnected && this.segment.isEnd()) {
        this.tile.moveStart(this.tile.getSegment(0), coordinates);
      }
    }
    return this.tile.resolveStartEnd();
  };

  ControlPoint.prototype.remove = function() {
    if (this.isStart()) {
      return this.segment.mergeLast();
    } else {
      return this.segment.mergeNext();
    }
  };

  return ControlPoint;

})();

TileWebGL.Models.Segment = (function() {
  function Segment(tile, id) {
    var length, width;
    this.tile = tile;
    this.id = id;
    if (this.tile.data.length > this.id) {
      this.data = this.tile.data[this.id];
      this.lastData = this.tile.data[this.id - 1];
    } else {
      width = TileWebGL.prefs.width;
      length = TileWebGL.prefs.segmentStartLength;
      this.data = [[0, 0], [length, 0], [length, width], [0, width]];
    }
  }

  Segment.prototype.controlPointData = function(includeStart) {
    var data;
    if (includeStart == null) {
      includeStart = true;
    }
    data = [];
    if (this.id === 0 && includeStart) {
      data.push({
        coord: midPoint(this.data[0], this.data[3]),
        id: 0
      });
    }
    data.push({
      coord: midPoint(this.data[1], this.data[2]),
      id: this.id + 1
    });
    return data;
  };

  Segment.prototype.split = function() {
    var newSegmentPoints;
    newSegmentPoints = [midPoint(this.data[0], this.data[1]), this.data[1], this.data[2], midPoint(this.data[2], this.data[3])];
    this.tile.data[this.id][1] = newSegmentPoints[0];
    this.tile.data[this.id][2] = newSegmentPoints[3];
    return this.tile.insertSegment(this.id + 1, newSegmentPoints);
  };

  Segment.prototype.mergeLast = function() {
    var endPoint;
    endPoint = midPoint(this.data[1], this.data[2]);
    this.tile.data.splice(this.id, 1);
    if (this.tile.data.length > 0) {
      return this.tile.moveEnd(new TileWebGL.Models.Segment(this.tile, this.id), endPoint);
    }
  };

  Segment.prototype.mergeNext = function() {
    var startPoint;
    startPoint = midPoint(this.data[0], this.data[3]);
    this.tile.data.splice(this.id, 1);
    if (this.id < this.tile.data.length) {
      return this.tile.moveStart(new TileWebGL.Models.Segment(this.tile, this.id), startPoint);
    }
  };

  Segment.prototype.getLast = function() {
    if (this.id - 1 >= 0) {
      return new TileWebGL.Models.Segment(this.tile, this.id - 1);
    } else {
      return null;
    }
  };

  Segment.prototype.getNext = function() {
    if (this.id + 1 < this.tile.data.length) {
      return new TileWebGL.Models.Segment(this.tile, this.id + 1);
    } else {
      return null;
    }
  };

  Segment.prototype.isEnd = function() {
    return this.getNext() == null;
  };

  return Segment;

})();

TileWebGL.Models.Tile = (function() {
  function Tile(id, location) {
    var length, width;
    this.id = id;
    this.location = location;
    width = TileWebGL.prefs.width;
    length = TileWebGL.prefs.segmentStartLength;
    this.data = [[[0, 0], [length, 0], [length, width], [0, width]]];
  }

  Tile.prototype.setMaterial = function(material) {
    return this.material = {
      material: material.material,
      color: parseInt(material.color.replace("#", "0x")),
      colorAmbient: parseInt(material.colorAmbient.replace("#", "0x")),
      colorEmissive: parseInt(material.colorEmissive.replace("#", "0x")),
      colorSpecular: parseInt(material.colorSpecular.replace("#", "0x")),
      shininess: material.shininess,
      opacity: material.opacity,
      transparent: true
    };
  };

  Tile.prototype.getMaterial = function() {
    return {
      material: this.material.material,
      color: "#" + pad(this.material.color.toString(16), 6),
      colorAmbient: "#" + pad(this.material.colorAmbient.toString(16), 6),
      colorEmissive: "#" + pad(this.material.colorEmissive.toString(16), 6),
      colorSpecular: "#" + pad(this.material.colorSpecular.toString(16), 6),
      shininess: this.material.shininess,
      opacity: this.material.opacity,
      transparent: true
    };
  };

  Tile.prototype.numOfSegments = function() {
    return this.data.length;
  };

  Tile.prototype.getSegment = function(id) {
    return new TileWebGL.Models.Segment(this, id);
  };

  Tile.prototype.addSegment = function() {
    var last;
    last = new TileWebGL.Models.Segment(this, this.data.length - 1);
    return this.data[this.data.length] = [last.data[1], addPoint(last.data[1], [TileWebGL.prefs.segmentStartLength, 0]), addPoint(last.data[2], [TileWebGL.prefs.segmentStartLength, 0]), last.data[2]];
  };

  Tile.prototype.getControlPoint = function(id) {
    return new TileWebGL.Models.ControlPoint(this, id);
  };

  Tile.prototype.controlPointData = function() {
    var data, i, segment, _i, _ref;
    data = [];
    for (i = _i = 0, _ref = this.numOfSegments() - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      segment = this.getSegment(i);
      data = data.concat(segment.controlPointData());
    }
    return data;
  };

  Tile.prototype.addTileSegment = function(growTo) {
    var segment;
    if (growTo == null) {
      growTo = null;
    }
    this.addSegment();
    segment = new TileWebGL.Models.Segment(this, this.data.length - 1);
    if (growTo) {
      this.moveEnd(segment, growTo);
    }
    return segment;
  };

  Tile.prototype.insertSegment = function(i, newSegmentPoints) {
    var dataLength, moveIndex, _i;
    dataLength = this.data.length;
    this.data[dataLength] = [];
    for (moveIndex = _i = dataLength; dataLength <= i ? _i <= i : _i >= i; moveIndex = dataLength <= i ? ++_i : --_i) {
      this.data[moveIndex] = this.data[moveIndex - 1];
    }
    return this.data[i] = newSegmentPoints;
  };

  Tile.prototype.moveEnd = function(segment, point) {
    var first, fixedStart, lastSegment, lastSegmentVector, nextSegment, vector;
    if (segment.id > 0) {
      lastSegment = new TileWebGL.Models.Segment(this, segment.id - 1);
      lastSegmentVector = getVector({
        start: midPoint(lastSegment.data[1], lastSegment.data[2]),
        end: midPoint(lastSegment.data[1], lastSegment.data[2])
      });
      fixedStart = midPoint(lastSegment.data[1], lastSegment.data[2]);
    } else {
      fixedStart = midPoint(segment.data[0], segment.data[3]);
    }
    vector = getVector({
      start: fixedStart,
      end: point
    });
    if (vector.direction === 0) {
      return;
    }
    this.movePoints(segment, vector, point);
    nextSegment = segment.getNext();
    if (nextSegment != null) {
      return this.moveStart(nextSegment, point);
    } else {
      first = this.getControlPoint(0).coord();
      if (getDistance(point, first) < 2) {
        this.startEndConnected = true;
        return this.resolveStartEnd();
      }
    }
  };

  Tile.prototype.moveStart = function(segment, point) {
    var fixedEnd, vector;
    fixedEnd = midPoint(segment.data[1], segment.data[2]);
    vector = getVector({
      start: point,
      end: fixedEnd
    });
    if (vector.direction === 0) {
      return;
    }
    return this.movePoints(segment, vector, fixedEnd);
  };

  Tile.prototype.movePoints = function(segment, vector, endPoint) {
    var lastSegment, leftEnd, leftStart, line1, line2, nextSegment, orthog, reverseVector, rightEnd, rightStart;
    lastSegment = new TileWebGL.Models.Segment(this, segment.id - 1);
    orthog = getOrthogonalVector(vector);
    leftEnd = movePoint(endPoint, getVector({
      direction: orthog.direction,
      magnitude: TileWebGL.prefs.width / -2
    }));
    rightEnd = movePoint(endPoint, getVector({
      direction: orthog.direction,
      magnitude: TileWebGL.prefs.width / 2
    }));
    reverseVector = getVector({
      direction: vector.direction,
      magnitude: -vector.magnitude
    });
    leftStart = movePoint(leftEnd, reverseVector);
    rightStart = movePoint(rightEnd, reverseVector);
    if (segment.id > 0) {
      line1 = [lastSegment.data[0], lastSegment.data[1]];
      line2 = [leftStart, leftEnd];
      leftStart = getPointIntersected(line1, line2);
      line1 = [lastSegment.data[3], lastSegment.data[2]];
      line2 = [rightStart, rightEnd];
      rightStart = getPointIntersected(line1, line2);
      this.data[segment.id - 1][1] = leftStart;
      this.data[segment.id - 1][2] = rightStart;
    }
    if (this.data.length > segment.id + 1) {
      nextSegment = new TileWebGL.Models.Segment(this, segment.id + 1);
      line1 = [nextSegment.data[0], nextSegment.data[1]];
      line2 = [leftStart, leftEnd];
      leftEnd = getPointIntersected(line1, line2);
      line1 = [nextSegment.data[3], nextSegment.data[2]];
      line2 = [rightStart, rightEnd];
      rightEnd = getPointIntersected(line1, line2);
      this.data[segment.id + 1][0] = leftEnd;
      this.data[segment.id + 1][3] = rightEnd;
    }
    return this.data[segment.id] = [leftStart, leftEnd, rightEnd, rightStart];
  };

  Tile.prototype.resolveStartEnd = function() {
    var firstSegment, lastSegment, leftStart, line1, line2, rightStart;
    if (!this.startEndConnected) {
      return;
    }
    firstSegment = this.getSegment(0);
    lastSegment = this.getSegment(this.numOfSegments() - 1);
    line1 = [lastSegment.data[0], lastSegment.data[1]];
    line2 = [firstSegment.data[0], firstSegment.data[1]];
    leftStart = getPointIntersected(line1, line2);
    line1 = [lastSegment.data[3], lastSegment.data[2]];
    line2 = [firstSegment.data[3], firstSegment.data[2]];
    rightStart = getPointIntersected(line1, line2);
    this.data[0][0] = this.data[lastSegment.id][1] = leftStart;
    return this.data[0][3] = this.data[lastSegment.id][2] = rightStart;
  };

  return Tile;

})();

//# sourceMappingURL=tile.js.map
;window.Geometry = {};

Geometry.transformPoint = function(point, matrix) {
  var transformedPoint;
  transformedPoint = [];
  transformedPoint[0] = point[0] * matrix[0][0] + point[1] * matrix[0][1];
  transformedPoint[1] = point[0] * matrix[1][0] + point[1] * matrix[1][1];
  return transformedPoint;
};

Geometry.subtractPoint = function(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1]];
};

Geometry.addPoint = function(p1, p2) {
  return [p1[0] + p2[0], p1[1] + p2[1]];
};

Geometry.midPoint = function(p1, p2) {
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
};

Geometry.getDistance = function(p1, p2) {
  return Math.sqrt(Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[0] - p1[0], 2));
};

Geometry.getDirection = function(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
};

Geometry.getVector = function(args) {
  var direction, magnitude;
  if ((args.start != null) && (args.end != null)) {
    magnitude = Geometry.getDistance(args.start, args.end);
    direction = Geometry.getDirection(args.start, args.end);
  } else if ((args.direction != null) && (args.magnitude != null)) {
    magnitude = args.magnitude;
    direction = args.direction;
  } else {
    throw 'missing required arguments';
  }
  return {
    magnitude: magnitude,
    direction: direction
  };
};

Geometry.getOrthogonalVector = function(vector) {
  return {
    magnitude: vector.magnitude,
    direction: vector.direction + Math.PI / 2
  };
};

Geometry.movePoint = function(point, vector) {
  var matrix, movePoint, radians;
  radians = vector.direction;
  matrix = [[Math.cos(radians), -Math.sin(radians)], [Math.sin(radians), Math.cos(radians)]];
  movePoint = Geometry.transformPoint([vector.magnitude, 0], matrix);
  return Geometry.addPoint(point, movePoint);
};

Geometry.getPointIntersected = function(line1, line2) {
  var result;
  result = Geometry.checkLineIntersection(line1[0][0], line1[0][1], line1[1][0], line1[1][1], line2[0][0], line2[0][1], line2[1][0], line2[1][1]);
  return [result.x, result.y];
};

Geometry.checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
  var a, b, denominator, numerator1, numerator2, result;
  denominator = void 0;
  a = void 0;
  b = void 0;
  numerator1 = void 0;
  numerator2 = void 0;
  result = {
    x: null,
    y: null,
    onLine1: false,
    onLine2: false
  };
  denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
  if (denominator === 0) {
    return result;
  }
  a = line1StartY - line2StartY;
  b = line1StartX - line2StartX;
  numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
  numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
  a = numerator1 / denominator;
  b = numerator2 / denominator;
  result.x = line1StartX + (a * (line1EndX - line1StartX));
  result.y = line1StartY + (a * (line1EndY - line1StartY));
  if (a > 0 && a < 1) {
    result.onLine1 = true;
  }
  if (b > 0 && b < 1) {
    result.onLine2 = true;
  }
  return result;
};

//# sourceMappingURL=geometry.js.map
;TileWebGL.Views.AppView = (function() {
  function AppView() {
    TileWebGL.appView = this;
    this.initThreejs();
    this.overlayView = new TileWebGL.Views.Overlay();
    this.animate();
    this.registerEvents();
    this.objects = [];
  }

  AppView.prototype.initThreejs = function() {
    var ASPECT, FAR, NEAR, SCREEN_HEIGHT, SCREEN_WIDTH, VIEW_ANGLE, container, dirLight;
    this.scene = new THREE.Scene();
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    VIEW_ANGLE = 10;
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    NEAR = 0.1;
    FAR = 20000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 150, 3000);
    this.camera.lookAt(this.scene.position);
    if (Detector.webgl) {
      this.renderer = new THREE.WebGLRenderer({
        antialias: false
      });
    } else {
      this.renderer = new THREE.CanvasRenderer();
    }
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById("ThreeJS");
    container.appendChild(this.renderer.domElement);
    THREEx.WindowResize(this.renderer, this.camera);
    THREEx.FullScreen.bindKey({
      charCode: "m".charCodeAt(0)
    });
    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set(200, 200, 150);
    this.scene.add(dirLight);
    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set(200, 200, -150);
    this.scene.add(dirLight);
    return this.projector = new THREE.Projector();
  };

  AppView.prototype.enableOrbitControls = function() {
    return this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  };

  AppView.prototype.disableOrbitControls = function() {
    return this.controls = null;
  };

  AppView.prototype.addToScene = function(threeMeshObject) {
    this.scene.add(threeMeshObject);
    return this.objects.push(threeMeshObject);
  };

  AppView.prototype.removeFromScene = function(threeMeshObject) {
    var index;
    this.scene.remove(threeMeshObject);
    index = this.objects.indexOf(threeMeshObject);
    if (index > -1) {
      return this.objects.splice(index, 1);
    }
  };

  AppView.prototype.copyTouch = function(touch) {
    return {
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY
    };
  };

  AppView.prototype.touchStart = function(touch) {
    this.touches[touch.identifier] = touch;
    return this.handleDownEvent([touch.pageX, touch.pageY]);
  };

  AppView.prototype.touchMove = function(touch) {
    return this.handleMoveEvent([touch.pageX, touch.pageY]);
  };

  AppView.prototype.touchEnd = function(touch) {
    return this.handleUpEvent([touch.pageX, touch.pageY]);
  };

  AppView.prototype.registerEvents = function() {
    var el;
    this.touches = {};
    el = this.renderer.domElement;
    if (Modernizr.touch) {
      el.addEventListener("touchstart", (function(_this) {
        return function(event) {
          var touch, _i, _len, _ref, _results;
          _ref = event.changedTouches;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            touch = _ref[_i];
            _results.push(_this.touchStart(touch));
          }
          return _results;
        };
      })(this));
      el.addEventListener("touchend", (function(_this) {
        return function(event) {
          var touch, _i, _len, _ref, _results;
          _ref = event.changedTouches;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            touch = _ref[_i];
            _results.push(_this.touchEnd(touch));
          }
          return _results;
        };
      })(this));
      el.addEventListener("touchcancel", (function(_this) {
        return function(event) {
          var touch, _i, _len, _ref, _results;
          _ref = event.changedTouches;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            touch = _ref[_i];
            _results.push(_this.touchCancel(touch));
          }
          return _results;
        };
      })(this));
      return el.addEventListener("touchmove", (function(_this) {
        return function(event) {
          var touch, _i, _len, _ref, _results;
          _ref = event.changedTouches;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            touch = _ref[_i];
            _results.push(_this.touchMove(touch));
          }
          return _results;
        };
      })(this));
    } else {
      el.addEventListener('mousemove', (function(_this) {
        return function(event) {
          return _this.handleMoveEvent([event.clientX, event.clientY]);
        };
      })(this));
      el.addEventListener('mouseup', (function(_this) {
        return function(event) {
          return _this.handleUpEvent([event.clientX, event.clientY]);
        };
      })(this));
      return el.addEventListener('mousedown', (function(_this) {
        return function(event) {
          return _this.handleDownEvent([event.clientX, event.clientY]);
        };
      })(this));
    }
  };

  AppView.prototype.handleMoveEvent = function(coord) {
    var intersect;
    intersect = this.raycastIntersects(coord);
    if (intersect != null) {
      intersect.object.view.mouseMove([intersect.point.x, intersect.point.y]);
      return TileWebGL.activeLayerController().mouseMove([intersect.point.x, intersect.point.y]);
    }
  };

  AppView.prototype.handleUpEvent = function(coord) {
    var intersect;
    if (this.ignoreMouseEvents) {
      return;
    }
    intersect = this.raycastIntersects(coord);
    if (intersect != null) {
      return intersect.object.view.mouseUp([intersect.point.x, intersect.point.y]);
    }
  };

  AppView.prototype.handleDownEvent = function(coord) {
    var intersect;
    intersect = this.raycastIntersects(coord);
    if (intersect != null) {
      return intersect.object.view.mouseDown([intersect.point.x, intersect.point.y]);
    }
  };

  AppView.prototype.enableOrbitControls = function() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    return this.ignoreMouseEvents = true;
  };

  AppView.prototype.disableOrbitControls = function() {
    this.controls = null;
    return this.ignoreMouseEvents = false;
  };

  AppView.prototype.animate = function() {
    requestAnimationFrame(TileWebGL.appView.animate);
    TileWebGL.appView.render();
    return TileWebGL.appView.update();
  };

  AppView.prototype.render = function() {
    return this.renderer.render(this.scene, this.camera);
  };

  AppView.prototype.update = function() {
    if (this.controls != null) {
      this.controls.update();
    }
    if (this.stats != null) {
      return this.stats.update();
    }
  };

  AppView.prototype.raycastIntersects = function(clientCoord) {
    var mouse3D, mouseX, mouseY, objects, rayCaster;
    mouseX = (clientCoord[0] / window.innerWidth) * 2 - 1;
    mouseY = -(clientCoord[1] / window.innerHeight) * 2 + 1;
    mouse3D = new THREE.Vector3(mouseX, mouseY, 1);
    this.projector.unprojectVector(mouse3D, this.camera);
    rayCaster = new THREE.Raycaster(this.camera.position, mouse3D.sub(this.camera.position).normalize());
    objects = rayCaster.intersectObjects(this.objects);
    if (objects) {
      return objects[0];
    }
  };

  return AppView;

})();

//# sourceMappingURL=application.js.map
;TileWebGL.Views.Layer = (function() {
  function Layer() {
    this.stage = TileWebGL.appView.stage;
    TileWebGL.layerView = this;
    this.tileViews = {};
    this.controller = TileWebGL.appController.activeLayerController();
    TileWebGL.appController.onStateChange((function(_this) {
      return function(state) {
        switch (state) {
          case 'create':
            return _this.showWall();
          default:
            return _this.showWall(false);
        }
      };
    })(this));
  }

  Layer.prototype.redrawTile = function(tile, forceSelected) {
    var tileView;
    if (forceSelected == null) {
      forceSelected = false;
    }
    tileView = this.tileViews[tile.id];
    if (!tileView) {
      tileView = new TileWebGL.Views.Tile(this, tile);
      this.tileViews[tile.id] = tileView;
    }
    if (forceSelected) {
      tileView.tileSelected = true;
    }
    return tileView.redraw();
  };

  Layer.prototype.clearSelection = function() {
    var tileView;
    if (TileWebGL.stage.activeLayer().tile) {
      tileView = this.tileViews[TileWebGL.stage.activeLayer().tile.id];
    }
    if (tileView) {
      return tileView.selectTile(false);
    }
  };

  Layer.prototype.clear = function() {
    var id, tileView, _ref, _results;
    _ref = this.tileViews;
    _results = [];
    for (id in _ref) {
      tileView = _ref[id];
      _results.push(tileView.destroy());
    }
    return _results;
  };

  Layer.prototype.showWall = function(show) {
    if (show == null) {
      show = true;
    }
    if (show) {
      return this.wall = new TileWebGL.Views.Wall().create();
    } else {
      if (this.wall) {
        this.wall.destroy();
        return this.wall = null;
      }
    }
  };

  return Layer;

})();

TileWebGL.Views.Wall = (function() {
  function Wall() {
    this.appView = TileWebGL.appView;
  }

  Wall.prototype.create = function() {
    var geometry, material;
    material = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    geometry = new THREE.PlaneGeometry(6000, 6000, 1);
    this.wall = new THREE.Mesh(geometry, material);
    this.wall.position.set(0, 0, 1);
    this.wall['view'] = this;
    this.appView.addToScene(this.wall);
    return this;
  };

  Wall.prototype.destroy = function() {
    return this.appView.removeFromScene(this.wall);
  };

  Wall.prototype.mouseMove = function(coord) {};

  Wall.prototype.mouseDown = function(coord) {
    return this.state = 'mousedown';
  };

  Wall.prototype.mouseUp = function(coord) {
    if (this.state !== 'mousedown') {
      return;
    }
    TileWebGL.activeLayerController().mouseUp(coord);
    return this.state = null;
  };

  return Wall;

})();

//# sourceMappingURL=layer.js.map
;TileWebGL.Views.Overlay = (function() {
  function Overlay() {
    this.currentPanel = null;
    new TileWebGL.Views.GUI();
  }

  Overlay.prototype.showPanel = function(panelName) {
    this.panelName = panelName;
  };

  Overlay.prototype.hidePanel = function() {
    if (this.currentPanel.visible) {
      return this.currentPanel.hide();
    }
  };

  return Overlay;

})();

TileWebGL.Views.GUI = (function() {
  function GUI() {}

  return GUI;

})();

//# sourceMappingURL=overlay.js.map
;

//# sourceMappingURL=create_menu.js.map
;

//# sourceMappingURL=overlay_back.js.map
;var ThreeView;

ThreeView = (function() {
  function ThreeView() {}

  ThreeView.prototype.getCoordinates = function(event) {
    var intersects, mouse3D, mouseX, mouseY, rayCaster;
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    mouse3D = new THREE.Vector3(mouseX, mouseY, 1);
    this.projector.unprojectVector(mouse3D, this.camera);
    rayCaster = new THREE.Raycaster(this.camera.position, mouse3D.sub(this.camera.position).normalize());
    intersects = rayCaster.intersectObjects(this.objects);
    if (intersects.length > 0) {
      return [intersects[0].point.x, intersects[0].point.y];
    } else {
      return null;
    }
  };

  return ThreeView;

})();

//# sourceMappingURL=three.js.map
;TileWebGL.Views.Tile = (function() {
  function Tile(layerView, tile) {
    this.layerView = layerView;
    this.tile = tile;
    this.segments = [];
    this.controlPoints = [];
    this.tileSelected = false;
    this.redraw();
  }

  Tile.prototype.redraw = function() {
    this.redrawSegments();
    return this.redrawControlPoints();
  };

  Tile.prototype.redrawSegments = function() {
    var i, segment, _i, _len, _ref, _results;
    _ref = this.segments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      segment = _ref[_i];
      segment.destroy();
    }
    this.segments = [];
    i = 0;
    _results = [];
    while (i < this.tile.data.length) {
      this.segments.push(new TileWebGL.Views.TileSegment(this, i).create());
      _results.push(i++);
    }
    return _results;
  };

  Tile.prototype.redrawControlPoints = function() {
    var controlPoint, controlPointData, i, _i, _len, _ref, _results;
    _ref = this.controlPoints;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      controlPoint = _ref[_i];
      controlPoint.destroy();
    }
    this.controlPoints = [];
    if (!this.tileSelected) {
      return;
    }
    i = 0;
    controlPointData = this.tile.controlPointData();
    _results = [];
    while (i < controlPointData.length) {
      this.controlPoints.push(new TileWebGL.Views.ControlPoint(this, controlPointData[i].coord, i).create());
      _results.push(i++);
    }
    return _results;
  };

  Tile.prototype.selectTile = function(selected) {
    if (selected == null) {
      selected = true;
    }
    this.tileSelected = selected;
    return this.redrawControlPoints();
  };

  Tile.prototype.destroy = function() {
    var controlPoint, segment, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.segments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      segment = _ref[_i];
      segment.destroy();
    }
    _ref1 = this.controlPoints;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      controlPoint = _ref1[_j];
      _results.push(controlPoint.destroy());
    }
    return _results;
  };

  return Tile;

})();

TileWebGL.Views.TileSegment = (function() {
  function TileSegment(tileView, segmentIndex) {
    this.tileView = tileView;
    this.segmentIndex = segmentIndex;
    this.appView = TileWebGL.appView;
    this.layerController = TileWebGL.activeLayerController();
    this.tile = this.tileView.tile;
    this.data = this.tile.data[this.segmentIndex];
  }

  TileSegment.prototype.create = function(attr) {
    var material;
    material = (function() {
      switch (this.tile.material.material) {
        case 'Basic':
          return new THREE.MeshBasicMaterial(this.tile.material);
        case 'Lambert':
          return new THREE.MeshLambertMaterial(this.tile.material);
        case 'Phong':
          return new THREE.MeshPhongMaterial(this.tile.material);
        case 'Wireframe':
          $.extend(attr, {
            wireframe: true
          }, this.tile.material);
          return new THREE.MeshBasicMaterial(attr);
      }
    }).call(this);
    material.side = THREE.DoubleSide;
    this.segment = new THREE.Mesh(this.geometry(), material);
    this.segment['view'] = this;
    this.appView.addToScene(this.segment);
    return this;
  };

  TileSegment.prototype.destroy = function() {
    return this.appView.removeFromScene(this.segment);
  };

  TileSegment.prototype.mouseMove = function(coord) {};

  TileSegment.prototype.mouseDown = function(coord) {
    return this.state = 'mousedown';
  };

  TileSegment.prototype.mouseUp = function(coord) {
    var selection;
    if (this.state !== 'mousedown') {
      return;
    }
    selection = [this.tile.id, this.segmentIndex];
    if (this.layerController.isCurrentSegmentSelected(selection)) {
      this.layerController.splitTileSegment(selection);
    } else {
      this.layerController.selectTileSegment(selection);
      this.tileView.selectTile();
    }
    return this.state = void 0;
  };

  TileSegment.prototype.geometry = function() {
    var geom, pointIndex;
    geom = new THREE.Geometry();
    pointIndex = 0;
    while (pointIndex < this.data.length) {
      geom.vertices.push(this.vector3(pointIndex, TileWebGL.prefs.depth));
      geom.vertices.push(this.vector3(pointIndex, 0));
      pointIndex++;
    }
    geom.faces.push(new THREE.Face3(0, 2, 4));
    geom.faces.push(new THREE.Face3(0, 6, 4));
    geom.faces.push(new THREE.Face3(1, 3, 5));
    geom.faces.push(new THREE.Face3(1, 7, 5));
    geom.faces.push(new THREE.Face3(7, 6, 4));
    geom.faces.push(new THREE.Face3(5, 7, 4));
    geom.faces.push(new THREE.Face3(3, 2, 0));
    geom.faces.push(new THREE.Face3(1, 3, 0));
    geom.faces.push(new THREE.Face3(1, 0, 6));
    geom.faces.push(new THREE.Face3(7, 1, 6));
    geom.faces.push(new THREE.Face3(5, 4, 2));
    geom.faces.push(new THREE.Face3(3, 5, 2));
    geom.computeFaceNormals();
    return geom;
  };

  TileSegment.prototype.vector3 = function(pointIndex, depth) {
    var p, point;
    point = this.data[pointIndex];
    p = this.tile.location;
    return new THREE.Vector3(point[0] + p[0], point[1] + p[1], depth);
  };

  return TileSegment;

})();

TileWebGL.Views.ControlPoint = (function() {
  function ControlPoint(tileView, coord, id) {
    this.tileView = tileView;
    this.coord = coord;
    this.id = id;
    this.appView = TileWebGL.appView;
    this.layerController = TileWebGL.activeLayerController();
    this.tile = this.tileView.tile;
    this;
  }

  ControlPoint.prototype.create = function() {
    var circleGeometry, material, p;
    material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF
    });
    circleGeometry = new THREE.CircleGeometry(10, 32);
    p = this.tile.location;
    this.controlPoint = new THREE.Mesh(circleGeometry, material);
    this.controlPoint.position.x = this.coord[0] + p[0];
    this.controlPoint.position.y = this.coord[1] + p[1];
    this.controlPoint.position.z = 20;
    this.controlPoint['view'] = this;
    this.appView.addToScene(this.controlPoint);
    return this;
  };

  ControlPoint.prototype.destroy = function() {
    return this.appView.removeFromScene(this.controlPoint);
  };

  ControlPoint.prototype.mouseMove = function(coord) {};

  ControlPoint.prototype.mouseDown = function(coord) {
    return this.layerController.controlPointMouseDown(this.id);
  };

  ControlPoint.prototype.mouseUp = function(coord) {
    return this.layerController.controlPointMouseUp(this.id);
  };

  ControlPoint.prototype.vector3 = function(pointIndex, depth) {
    var p, point;
    point = this.data[pointIndex];
    p = this.tile.location;
    return new THREE.Vector3(point[0] + p[0], point[1] + p[1], depth);
  };

  return ControlPoint;

})();

//# sourceMappingURL=tile.js.map
;var property;

for (property in Geometry) {
  window[property] = Geometry[property];
}

new TileWebGL.Controllers.AppController();

document.ontouchmove = function(event) {
  return event.preventDefault();
};

//# sourceMappingURL=main.js.map
