angular.module('gameFinder.services', [])

  .factory('SearchService', function($http) {
    var cachedGames;
    return {

        findAll: function() {
            return cachedGames || $http.get("http://localhost:3000/games").success(function(response){
                cachedGames = response;
                return response;
                // return games;
            });
        },

        findByName: function(gameName) {
            // var url = ["http://localhost:3000/games/", gameId].join("")
            // var url = $http.get("http://localhost:3000/games")

            return $http.get(url).then(function(response){
                game = response;
                return game;
            });
        }

        findById: function(gameId) {
            var url = ["http://localhost:3000/games/", gameId].join("")
            return $http.get(url).then(function(response){
                game = response;
                return game;
            });
        }
    }
  });

