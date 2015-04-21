angular.module('gameFinder.controllers', [])

  .controller('LoginCtrl', function($scope, $http, auth, $state, store) {
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
        $http.post("http://localhost:3000/users", {token: profile.user_id})
          .success(function(data) {
            console.log(data);
            if(data["bgg_username"] === null){
              //Add first-time user prompt, which should set bgg_username to.. something?
              console.log("no bgg_username")
              $state.go('app.search');
            } else {
              $state.go('app.search')
            }
          });
      }, function(error) {
        console.log("There was an error logging in", error);
      });
    }

    $scope.$on('$ionic.reconnectScope', function() {
      doAuth();
    });

    doAuth();

  })

  .controller('LibCtrl', function($scope, $http, $stateParams) {
    var url = 'http://gamefinder.herokuapp.com/libraries';

    $http.get(url).success(function(game) {
      $scope.game = game;
      console.log('success!');
    }).error(function(data) {
      console.log('server side error occurred.');
    });
  })

  .controller('AppCtrl', function($rootScope, $scope, auth, store, $state, GameService, FilterService) {
      $scope.search = {};
      $scope.filter = {};
      $scope.search.libraryList = $rootScope.libraryList;
      $scope.search.gameList = $rootScope.gameList;
      $rootScope.gameList = true;

      $rootScope.items = null;
      $rootScope.library_games = null;
      $scope.logout = function() {
        auth.signout();
        store.remove('token');
        store.remove('profile');
        store.remove('refreshToken');
        $state.go('login', {}, {reload: true});
      };

      var scope = $rootScope;

      scope.$watch('libraryList', function(newValue, oldValue){
        $scope.search.libraryList = newValue;
      });
      scope.$watch('gameList', function(newValue, oldValue){
        $scope.search.gameList = newValue;
      });

      // $scope.mechFilter = function() {
      //   GameService.findbyMechanic([$scope.search.mechanic], scope.library_games)
      //     .then(function(response) {
      //       $rootScope.items = FilterService.filterDuplicates(response);
      //       // $rootScope.items = response;
      //       // console.log(scope.library_games)
      //     })
      // };

      $scope.mechFilter = function() {
        console.log($scope.filter.mechanic);
        var filtered_games = FilterService.findbyFilter($scope.filter, scope.library_games)
        $rootScope.items = FilterService.filterDuplicates(filtered_games);
      };
  })

  .controller('GameCtrl', function($scope, $http, $stateParams, GameService, FilterService) {
    var url = ['http://gamefinder.herokuapp.com/games/',$stateParams.gameId].join("");
    $http.get(url).success(function(game) {
      $scope.game = game;
    }).error(function(data) {
      console.log('server side error occurred.');
    });
  })

  .controller('SearchCtrl', function($rootScope, $scope, GameService, FilterService) {

    $scope.search = {};
    $scope.search.searchKey = "";
    $scope.search.libraryList = true;
    $scope.search.gameList = false;

    $scope.clearSearch = function () {
      $scope.search.searchKey = "";
      $scope.findAllLibraries();
    };

    $scope.searchFunc = function () {
       GameService.findLibrary($scope.search.searchKey).then(function(item) {
        $scope.search.items = item;
      })
    };

    $scope.goBack = function() {
      $scope.search.libraryList = true;
      $scope.search.gameList = false;
      $scope.findAllLibraries();
    };

    $scope.popGames = function(username) {
      GameService.findItems('game',username).then(function (response) {
        games_list = FilterService.filterDuplicates(response.data);
        $scope.search.items = games_list;

        $scope.search.gameList = true;
        $rootScope.gameList = true;

        $scope.search.libraryList = false;
        $rootScope.libraryList = false;

        var scope = $rootScope;
        scope.library_games = games_list;

        scope.$watch('items', function(newValue, oldValue){
           $scope.search.items = $rootScope.items || $scope.search.items;
        });

      })
    };

    $scope.findAllLibraries = function() {
      GameService.findItems('library').then(function (response) {
        $scope.search.items = response.data;
      })
    };

    $scope.findAllLibraries();

  })
