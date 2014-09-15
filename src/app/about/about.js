angular.module( 'app.about', [
])

.config( function( $stateProvider ) {
  $stateProvider
    .state( 'about', {
      url: '/about',
      data: { title: 'About' },
      views: {
        content: {
          templateUrl: 'about/about.tpl.html',
          controller: function() {
          }
        }
      }
    });
})

;
