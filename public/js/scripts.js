$(function() {
  $.ajax({
    url: "journals",
    cache: false
  })
  .done(function( html ) {
    $( "#journals" ).append( html );
  });
});
