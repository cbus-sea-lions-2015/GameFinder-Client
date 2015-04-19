angular.module('gameFinder.services', [])

  .factory('SearchService', function($http) {
    return {
        findAll: function() {
            return $http.get("http://localhost:3000/games").success(function(response){
                return response;
                // return games;
            });
        },

        findById: function(gameId) {
            var url = ["http://localhost:3000/games/", gameId].join("")
            return $http.get(url).then(function(response){
                game = response;
                return game;
            });
        }
    }
  });

