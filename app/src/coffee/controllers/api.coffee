class Message
  constructor: ->
    @_$message = $('#message')


  setMessageText: (text, cssClass = '') ->
    @_$message.text(text)
    @_$message.attr('class',cssClass)

class TileWebGL.Controllers.WebSock
  constructor: ->
    @_actionsToSend = []
    @_actionsReceived = []

  sendAction: (d) ->
    now = new Date().getTime()
    elapsedTime = if @lastTime? then now - @lastTime else 0
    @_actionsToSend.push [d, elapsedTime]

  sendActions: ->
    processActionsToSend = =>
      if @_actionsToSend.length > 0
        @socket.send(JSON.stringify(@_actionsToSend))
        @numActionsSent += @_actionsToSend.length
        new Message().setMessageText('S: ' + @numActionsSent)
        @_actionsToSend = []
        setTimeout( processActionsToSend, 10)
      else
        setTimeout( processActionsToSend, 10)
    processActionsToSend()

  startSending: ->
    @numActionsSent = 0
    new Message().setMessageText('Connecting to server..')
    @socket = new WebSocket("ws://protected-citadel-9552.herokuapp.com")
    @socket.onerror = =>
      new Message().setMessageText('Connection failure', 'error')
    @socket.onopen = =>
      new Message().setMessageText('Connected and sending..')
      @socket.send('sending')
      @sendActions()

  startReceiving: () ->
    @numActionsReceived = 0
    @actions = []
    processAction = =>
      TileWebGL.activeLayerController().layer.processAction @action[0]
      @action = @actions.pop()
      if @action?
        timeOut = if @action[1] > 250 then 250 else @action[1]
        setTimeout( processAction, timeOut)

    new Message().setMessageText('Connecting to server..')
    @socket = new WebSocket("ws://protected-citadel-9552.herokuapp.com");
    @actions = []
    @socket.onerror = =>
      new Message().setMessageText('Connection failure', 'error')
    @socket.onopen = =>
      new Message().setMessageText('Connected and receiving..')
      @socket.send('receiving')
      @socket.onmessage = (event) =>
        @actions = @actions.concat JSON.parse(event.data)
        @numActionsReceived += @actions.length
        new Message().setMessageText('R: ' + @numActionsReceived)
        @action = @actions.pop()
        processAction()

TileWebGL.api = new TileWebGL.Controllers.WebSock()