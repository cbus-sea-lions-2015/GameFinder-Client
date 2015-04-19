angular.module('gameFinder.services', [])

  .factory('SearchService', function($http, $q) {
    // var cachedGames;
    var findAll = function() {
        return $http.get("http://gamefinder.herokuapp.com/games").success(function(response){
            return [response];
        });
    };

    var SearchService = {
        findAll:findAll,

        findByName: function(gameName) {
            var deferred = $q.defer();
            var output;
             findAll().then(function (response) {
                var games = [response.data];
                output = _.where(games, {name: gameName});
                deferred.resolve(output);
            })
            return deferred.promise;
        },

        findById: function(gameId) {
            var url = ["http://localhost:3000/games/", gameId].join("")
            return $http.get(url).then(function(response){
                game = response;
                return game;
            });
        }
    }
    return SearchService;
  });

