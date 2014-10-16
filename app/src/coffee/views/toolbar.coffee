class TileWebGL.Views.ToolbarExpand
  constructor: (@toolbar) ->
    @g = @toolbar.g.append('svg:g')
    @data = [
      {title: 'replay', onPress: => @toolbar.controller.replayPressed() },
      {title: 'clear', onPress: => @toolbar.controller.clearPressed() },
      {title: 'save', onPress: => @toolbar.controller.savePressed() }
    ]

    @margin = 5
    @buttonWidth = 70
    @buttonHeight = 45

  enable: (x, data) ->
    gButton = @g.selectAll('g').data(data)
    gButtonEnter = gButton.enter().append('g').attr("transform", (d, i) => "translate(#{x}, -#{(@margin + @buttonHeight) * (i+1)})" ).
    on('mouseup', (d) -> d.onPress() ).
    on('mousedown', (d) => d3.event.stopPropagation() if @opened )
    gButtonEnter.append("rect").attr('width', 70).attr('height', @buttonHeight)
    gButtonEnter.append("text").attr("x", @margin).attr("y", @margin + @buttonHeight / 2).text( (d) -> d.title )
    gButton.exit().remove()

  retract: ->
    @enable(0,[])


class TileWebGL.Views.Toolbar
  constructor: (@controller) ->
    @showData = [
      {title: 'replay', onPress: => @controller.replayPressed() },
      {title: 'x', onPress: => @controller.exitPressed() }
    ]

    @editData = [
      {title: 'add tile', onPress: => @controller.addPressed() },
      {title: '^doc', onPress: (i) => @toggleToolbar(i) },
      {title: 'x', onPress: => @controller.exitPressed() }
    ]

    @replayData = [
      {title: 'complete', onPress: => @controller.completeReplayPressed() },
      {title: 'x', onPress: => @controller.continueReplayPressed() }
    ]

    @margin = 5
    @buttonWidth = 70
    @buttonHeight = 45

    @g = TileWebGL.svgOverlay.append('svg:g')
    @g.attr('id', 'popup-buttonset').attr('opacity', 0)
    @rectBorder = @g.append('svg:rect')

  enable: (data) ->
    @size = [(@margin + @buttonWidth) * data.length + @margin, @buttonHeight+@margin*2]
    @rectBorder.attr('width', @size[0] ).attr('height', @size[1])

    gButton = @g.selectAll('g').data(data)
    gButtonEnter = gButton.enter().append('g').attr("transform", (d, i) => "translate(#{(@margin + @buttonWidth) * i + @margin}, #{@margin})" ).
    on('mouseup', (d, i) => @onPress(d,i) ).
    on('mousedown', (d) => d3.event.stopPropagation() if @opened )
    gButtonEnter.append("rect").attr('width', 70).attr('height', @buttonHeight)
    gButtonEnter.append("text").attr("x", @margin).attr("y", @margin + @buttonHeight / 2).text( (d) -> d.title )
    gButton.exit().remove()

  enableShow: ->
    @enable []
    @enable @showData

  enableEdit: ->
    @enable []
    @enable @editData

  enableReplay: ->
    @enable []
    @enable @replayData

  onPress: (d,i) ->
    d3.event.stopPropagation()
    d.onPress(i, @retractExpand())

  toggleToolbar: (i) ->
    return if @wasExpanded
    @expand = new TileWebGL.Views.ToolbarExpand(@)
    x = @margin + (@margin + @buttonWidth) * i
    @expand.enable(x, @expand.data)

  retractExpand: ->
    if @expand
      @wasExpanded = true
      @expand.retract()
      @expand = null
    else
      @wasExpanded = false

  open: ->
    @g.attr('transform', "translate(#{window.innerWidth/2 - @size[0]/2}, #{window.innerHeight - 60})")
    @g.attr('opacity', 1)
    @opened = true

  close: ->
    @g.attr('opacity', 0)
    @opened = false
    TileWebGL.svgOverlay.attr('class','overlay pass-through')



