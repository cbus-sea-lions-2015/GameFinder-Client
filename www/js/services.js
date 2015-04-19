angular.module('gameFinder.services', [])

  .factory('GameService', function($http, $q) {
    // var cachedGames;

    var app_url = "http://gamefinder.herokuapp.com/libraries/";

    var findAll = function(type,username) {
        var url;
        if(type === 'library') {
            url = app_url
        }
        else {
            url = [app_url,username].join("")
        }
        return $http.get(url).success(function(response){
            if (typeof response == 'array') {
                return response;
            }
            else {
                return [response];
            }  ;
        });
    };

    var GameService = {

        findItems: function(type,username) {
            return findAll(type,username);
        },

        findLibrary: function(name) {
            var deferred = $q.defer();
            var output;
             findAll('library').then(function (response) {
                var libraries = response.data;
                output = _.where(libraries, { bgg_username: name });
                console.log(libraries);
                deferred.resolve(output);
            })
            return deferred.promise;
        },

        findGame: function(name) {
            var deferred = $q.defer();
            var output;
             findAll('game').then(function (response) {
                var games = response.data;
                output = _.where(games, { bgg_username: name });
                console.log(games);
                deferred.resolve(output);
            })
            return deferred.promise;
        },

        findById: function(gameId) {
            var url = ["http://gamefinder.herokuapp.com/games/", gameId].join("")
            return $http.get(url).then(function(response){
                console.log(response)
                game = [response.data];
                return game;
            });
        }
    }
    return GameService;
  });

