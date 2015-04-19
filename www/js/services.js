angular.module('gameFinder.services', [])

  .factory('SearchService', function($http, $q) {
    // var cachedGames;
    var app_url = "http://gamefinder.herokuapp.com/libraries";

    var findAll = function() {
        return $http.get(app_url).success(function(response){
            if (typeof response == 'array') {
                return response;
            }
            else {
                return [response];
            }  ;
        });
    };

    var SearchService = {
        findAll:findAll,

        findByName: function(name) {
            var deferred = $q.defer();
            var output;
             findAll().then(function (response) {
                var games = response.data;
                // console.log(name);
                output = _.where(games, { bgg_username: name });
                console.log(games);
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

