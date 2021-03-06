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
        color: "#ff3131",
        colorAmbient: "#000000",
        colorEmissive: "#000000",
        colorSpecular: "#000000",
        shininess: 30,
        opacity: 1,
        material: "Lambert"
      }
    }
  }
};

window.App = window.Overlay = Ember.Application.create();

//# sourceMappingURL=abc.js.map
;var Message;

Message = (function() {
  function Message() {
    this._$message = $('#message');
  }

  Message.prototype.setMessageText = function(text, cssClass) {
    if (cssClass == null) {
      cssClass = '';
    }
    this._$message.text(text);
    return this._$message.attr('class', cssClass);
  };

  return Message;

})();

TileWebGL.Controllers.WebSock = (function() {
  function WebSock() {
    this._actionsToSend = [];
    this._actionsReceived = [];
  }

  WebSock.prototype.sendAction = function(d) {
    var elapsedTime, now;
    now = new Date().getTime();
    elapsedTime = this.lastTime != null ? now - this.lastTime : 0;
    this._actionsToSend.push([d, elapsedTime]);
    if (this._socketReady != null) {
      return this.sendActionsNow();
    }
  };

  WebSock.prototype.sendActionsNow = function() {
    if (!(this._actionsToSend.length > 0)) {
      return;
    }
    this.socket.send(JSON.stringify(this._actionsToSend));
    this.numActionsSent += this._actionsToSend.length;
    new Message().setMessageText('S: ' + this.numActionsSent);
    return this._actionsToSend = [];
  };

  WebSock.prototype.sendActions = function() {
    var processActionsToSend;
    processActionsToSend = (function(_this) {
      return function() {
        if (_this._actionsToSend.length > 0) {
          _this.socket.send(JSON.stringify(_this._actionsToSend));
          _this.numActionsSent += _this._actionsToSend.length;
          new Message().setMessageText('S: ' + _this.numActionsSent);
          _this._actionsToSend = [];
          return setTimeout(processActionsToSend, 10);
        } else {
          return setTimeout(processActionsToSend, 10);
        }
      };
    })(this);
    return processActionsToSend();
  };

  WebSock.prototype.startSending = function() {
    this.numActionsSent = 0;
    new Message().setMessageText('Connecting to server..');
    this.socket = new WebSocket("ws://protected-citadel-9552.herokuapp.com");
    this.socket.onerror = (function(_this) {
      return function() {
        new Message().setMessageText('Connection failure', 'error');
        return _this._socketReady = false;
      };
    })(this);
    return this.socket.onopen = (function(_this) {
      return function() {
        new Message().setMessageText('Connected and sending..');
        _this.socket.send('sending');
        return _this._socketReady = true;
      };
    })(this);
  };

  WebSock.prototype.startReceiving = function() {
    var processAction;
    this.numActionsReceived = 0;
    this.actions = [];
    processAction = (function(_this) {
      return function() {
        var timeOut;
        TileWebGL.activeLayerController().layer.processAction(_this.action[0]);
        _this.action = _this.actions.shift();
        if (_this.action != null) {
          timeOut = _this.action[1] > 250 ? 250 : _this.action[1];
          return setTimeout(processAction, timeOut);
        }
      };
    })(this);
    new Message().setMessageText('Connecting to server..');
    this.socket = new WebSocket("ws://protected-citadel-9552.herokuapp.com");
    this.actions = [];
    this.socket.onerror = (function(_this) {
      return function() {
        return new Message().setMessageText('Connection failure', 'error');
      };
    })(this);
    return this.socket.onopen = (function(_this) {
      return function() {
        TileWebGL.appController.changeState('receive');
        new Message().setMessageText('Connected and receiving..');
        _this.socket.send('receiving');
        return _this.socket.onmessage = function(event) {
          _this.actions = _this.actions.concat(JSON.parse(event.data));
          _this.numActionsReceived += _this.actions.length;
          new Message().setMessageText('R: ' + _this.numActionsReceived);
          _this.action = _this.actions.shift();
          return processAction();
        };
      };
    })(this);
  };

  return WebSock;

})();

TileWebGL.api = new TileWebGL.Controllers.WebSock();

