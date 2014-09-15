angular.module( 'app.index', [
])

.config( function( $stateProvider ) {
  $stateProvider
    .state( 'app.index', {
      url: '',
      views: {
        content: {
          templateUrl: 'index/index.tpl.html',
          controller: function() {
          }
        }
      }
    });
})

;
