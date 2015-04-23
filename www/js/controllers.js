angular.module('gameFinder.controllers', [])

  .controller('LoginCtrl', function($rootScope, $scope, $http, auth, $state, store, $ionicModal) {

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
        $http.post("http://gamefinder.herokuapp.com/users", {token: profile.user_id, name: profile.name})
          .success(function(data) {
            $rootScope.user = profile;

            if(data["library_id"] == null){
              // Add first-time user prompt, which should set bgg_username to.. something?
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

    $scope.message = {};

    $ionicModal.fromTemplateUrl('templates/welcome.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeWelcome = function() {
      $scope.modal.hide();
    };

    $scope.welcomeNewUser = function() {
      // Function to display the modal when new user logs in
      $scope.modal.show();
    };

    $scope.newLibrary = function(user) {
      // Check to see if username is username first
      // If username, send to libraries post route and close?
      // If not username, prompt the user, display error
      $http.post("http://gamefinder.herokuapp.com/libraries",
      {
        token: $scope.user.user_id,
        bgg_username: user.bgg_username,
        name: $scope.user.name
      })
      .success(function(data) {
        if(data.message == 0) {
          $scope.message = "That library does not exist."
        } else {
          $scope.message = "This library is currently being imported. This typically takes moments to complete, however larger libraries may take 15-30 minutes to populate."
          $rootScope.user.bgg_username = user.bgg_username;
          $scope.closeWelcome();
          $state.go('app.search');
        }
      });
    };

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

  .controller('AppCtrl', function(
    $rootScope,
    $scope,
    auth,
    store,
    $state,
    GameService,
    FilterService,
    ViewService) {
      $scope.search = {};
      $scope.filter = {};
      $scope.search.is_libraryList = $rootScope.is_libraryList;
      $scope.search.is_gameList = $rootScope.is_gameList;
      $rootScope.is_gameList = true;

      $scope.setAllGames = ViewService.setAllGames;
      $scope.setViewableGames = ViewService.setViewableGames;
      $scope.resetViewableGames = ViewService.resetViewableGames;
      $scope.get_all_games = ViewService.get_all_games;
      $scope.get_viewable_games = ViewService.get_viewable_games;
      $scope.appendAllGames = ViewService.appendAllGames;
      $scope.sortAllGames = ViewService.sortAllGames;

      $rootScope.items = null;

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


      $scope.addAnotherLibrary = function(another) {
        console.log("Add Another Library")
        GameService.findItems('game',[$scope.search.another_bgg_username], $scope)
      };

      //FILTER BY PLAYTIME
       $scope.playtimeFilter = function(filtered_games_input) {
        playtime_filter = { playTime: $scope.filter.playTime }
        if (!!playtime_filter.playTime){
          var filtered_games = FilterService.playtimeFilter(playtime_filter.playTime, filtered_games_input)
          return FilterService.filterDuplicates(filtered_games);
        }
        else {
          return filtered_games_input;
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
        filtered_games_input = $scope.playtimeFilter($scope.get_all_games());
        filtered_games_input = $scope.playerFilter(filtered_games_input);
        filtered_games_input = $scope.categoryFilter(filtered_games_input);
        filtered_games_input = $scope.mechFilter(filtered_games_input);

        $scope.setViewableGames(filtered_games_input);
      };

      $scope.clearSearch = function() {
        $scope.filter.numPlayers = undefined;
        $scope.filter.playTime = undefined;
        $scope.filter.mechanics = undefined;
        $scope.filter.categories = undefined;

        $scope.resetViewableGames();
      };

      $scope.cardSwipedLeft = function(index) {
        console.log('LEFT SWIPE');
        $scope.cardDestroyed(index);
      };

      $scope.cardSwipedRight = function(index) {
        console.log('RIGHT SWIPE');
        $scope.cardDestroyed(index);
      };

      $scope.cardDestroyed = function(index) {
        $scope.library_games.splice(index, 1);
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

  .controller('GamesCtrl', function($scope, $rootScope, $http, $stateParams, GameService, FilterService, ViewService) {
    var url = ['http://gamefinder.herokuapp.com/libraries/',$stateParams.username].join("");

    $scope.search = {};
    $scope.username = $stateParams.username;
    $scope.search.is_libraryList = false;
    $scope.search.is_gameList = true;

    $scope.setAllGames = ViewService.setAllGames;
    $scope.setViewableGames = ViewService.setViewableGames;
    $scope.resetViewableGames = ViewService.resetViewableGames;
    $scope.get_all_games = ViewService.get_all_games;
    $scope.get_viewable_games = ViewService.get_viewable_games;
    $scope.appendAllGames = ViewService.appendAllGames;
    $scope.sortAllGames = ViewService.sortAllGames;


    if($rootScope.user && $rootScope.user.bgg_username == $stateParams.username) {
      $scope.isCurrentUser = true;
      $scope.pageTitle = "My Library";
    } else {
      $scope.pageTitle = [$scope.username,"'s Library"].join("");
    };
    
    $scope.clearSearch = function () {
      $scope.search.searchKey = "";
      $scope.resetViewableGames();
    };

    $scope.searchFunc = function () {
      var search_results = GameService.findGame($scope.search.searchKey, $scope.get_all_games());
      $scope.setViewableGames(search_results);
    };

    $scope.findAllGames = function() {
      GameService.findItems('game',[$stateParams.username], $scope);
    };

    // scope.$watch('library_games', function(newValue, oldValue){
    //   $scope.library_games = $rootScope.library_games || $scope.library_games;
    // });
    
    $scope.setAllGames(null);
    $scope.resetViewableGames();
    $scope.findAllGames();
  })

  .controller('SearchCtrl', function($rootScope, $scope, GameService, FilterService, ViewService) {

    $scope.search = {};
    $scope.search.searchKey = "";
    $scope.search.is_libraryList = true;
    $scope.search.is_gameList = false;

    $scope.setAllLibraries = ViewService.setAllLibraries
    $scope.setViewableLibraries = ViewService.setViewableLibraries
    $scope.resetViewableLibraries = ViewService.resetViewableLibraries
    $scope.get_all_libraries = ViewService.get_all_libraries
    $scope.get_viewable_libraries = ViewService.get_viewable_libraries

    $scope.clearSearch = function () {
      $scope.search.searchKey = "";

      $scope.resetViewableLibraries();
    };

    $scope.searchFunc = function () {
      var search_results = GameService.findLibrary($scope.search.searchKey, $scope.get_all_libraries());

      $scope.setViewableLibraries(search_results);
    };

    $scope.findAllLibraries = function() {
      GameService.findItems('library').then(function (response) {
        $scope.search.items = response.data;

        $scope.setAllLibraries(response.data);
        $scope.setViewableLibraries(response.data);
      })
    };

    $scope.findAllLibraries();

  })
