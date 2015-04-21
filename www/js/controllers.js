angular.module('gameFinder.controllers', [])

  .controller('LoginCtrl', function($scope, $http, auth, $state, store, $ionicModal) {

    $scope.bgg_username = {};

    $ionicModal.fromTemplateUrl('templates/welcome.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeWelcome = function() {
      $scope.modal.hide();
    };

    $scope.welcomeNewUser = function() {
      console.log("welcome new user!")
      // Function to display the modal when new user logs in
      $scope.modal.show();
    };


    $scope.newLibrary = function() {
      // Check to see if username is username first
      // If username, send to libraries post route and close?
      // If not username, prompt the user, display error
      console.log($scope.bgg_username)
    };




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
        $http.post("http://gamefinder.herokuapp.com/users", {token: profile.user_id})
          .success(function(data) {
            console.log(data);
            if(data["bgg_username"] === null){
              //Add first-time user prompt, which should set bgg_username to.. something?
              console.log("no bgg_username")
              $state.go('app.search');
              $scope.welcomeNewUser();
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
      $scope.search.is_libraryList = $rootScope.is_libraryList;
      $scope.search.is_gameList = $rootScope.is_gameList;
      $rootScope.is_gameList = true;

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

      scope.$watch('is_libraryList', function(newValue, oldValue){
        $scope.search.is_libraryList = newValue;
      });
      scope.$watch('is_gameList', function(newValue, oldValue){
        $scope.search.is_gameList = newValue;
      });

      //FILTER BY PLAYTIME
       $scope.playtimeFilter = function() {
         playtime_filter = { playTime: $scope.filter.playTime }
        if (!!playtime_filter.playTime){
          var filtered_games = FilterService.playtimeFilter(playtime_filter.playTime, scope.library_games)
          return FilterService.filterDuplicates(filtered_games);
        }
        else {
          return scope.library_games;
        };
      };

      //FILTER BY PLAYERS
       $scope.playerFilter = function(filtered_games_input) {
         player_filter = { numPlayers: $scope.filter.numPlayers }
        if (!!player_filter.numPlayers){
          var filtered_games = FilterService.playerFilter(player_filter.numPlayers, filtered_games_input)
          return FilterService.filterDuplicates(filtered_games);
        }
        else {
          return filtered_games_input;
        };
      };

      // FILTER BY CATEGORY
      $scope.categoryFilter = function(filtered_games_input) {
        category_filter = { categories: $scope.filter.categories }
        if (!!category_filter.categories){
          var filtered_games = FilterService.categoryFilter(category_filter, filtered_games_input)
          return FilterService.filterDuplicates(filtered_games);
        }
        else {
          return filtered_games_input;
        };
      };

      // FILTER BY MECHANIC
      $scope.mechFilter = function(filtered_games_input) {
        mechanic_filter = { mechanics: $scope.filter.mechanics }
        if (!!mechanic_filter.mechanics){
          var filtered_games = FilterService.mechFilter(mechanic_filter, filtered_games_input)
          return FilterService.filterDuplicates(filtered_games);
        }
        else {
          return filtered_games_input;
        };
      };

      $scope.filterValidFilters = function() {
        console.log("Filter Running");
        filtered_games_input = $scope.playtimeFilter();
        filtered_games_input = $scope.playerFilter(filtered_games_input);
        filtered_games_input = $scope.categoryFilter(filtered_games_input);
        filtered_games_input = $scope.mechFilter(filtered_games_input);
        console.log(filtered_games_input);
        $rootScope.library_games =  filtered_games_input;
      };

      $scope.clearSearch = function() {
        $scope.filter.numPlayers = "";
        $scope.filter.playTime = "";
        $scope.filter.mechanics = "";
        $scope.filter.categories = "";
        scope.library_games = scope.all_games;
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

  .controller('GamesCtrl', function($scope, $rootScope, $http, $stateParams, GameService, FilterService) {
    var url = ['http://gamefinder.herokuapp.com/libraries/',$stateParams.username].join("");

    $scope.library_games = {};
    $scope.search = {};
    $scope.username = $stateParams.username;
    $scope.search.is_libraryList = false;
    $scope.search.is_gameList = true;

    var scope = $rootScope;



    $scope.clearSearch = function () {
      $scope.search.searchKey = "";
      $scope.library_games = $scope.all_games;
    };

    $scope.searchFunc = function () {
       var search_results = GameService.findGame($scope.search.searchKey, $scope.library_games);
        $scope.library_games = search_results;
    };
    $scope.findAllGames = function() {
      GameService.findItems('game',$stateParams.username).then(function (response) {
        games_list = FilterService.filterDuplicates(response.data);
        console.log(games_list);

        $scope.all_games = games_list;
        $scope.library_games = $scope.all_games;
        scope.library_games = $scope.all_games;
        scope.all_games = $scope.all_games;
      });
    };

    scope.$watch('library_games', function(newValue, oldValue){
      $scope.library_games = $rootScope.library_games || $scope.library_games;
    });

    $scope.findAllGames();
  })

  .controller('SearchCtrl', function($rootScope, $scope, GameService, FilterService) {

    $scope.search = {};
    $scope.search.searchKey = "";
    $scope.search.is_libraryList = true;
    $scope.search.is_gameList = false;

    $scope.clearSearch = function () {
      $scope.search.searchKey = "";
      $scope.findAllLibraries();
    };

    $scope.searchFunc = function () {
       GameService.findLibrary($scope.search.searchKey).then(function(item) {
        $scope.search.items = item;
      })
    };

    $scope.findAllLibraries = function() {
      GameService.findItems('library').then(function (response) {
        $scope.search.items = response.data;
      })
    };

    $scope.findAllLibraries();

  })
