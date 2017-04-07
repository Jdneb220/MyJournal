$(function() {
  $.ajax({
      url: "journals",
      mathod: "GET",
      cache: false
    })
  .done(function( html ) {
      $( "#journals" ).append( html );
    });

});
