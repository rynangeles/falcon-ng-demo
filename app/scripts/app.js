'use strict';

/* ==================================
	- Main app module
	- Inject module dependencies
===================================*/
angular.module('trunkApp', [
	'ui.router',
	'ngResource'
]).
/* ==================================
	- Application configuration
===================================*/
config([
	'$urlRouterProvider',
	'$stateProvider',
	function ($urlRouterProvider, $stateProvider){
		$urlRouterProvider.otherwise('/todos');

		$stateProvider.state('todos', {
			url : '/todos',
			templateUrl : 'views/partials/todo.html',
			controller : 'TodoController'
		}).state('todos.view',{
			url : '/:id/view',
			templateUrl : 'views/partials/todo.view.html',
			controller : 'TodoViewController'
		}).state('todos.add',{
			url : '/new',
			templateUrl : 'views/partials/todo.add.html',
			controller : 'TodoCreateController'
		}).state('todos.edit',{
			url : '/:id/edit',
			templateUrl : 'views/partials/todo.edit.html',
			controller : 'TodoEditController'
		});
	}
]).
/* ==================================
	- Application contants
===================================*/
constant('CONFIG',{
	API : {
		HOST : '127.0.0.1',
		PORT : 8000
	}
}).
/* ==================================
	- Application API service
===================================*/
factory('TodoService', [
    '$resource',
    'CONFIG',
    function ($resource, CONFIG){
        return $resource(
			"http://" + CONFIG.API.HOST + ":" + CONFIG.API.PORT + '/api/todos', 
			{}, {
				update: {
					method: 'PUT'
				}
			}, {
			stripTrailingSlashes: false
		});

    }
]).
/* ==================================
	- Simple directive
===================================*/
directive('ngConfirm', [
	function () {
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	            element.bind('click', function() {
	                var message = attrs.ngConfirmMessage;
	                if (message && confirm(message)) {
	                    scope.$apply(attrs.ngConfirm);
	                }
	            });
	        }
	    }
	}
]).
/* ==================================
	- Application controllers
===================================*/
controller('TodoController', ['$scope', '$stateParams', '$state', 'TodoService', 
	function ($scope, $stateParams, $state, TodoService) {
		$scope.$state = $state;
		$scope.todos = TodoService.query(); // fetch all todos. Issue a GET to /api/todos
		$scope.deleteTodo = function(todo){
			todo.$delete({id:todo._id.$oid}, function(){
				$state.go('todos', {}, {reload: true}); // on success go back to home i.e. todos state.
				alert("Todo successfully deleted!");
			});
		};
	}
]).
controller('TodoViewController', ['$scope', '$stateParams', 'TodoService', 
	function ($scope, $stateParams, TodoService) {
		$scope.todo = TodoService.get({ id: $stateParams.id }); // get a single todo. Issues a GET to /api/todos/:id
		$scope.deleteTodo = function(todo){
			todo.$delete({id:todo._id.$oid}, function(){
				$state.go('todos', {}, {reload: true}); // on success go back to home i.e. todos state.
				alert("Todo successfully deleted!");
			});
		}
	}
]).
controller('TodoCreateController', ['$scope', '$stateParams', '$state', 'TodoService', 
	function ($scope, $stateParams, $state, TodoService) {
		$scope.todo = new TodoService();  //create new todo instance. Properties will be set via ng-model on UI
		$scope.addTodo = function (){
			$scope.todo.$save(function() {
				alert("Todo successfully created!");
				$state.go('todos', {}, {reload: true}); // on success go back to home i.e. todos state.
			});
		};
	}
]).
controller('TodoEditController', ['$scope', '$stateParams', '$state', 'TodoService', 
	function ($scope, $stateParams, $state, TodoService) {
		$scope.todo = {}
		TodoService.get({ id: $stateParams.id }).$promise.then(function(data){
			$scope.todo = data;
			$scope.todo.targetDate = new Date(data.targetDate);
		}); // get a single todo. Issues a GET to /api/todos/:id
		$scope.updateTodo = function (){
			$scope.todo.$update({id:$scope.todo._id.$oid}, function() {
				alert("Todo successfully updated!");
				$state.go('todos', {}, {reload: true}); // on success go back to home i.e. todos state.
			});
		};
	}
]);