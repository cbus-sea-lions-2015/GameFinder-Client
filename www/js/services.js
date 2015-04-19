angular.module('gameFinder.services', [])

  .factory('SearchService', function($http, $q) {
    // var cachedGames;
    var app_url = "http://gamefinder.herokuapp.com/libraries";

    var findAll = function() {
        return $http.get(app_url).success(function(response){
            return [response];
        });
    };

    var SearchService = {
        findAll:findAll,

        findByName: function(name) {
            var deferred = $q.defer();
            var output;
             findAll().then(function (response) {
                var games = [response.data];
                console.log(name);
                output = _.where(games, { bgg_username: name });
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
    return SearchService;
  });

