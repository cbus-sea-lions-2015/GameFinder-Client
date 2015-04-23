angular.module('gameFinder.services', [])

  .factory('GameService', function($http, $q) {

    var app_url = "http://gamefinder.herokuapp.com/libraries/";

    var filterDuplicates = function(resultdata) {
      return _.uniq(resultdata, false, function(p) { return p.name; });
    };

    var findAll = function(type,username_arr, viewable_games) {
      console.log("made it to GameService.findAll");
      var url;
      if(type === 'library') {
        url = app_url;
        return $http.get(url).success(function(response){
          if (typeof response === 'array') {
              return response;
          }
          else {
              viewable_games = [response]
              return [response];
          };
        });
      } else {
        var results = [];
        _.each(username_arr, function (username) {
          url = [app_url,username].join("");
          $http.get(url).success(function(response){
            _.each(filterDuplicates(response), function(result) {
              viewable_games.push(result);
            });
          });
        });
        // return results;
      };
    };

    var GameService = {

      findItems: function(type,username_arr, viewable_games) {
          return findAll(type,username_arr, viewable_games);
      },

      findGame: function(search_str, games_input) {
        var output =  _.filter(games_input, function(game) {
          var found = false;
            if (game.name.toLowerCase().indexOf(search_str.toLowerCase()) > -1)
            { found = true; }
          return found;
        })
        return output;
      },

      findLibrary: function(search_str, libraries_input) {
        // var deferred = $q.defer();
        // var output;
        // findAll('library').then(function (response) {
        //   var libraries = response.data;
        //   output = _.where(libraries, { bgg_username: name });
        //   deferred.resolve(output);
        // });
        // return deferred.promise;
        var output =  _.filter(libraries_input, function(library) {
          var found = false;
            if (library.bgg_username.toLowerCase().indexOf(search_str.toLowerCase()) > -1)
            { found = true; }
          return found;
        })
        return output;
      }
    }
    return GameService;
  })

  .factory('FilterService', function() {

    var FilterService = {
      filterDuplicates: function(promise_obj) {
          var unique_list;
          unique_list = _.uniq(promise_obj, false, function(p){ return p.name; });
          return unique_list;
      },

      categoryFilter: function(filter, games_input) {
        var output =  _.filter(games_input, function(game) {
          var found = false;
          _.each([filter.categories], function(filter_item){
              if (_.contains(game.categories, filter_item)) { found = true; }
          })
          return found;
        })
        return output;
      },

      mechFilter: function(filter, games_input) {
        var output =  _.filter(games_input, function(game) {
          var found = false;
          _.each([filter.mechanics], function(filter_item){
              if (_.contains(game.mechanics, filter_item)) { found = true; }
          })
          return found;
        })
        return output;
      },

      playerFilter: function(numPlayers, games_input) {
        var output =  _.filter(games_input, function(game) {
          var found = false;
          if ( game.minplayers <= numPlayers && numPlayers <= game.maxplayers ) {
            found = true;
          }
          return found;
        });
          return output;
      },

      playtimeFilter: function(playTime, games_input) {
        var output =  _.filter(games_input, function(game) {
          var found = false;
          if ( playTime >= game.maxplaytime ) {
            found = true;
          }
          return found;
        })
        return output;
      }
    }
    return FilterService;
  })

  .factory('ViewService', function(){
    var all_games = [];
    var viewable_games = [];

    var all_libraries = [];
    var viewable_libraries =[];
    
    var ViewService = {

      get_all_games: function() {
        return all_games
      },

      get_viewable_games: function() {
        return viewable_games
      },

      setAllGames: function(games_arr) {
        all_games = [].concat(games_arr || [])
      },

      setViewableGames: function(games_arr) {
        viewable_games = [].concat(games_arr || [])
      },

      resetViewableGames: function() {
        viewable_games = [].concat(all_games || [])
      },

      get_all_libraries: function() {
        return all_libraries
      },

      get_viewable_libraries: function() {
        return viewable_libraries
      },

      setAllLibraries: function(libraries_arr) {
        all_libraries = [].concat(libraries_arr || [])
      },

      setViewableLibraries: function(libraries_arr) {
        viewable_libraries = [].concat(libraries_arr || [])
      },

      resetViewableLibraries: function() {
        viewable_libraries = [].concat(all_libraries || [])
      }
    };
    return ViewService;
  })
