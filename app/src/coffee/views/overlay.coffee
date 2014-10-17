class TileWebGL.Views.Overlay
  constructor: () ->
    @width = window.innerWidth - 5
    @height = window.innerHeight - 5

    TileWebGL.svgOverlay = d3.select("#tile_webgl").append("svg:svg").attr("width", @width).attr("height", @height)
    TileWebGL.svgOverlay.attr('class', 'overlay pass-through')

    # app view
    @overlay = TileWebGL.svgOverlay.append("svg:g").attr("width", @width).attr("height", @height)
    center = @overlay.append('svg:g').attr('transform', "translate(#{window.innerWidth/2}, #{window.innerHeight/2})")
    @$textMsg = center.append('svg:text').attr('text-anchor', 'middle')
    @$target = @overlay.append('svg:g').style("opacity", 0)
    @$target.append('circle').attr('r', 10)
    TileWebGL.appController.onStateChange( (state) =>
      @hideFlash()
    )

  flashMessage: (message) ->
    @$textMsg.text(message)
    @flashActive = true

  showTarget: (coordinates) ->
    if coordinates
      @$target.attr('transform', "translate(#{coordinates[0]}, #{coordinates[1]})").style("opacity", 1)

  hideTarget: ->
    @$target.style("opacity", 0)

  hideFlash: ->
    @$textMsg.transition().style("opacity", 0)
    @flashActive = false
