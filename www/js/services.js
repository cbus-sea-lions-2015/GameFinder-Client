angular.module('gameFinder.services', [])

  .factory('GameService', function($http, $q) {

    var app_url = "http://gamefinder.herokuapp.com/libraries/";

    var findAll = function(type,username, root_scope_games) {
        var url;
        if(type === 'library') {
            url = app_url;
        }
        else {
            url = [app_url,username].join("");
        }
        return $http.get(url).success(function(response){
            if (typeof response === 'array') {
                return response;
            }
            else {
                root_scope_games = [response]
                return [response];
            };
        });
    };

    var GameService = {
      
      findItems: function(type,username, root_scope_games) {
          return findAll(type,username, root_scope_games);
      },

      findLibrary: function(name) {
          var deferred = $q.defer();
          var output;
          findAll('library').then(function (response) {
              var libraries = response.data;
              output = _.where(libraries, { bgg_username: name });
              deferred.resolve(output);
          });
          return deferred.promise;
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
        if ( game.minplayers <= numPlayers && numPlayers <= game.maxplayers ) { found = true; }
          return found;
        })
        return output;
      },

      playtimeFilter: function(playTime, games_input) {
        var output =  _.filter(games_input, function(game) {
          var found = false;
        if ( game.minplaytime <= playTime && playTime <= game.maxplaytime ) { found = true; }
          return found;
        })
        return output;
      }
    }
    return FilterService;
  });
