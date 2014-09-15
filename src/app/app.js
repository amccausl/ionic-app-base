// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', [
  'ionic',

  'app.index',
  'app.about',

  'app-templates'
])

.value( 'config', {
  // @if NODE_ENV == 'development'
  // @endif
  // @if NODE_ENV == 'staging'
  // @endif
  // @if NODE_ENV == 'production'
  // @endif
  version: '1.0.0',
})

.run( function( $ionicPlatform ) {
  $ionicPlatform.ready( function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if( window.cordova && window.cordova.plugins.Keyboard ) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
    }

    if( window.StatusBar ) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
})

.config( function( $compileProvider, $httpProvider, $stateProvider, $urlRouterProvider ) {

  // Whitelist "app:/" protocol for firefox packaged app
  // https://developer.mozilla.org/en-US/Apps/Tools_and_frameworks/common_libraries_and_frameworks
  $compileProvider.aHrefSanitizationWhitelist( /^\s*(https?|ftp|mailto|app|file|tel|market):/ );
  $compileProvider.imgSrcSanitizationWhitelist( /^\s*(https?|ftp|app|file|tel|market):/ );

  // @todo should be compiled
  $httpProvider.defaults.headers.common.Version = 'v1.0.0';

  // Setup root app
  $stateProvider
    .state( 'app', {
      url: '/app',
      abstract: true,
      templateUrl: 'app.tpl.html',
      controller: function() {
      }
    })
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app');
})

;
