const loremIpsum = require('lorem-ipsum');

angular.module('controllers', [])
    .controller('HomeController', ['$scope', function($scope) {
        $scope.pageTitle = 'Sample App';
        $scope.greeting = 'Hello, World!';
        $scope.fillerText = (function () {
            var paragraphs = [];
            for (let i = 0; i < 15; i++) {
                paragraphs.push(loremIpsum({units: 'paragraphs'}));
            }
            return paragraphs;
        })();
    }]);