//# sourceMappingURL=api.js.map
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

  AppController.prototype.zoomIn = function() {
    return this.appView.adjustCameraPosition([0, 0, -200]);
  };

  AppController.prototype.zoomOut = function() {
    return this.appView.adjustCameraPosition([0, 0, 200]);
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

  AppController.prototype.enterReceiveState = function() {
    this.stage.clear();
    this.start();
    return this.changeState('receive');
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
    this.states = ['init', 'create', 'replay', 'show', 'receive'];
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

  LayerController.prototype.setMaterial = function(material) {
    return this.processAction('setMaterial', {
      material: material
    });
  };

  LayerController.prototype.selectTileSegment = function(selection) {
    if (this.layer.segment) {
      this.processAction('clearSelection');
    }
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

  LayerController.prototype.isTileSelected = function(selection) {
    if (!this.layer.tile) {
      return false;
    }
    return this.layer.tile.id === selection[0];
  };

  LayerController.prototype.toggleWall = function() {
    return this.layerView.showWall(this.layerView.wall == null);
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

  LayerController.prototype.mouseMove = function(point) {
    if (this.controlPointMoving) {
      this.processAction('moveControlPoint', {
        coordinates: point
      });
      return this.controlPointMoved = true;
    }
  };

  LayerController.prototype.controlPointMouseDown = function(id) {
    if (!this.layer.controlPoint || this.layer.controlPoint.id !== id) {
      this.processAction('selectControlPoint', {
        id: id
      });
      this.controlPointMoving = true;
      return this.controlPointMoved = false;
    }
  };

  LayerController.prototype.controlPointMouseUp = function(id) {
    if (this.controlPointMoving) {
      return this.controlPointMoving = false;
    } else {
      if (this.layer.controlPoint && this.layer.controlPoint.id === id) {
        if (this.controlPointMoved) {
          return this.controlPointMoved = false;
        } else {
          return this.processAction('removeControlPoint');
        }
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

  LayerController.prototype.playMacro = function() {
    var d, macro;
    macro = TileWebGL.Models.Macro.recordingMacro();
    d = {
      macro_id: macro.id
    };
    return this.processAction('playMacro', d);
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
;var channel, pusher;

Overlay.Router.map(function() {
  this.resource('planes', {
    path: "/"
  });
  this.resource('plane', {
    path: "/plane/:plane_id"
  });
  return this.resource('receive');
});

Overlay.PlanesRoute = Ember.Route.extend({
  model: function(params) {
    return TileWebGL.Models.Plane.all();
  }
});

Overlay.PlanesController = Ember.ArrayController.extend({
  start: (function() {
    var id, plane;
    id = TileWebGL.Models.Plane.getLastPlaneId();
    if (id != null) {
      return this.transitionToRoute('plane', id);
    } else {
      plane = TileWebGL.Models.Plane.create();
      TileWebGL.Models.Plane.save();
      return this.transitionToRoute('plane', plane.id);
    }
  }).property(),
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
    },
    goBack: function() {
      var id;
      id = TileWebGL.Models.Plane.getLastPlaneId();
      if (id > -1) {
        return this.transitionToRoute('plane', id);
      }
    }
  }
});

pusher = null;

channel = null;

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
      TileWebGL.api.startSending();
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
    },
    macroPlay: function() {
      return TileWebGL.activeLayerController().playMacro();
    },
    menuSelectShow: function() {
      if (this.selectMenuShown) {
        this.selectMenuShown = false;
        $('#menuPlane').fadeIn('fast');
        return $('.menu:not("#menuPlane")').fadeOut('slow');
      } else {
        this.selectMenuShown = true;
        return $('#menuSelect').fadeIn('fast');
      }
    },
    menuCameraShow: function() {
      $('#menuCamera').fadeIn('fast');
      $('.menu:not("#menuCamera")').fadeOut('slow');
      return this.selectMenuShown = false;
    },
    zoomIn: function() {
      return TileWebGL.appController.zoomIn();
    },
    zoomOut: function() {
      return TileWebGL.appController.zoomOut();
    },
    menuColorsShow: function() {
      $('#menuColors').fadeIn('fast');
      $('.menu:not("#menuColors")').fadeOut('slow');
      return this.selectMenuShown = false;
    },
    red: function() {
      return this["private"].updateColor('#FF0000');
    },
    blue: function() {
      return this["private"].updateColor('#0000FF');
    },
    white: function() {
      return this["private"].updateColor('#999999');
    },
    menuPeerConfigShow: function() {
      $('#menuPeerConfig').fadeIn('fast');
      $('.menu:not("#menuPeerConfig")').fadeOut('slow');
      return this.selectMenuShown = false;
    },
    becomeSender: function() {
      return TileWebGL.api.startSending();
    },
    becomeReceiver: function() {
      return TileWebGL.api.startReceiving();
    }
  },
  "private": {
    updateColor: function(color) {
      var layer, material;
      layer = TileWebGL.activeLayerController().layer;
      material = $.extend({}, layer.material);
      material.color = color;
      return TileWebGL.activeLayerController().processAction('setMaterial', {
        material: material
      });
    }
  }
});

Overlay.ReceiveController = Ember.ObjectController.extend({
  start: (function() {
    if (!this.started) {
      TileWebGL.appController.start();
      TileWebGL.api.startReceiving();
      this.started = true;
    }
    return '';
  }).property()
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
    this.state = 'create';
    this.initializeStateMachine();
  }

  Layer.prototype.initializeStateMachine = function() {
    return TileWebGL.appController.onStateChange((function(_this) {
      return function(state) {
        return _this.state = state;
      };
    })(this));
  };

  Layer.prototype.clear = function() {
    this.layerView.clear();
    this.tile = null;
    this.segment = null;
    this.controlPoint = null;
    return this.tiles = [];
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
    var action, _results;
    _results = [];
    while (this.actions.length > 0) {
      action = this.actions.pop();
      TileWebGL.api.sendAction(action);
      _results.push(this.processAction(action));
    }
    return _results;
  };

  Layer.prototype.processAction = function(d, elapsedTime) {
    var now, p;
    if (elapsedTime == null) {
      elapsedTime = null;
    }
    TileWebGL.Models.Macro.processAction(d);
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
    if (this.state !== 'create') {
      return;
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

  Layer.prototype.splitTileSegment = function(d) {
    this.tile = this.tiles[d.tile];
    this.segment = this.tile.getSegment(d.segment);
    this.segment.split();
    this.controlPoint = null;
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
    this.version = d.version;
    return this.clear();
  };

  Layer.prototype.playMacro = function(d) {
    TileWebGL.Models.MacroReplay.stop = false;
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

  Macro.processAction = function(d) {
    if (d.action === 'addTile') {
      this.startRecordingMacro();
    }
    if (this._recordingMacro) {
      return this._recordingMacro.recordAction(d);
    }
  };

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
    switch (d.action) {
      case 'selectTileSegment':
      case 'splitTileSegment':
        if (this.tileSegmentOffset) {
          d.segment += this.tileSegmentOffset;
        }
        break;
      case 'selectControlPoint':
        if (this.controlPointOffset != null) {
          d.id += this.controlPointOffset;
        }
        break;
      case 'addTile':
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

  Stage.setCameraPosition = function(position) {
    return localStorage.setItem('camera', JSON.stringify(position));
  };

  Stage.getCameraPosition = function() {
    var camera;
    camera = localStorage.getItem('camera');
    if (camera) {
      return JSON.parse(camera);
    } else {
      return [0, 0, 3000];
    }
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
    if (obj != null) {
      this.setLastPlaneId(id);
    }
    return obj;
  };

  Plane.create = function() {
    this.setLastPlaneId(this._planes.length);
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

  Plane.getLastPlaneId = function() {
    var id;
    id = localStorage.getItem('lastPlaneId');
    if (id) {
      return JSON.parse(id);
    } else {
      return void 0;
    }
  };

  Plane.setLastPlaneId = function(id) {
    return localStorage.setItem('lastPlaneId', JSON.stringify(id));
  };

  function Plane() {
    this.id = this.constructor._numPlanes;
    this.version = 'v0.2';
    this.date = new Date();
    this.title = "P" + this.id;
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
      if (this.tile.startEndConnected) {
        return this.tile.startEndConnected = false;
      }
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
    var data, i, n, segment, _i, _ref;
    n = this.numOfSegments();
    data = [];
    if (n < 1) {
      return data;
    }
    for (i = _i = 0, _ref = n - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
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
    var fixedEnd, last, vector;
    fixedEnd = midPoint(segment.data[1], segment.data[2]);
    vector = getVector({
      start: point,
      end: fixedEnd
    });
    if (vector.direction === 0) {
      return;
    }
    this.movePoints(segment, vector, fixedEnd);
    if (!(segment.id === 0 && this.numOfSegments() > 2)) {
      return;
    }
    last = this.getControlPoint(this.numOfSegments()).coord();
    if (getDistance(last, point) < 2) {
      this.startEndConnected = true;
      return this.resolveStartEnd();
    }
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
    this.initializeStateMachine();
    this.domContainer = document.getElementById("ThreeJS");
    this.objects = [];
    this.createScene();
    this.addLights();
    this.registerEvents();
    this.animate();
  }

  AppView.prototype.initializeStateMachine = function() {
    return TileWebGL.appController.onStateChange((function(_this) {
      return function(state) {
        switch (state) {
          case 'create':
            return _this.ignoreMouseEvents = false;
          case 'receive':
            if (_this.controls == null) {
              return _this.controls = new THREE.OrbitControls(_this.camera, _this.renderer.domElement);
            }
            break;
          default:
            return _this.ignoreMouseEvents = true;
        }
      };
    })(this));
  };

  AppView.prototype.createScene = function() {
    this.scene = new THREE.Scene();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.near = 1000;
    this.far = 20000;
    this.camera = new THREE.PerspectiveCamera(10, this.aspect, this.near, this.far);
    this.updateCameraPosition();
    this.projector = new THREE.Projector();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(this.width, this.height);
    return this.domContainer.appendChild(this.renderer.domElement);
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

  AppView.prototype.updateCameraPosition = function() {
    var pos;
    if (this.cameraPosition == null) {
      this.cameraPosition = TileWebGL.Models.Stage.getCameraPosition();
    }
    pos = this.cameraPosition;
    this.camera.position.set(pos[0], pos[1], pos[2]);
    return this.camera.lookAt(this.scene.position);
  };

  AppView.prototype.adjustCameraPosition = function(delta) {
    this.cameraPosition[0] += delta[0];
    this.cameraPosition[1] += delta[1];
    this.cameraPosition[2] += delta[2];
    this.updateCameraPosition();
    return TileWebGL.Models.Stage.setCameraPosition(this.cameraPosition);
  };

  AppView.prototype.addLights = function() {
    var dirLight;
    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set(200, 200, 150);
    this.scene.add(dirLight);
    dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set(0, 0, 300);
    return this.scene.add(dirLight);
  };

  AppView.prototype.toggleStats = function() {
    if (this.stats) {
      return this.domContainer.removeChild(this.stats.domElement);
    } else {
      this.stats = new Stats();
      this.stats.domElement.style.position = "absolute";
      this.stats.domElement.style.bottom = "0px";
      this.stats.domElement.style.zIndex = 100;
      return this.domContainer.appendChild(this.stats.domElement);
    }
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

  AppView.prototype.registerEvents = function() {
    var el;
    THREEx.WindowResize(this.renderer, this.camera);
    THREEx.FullScreen.bindKey({
      charCode: "m".charCodeAt(0)
    });
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

  AppView.prototype.handleMoveEvent = function(coord) {
    var intersect, layerController;
    if (this.ignoreMouseEvents) {
      return;
    }
    intersect = this.raycastIntersects(coord);
    if (intersect != null) {
      if (!intersect.object.view.mouseMove([intersect.point.x, intersect.point.y])) {
        layerController = TileWebGL.appController.activeLayerController();
        return layerController.mouseMove([intersect.point.x, intersect.point.y]);
      }
    }
  };

  AppView.prototype.handleUpEvent = function(coord) {
    var intersect, layerController;
    if (this.ignoreMouseEvents) {
      return;
    }
    intersect = this.raycastIntersects(coord);
    if (intersect != null) {
      if (!intersect.object.view.mouseUp([intersect.point.x, intersect.point.y])) {
        layerController = TileWebGL.appController.activeLayerController();
        return layerController.mouseUp([intersect.point.x, intersect.point.y]);
      }
    }
  };

  AppView.prototype.handleDownEvent = function(coord) {
    var intersect;
    if (this.ignoreMouseEvents) {
      return;
    }
    intersect = this.raycastIntersects(coord);
    if (intersect != null) {
      return intersect.object.view.mouseDown([intersect.point.x, intersect.point.y]);
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
    this.showWall();
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
    var id, tileView, _ref;
    _ref = this.tileViews;
    for (id in _ref) {
      tileView = _ref[id];
      tileView.destroy();
    }
    return this.tileViews = {};
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
    this.layerController = TileWebGL.activeLayerController();
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

  Wall.prototype.mouseMove = function(coord) {
    return false;
  };

  Wall.prototype.mouseDown = function(coord) {
    return false;
  };

  Wall.prototype.mouseUp = function(coord) {
    return false;
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
    if (!(this.tileSelected && TileWebGL.appController.state === 'create')) {
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

  Tile.prototype.tilePosZ = function() {
    return this.tile.id * 5;
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

  TileSegment.prototype.mouseMove = function(coord) {
    return false;
  };

  TileSegment.prototype.mouseDown = function(coord) {
    this.state = 'mousedown';
    return true;
  };

  TileSegment.prototype.mouseUp = function(coord) {
    var selection;
    if (this.state !== 'mousedown') {
      return;
    }
    selection = [this.tile.id, this.segmentIndex];
    if (this.layerController.isTileSelected(selection)) {
      this.layerController.splitTileSegment(selection);
    } else {
      this.layerController.selectTileSegment(selection);
      this.tileView.selectTile();
    }
    this.state = void 0;
    return true;
  };

  TileSegment.prototype.tilePosZ = function() {
    return this.tileView.tilePosZ();
  };

  TileSegment.prototype.geometry = function() {
    var geom, pointIndex;
    geom = new THREE.Geometry();
    pointIndex = 0;
    while (pointIndex < this.data.length) {
      geom.vertices.push(this.vector3(pointIndex, TileWebGL.prefs.depth + this.tilePosZ()));
      geom.vertices.push(this.vector3(pointIndex, this.tilePosZ()));
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
    this.layer = this.layerController.layer;
    this.tile = this.tileView.tile;
    this;
  }

  ControlPoint.prototype.createInnerCircle = function() {
    var circleGeometry, material, p;
    material = new THREE.MeshLambertMaterial({
      color: 0x999999,
      emissive: 0x999999
    });
    circleGeometry = new THREE.RingGeometry(8, 14, 32);
    p = this.tile.location;
    this.innerCircle = new THREE.Mesh(circleGeometry, material);
    this.innerCircle.position.x = this.coord[0] + p[0];
    this.innerCircle.position.y = this.coord[1] + p[1];
    this.innerCircle.position.z = TileWebGL.prefs.depth + this.tileView.tilePosZ() + 20;
    this.innerCircle['view'] = this;
    return this.appView.addToScene(this.innerCircle);
  };

  ControlPoint.prototype.createOuterCircle = function() {
    var circleGeometry, material, p;
    material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0
    });
    circleGeometry = new THREE.CircleGeometry(20, 32);
    p = this.tile.location;
    this.outerCircle = new THREE.Mesh(circleGeometry, material);
    this.outerCircle.position.x = this.coord[0] + p[0];
    this.outerCircle.position.y = this.coord[1] + p[1];
    this.outerCircle.position.z = TileWebGL.prefs.depth + this.tileView.tilePosZ() + 1;
    this.outerCircle['view'] = this;
    return this.appView.addToScene(this.outerCircle);
  };

  ControlPoint.prototype.create = function() {
    this.createInnerCircle();
    this.createOuterCircle();
    return this;
  };

  ControlPoint.prototype.destroy = function() {
    this.appView.removeFromScene(this.innerCircle);
    return this.appView.removeFromScene(this.outerCircle);
  };

  ControlPoint.prototype.mouseMove = function(coord) {
    return false;
  };

  ControlPoint.prototype.mouseDown = function(coord) {
    this.layerController.controlPointMouseDown(this.id);
    return true;
  };

  ControlPoint.prototype.mouseUp = function(coord) {
    this.layerController.controlPointMouseUp(this.id);
    return true;
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
