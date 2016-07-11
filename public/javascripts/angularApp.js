angular.module('healthMG', ['ui.router'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/home.html',
                    controller: 'MainCtrl'
                    //resolve: {
                    //  postPromise: ['posts', function(posts){
                    //    return posts.getAll();
                    //  }]
                    //}
                })
                //.state('posts', {
                //  url: '/posts/{id}',
                //  templateUrl: '/posts.html',
                //  controller: 'PostsCtrl',
                //  resolve: {
                //    post: ['$stateParams', 'posts', function($stateParams, posts) {
                //      return posts.get($stateParams.id);
                //    }]
                //  }
                //})
                .state('login', {
                    url: '/login',
                    templateUrl: '/login.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function($state, auth){
                        if(auth.isLoggedIn()){
                            $state.go('home');
                        }
                    }]
                })
                .state('subscriber', {
                    url: '/subscriber',
                    templateUrl: '/subscriber.html',
                    controller: 'SubCtrl',
                    // resolve: {
                    //     subscription: ['$stateParams', 'subscriptions', function($stateParams, subscriptions) {
                    //         return subscriptions.get($stateParams.id);
                    //     }]
                    // }
                    resolve: {
                     postPromise: ['subscriptions', function(subscriptions){    /////publishers********************************************
                       return subscriptions.getAll();
                     }]
                    }
                })
                .state('publisher', {
                    url: '/publisher',
                    templateUrl: '/publisher.html',
                    controller: 'PubCtrl'

                })
                .state('register', {
                    url: '/register',
                    templateUrl: '/register.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function($state, auth){
                        if(auth.isLoggedIn()){
                            $state.go('home');
                        }
                    }]
                });

            $urlRouterProvider.otherwise('home');
        }]);


angular.module('healthMG').factory('subscriptions', ['$http', 'auth', function($http, auth){
    var o = {
        publishers: []
    };

    // o.get = function(id) {
    //     return $http.get('/subscriptions/' + id).then(function(res){
    //         return res.data;
    //     });
    // };

    o.getAll = function() {
        return $http.get('/subscriptions').success(function(data){
            angular.copy(data, o.publishers);
        });
    };

    o.create = function(subscription) {
        return $http.post('/subscriptions', subscription, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.publishers.push(data);
            // })
            // .error(function(error) {
            //     $scope.error = error;
        });
    };

    return o;
}]);


angular.module('healthMG').controller('SubCtrl', [
    '$scope',
    'subscriptions',
    'auth',
    function($scope, subscriptions, auth){
        $scope.publishers = subscriptions.publishers;
        $scope.isLoggedIn = auth.isLoggedIn;
        var publisherID;

        $scope.addSubscription = function(){
            if($scope.publisherUsername === '') { return; }
            var currentUserID = auth.currentUserID();

            // publisherID = auth.publisherUserID($scope.publisherUsername)();
            //
            auth.publisherUserID($scope.publisherUsername, function(data) {
                publisherID = data._id;
                subscriptions.create({
                    status:     "Active",
                    publisher:  publisherID,
                    subscriber: currentUserID
                });
                $scope.publisherUsername = '';
            });

            // var currentUserID = auth.currentUserID();

            // $scope.publisherUserID = auth.publisherUserID($scope.publisherUsername);
            // var publisherUserID = auth.publisherUserID($scope.publisherUsername)();
            //var publisherUserID = publisherUser();

        };

    }]);

angular.module('healthMG').factory('auth', ['$http', '$window', '$rootScope', function($http, $window, $rootScope){

    var auth = {
        saveToken: function (token){
            $window.localStorage['health-mg-token'] = token;
        },
        getToken: function (){
            return $window.localStorage['health-mg-token'];
        },
        isLoggedIn: function(){
            var token = auth.getToken();

            if(token){
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        },
        currentUser: function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        },
        currentAccount: function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.account;
            }
        },
        currentUserID: function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload._id;
            }
        },

        publisherUserID: function(username, callback){
                    $http.get('/publisher/' + username).success(function(response) {
                        callback && callback(response);
                    });
        },

        register: function(user){
            return $http.post('/register', user).success(function(data){
                auth.saveToken(data.token);
                //account = user.account;
            });

        },
        logIn: function(user){
            return $http.post('/login', user).success(function(data){
                auth.saveToken(data.token);
                //account = user.account;
            });
        },

        logOut: function(){
            $window.localStorage.removeItem('health-mg-token');
        }
    };

    return auth;

}]);


angular.module('healthMG').controller('PubCtrl', [
    '$scope',
    'auth',
    function($scope, auth){


    }]);

angular.module('healthMG').controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};
        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                if($scope.user.account == 'subscriber'){
                    $state.go('subscriber');
                }
                else{
                    $state.go('publisher');
                }

            });
        };
    }]);

angular.module('healthMG').controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.currentAccount = auth.currentAccount;
        $scope.logOut = auth.logOut;
    }]);


