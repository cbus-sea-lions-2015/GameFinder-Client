angular.module('starter.controllers', [])
.controller('LoginCtrl', function($scope, auth, $state, store) {
  function doAuth() {
    auth.signin({
      closable: false,
      // This asks for the refresh token
      // So that the user never has to log in again
      authParams: {
        scope: 'openid offline_access'
      }
    }, function(profile, idToken, accessToken, state, refreshToken) {
      store.set('profile', profile);
      store.set('token', idToken);
      store.set('refreshToken', refreshToken);
      $state.go('app.playlists');
    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }

  $scope.$on('$ionic.reconnectScope', function() {
    doAuth();
  });

  doAuth();
  
  
})

// .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
//   // Form data for the login modal
//   // $scope.loginData = {};

//   // // Create the login modal that we will use later
//   // $ionicModal.fromTemplateUrl('templates/login.html', {
//   //   scope: $scope
//   // }).then(function(modal) {
//   //   $scope.modal = modal;
//   // });

//   // // Triggered in the login modal to close it
//   // $scope.closeLogin = function() {
//   //   $scope.modal.hide();
//   // };

//   // // Open the login modal
//   // $scope.login = function() {
//   //   $scope.modal.show();
//   // };

//   // // Perform the login action when the user submits the login form
//   // $scope.doLogin = function() {
//   //   console.log('Doing login', $scope.loginData);

//   //   // Simulate a login delay. Remove this and replace with your login
//   //   // code if using a login system
//   //   $timeout(function() {
//   //     $scope.closeLogin();
//   //   }, 1000);
//   // };
// })

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Game 1', id: 1 },
    { title: 'Game 2', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('GameCtrl', function($scope, $http, $stateParams) {
  var url = 'http://localhost:3000/games/1';

  $http.get(url).success(function(game) {
    $scope.game = game;
    console.log('success!');
  }).error(function(data) {
    console.log('server side error occurred.');
  });

.controller('AppCtrl', function($scope, auth, store, $state) {
  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login', {}, {reload: true});
  };
});
