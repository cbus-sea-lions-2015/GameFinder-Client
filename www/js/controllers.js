angular.module('gameFinder.controllers', [])

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
        $state.go('app.library');
      }, function(error) {
        console.log("There was an error logging in", error);
      });
    }

    $scope.$on('$ionic.reconnectScope', function() {
      doAuth();
    });

    doAuth();

  })

  .controller('AppCtrl', function($scope, auth, store, $state) {
    $scope.logout = function() {
      auth.signout();
      store.remove('token');
      store.remove('profile');
      store.remove('refreshToken');
      $state.go('login', {}, {reload: true});
    };
  })

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
      console.log(game);
      console.log('success!');
    }).error(function(data) {
      console.log('server side error occurred.');
    });
  })

  .controller('SearchCtrl', function($scope,$rootScope, SearchService) {
    $scope.search = {};
    $scope.search.searchKey = "";
    console.log(_);

    $scope.clearSearch = function () {
      $scope.search.searchKey = "";
      console.log($scope);
      findAllGames();
    };

    $scope.search = function () {
      SearchService.findByName($scope.search.searchKey).then(function(game) {
        $scope.search.games = [game.data];
        console.log("made search!");
        console.log(game.data);
      });
    };

    var findAllGames = function() {
      SearchService.findAll().then(function (response) {
        $scope.search.games = [response.data];
        console.log(response.data);
      })
    };

    findAllGames();

  });

