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

  $.ajax({
      url: "/stats/users",
      mathod: "GET",
      cache: false
    })
  .done(function( html ) {
      $( "#user_stats" ).append( html );
    });

});

