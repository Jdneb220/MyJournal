$(function() {
  $.ajax({
      url: "journals",
      mathod: "GET",
      cache: false
    })
  .done(function( html ) {
      $( "#journals" ).append( html );
    });

  setTimeout(function(){
    $('.card-panel.myRed').fadeOut()
  }, 2000)
});
