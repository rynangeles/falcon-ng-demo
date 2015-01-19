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
			var todoIndex = $scope.todos.indexOf(todo);
			if (todoIndex !== -1){
				todo.$delete({id:todo._id.$oid}, function(){
					$scope.todos.splice(todoIndex, 1);
					$state.go('todos'); // on success go back to home i.e. todos state.
					alert("Todo successfully deleted!");
				});
			}
		};
	}
]).
controller('TodoViewController', ['$scope', '$state', '$stateParams', 'TodoService', 
	function ($scope, $state, $stateParams, TodoService) {
		/*
		$scope.todo = TodoService.get({ id: $stateParams.id }); // get a single todo. Issues a GET to /api/todos/:id
		*/
		$scope.todo = {};
		$scope.todos.$promise.then(function (todos){
			var todo = todos.filter(function(todo){ return todo._id.$oid === $stateParams.id; });
			if (todo.length > 0){
				$scope.todo = todo[0];
			}else{
				$state.go('todos');
			}
		});
		$scope.deleteTodo = function(todo){
			/*
			todo.$delete({id:todo._id.$oid}, function(){
				$state.go('todos', {}, {reload: true}); // on success go back to home i.e. todos state.
				alert("Todo successfully deleted!");
			});
			*/
			var todoIndex = $scope.todos.indexOf(todo);
			if (todoIndex !== -1){
				todo.$delete({id:todo._id.$oid}, function(){
					$scope.todos.splice(todoIndex, 1);
					$state.go('todos'); // on success go back to home i.e. todos state.
					alert("Todo successfully deleted!");
				});
			}else{
				$state.go('todos');
			}
		}
	}
]).
controller('TodoCreateController', ['$scope', '$stateParams', '$state', 'TodoService', 
	function ($scope, $stateParams, $state, TodoService) {
		$scope.todo = new TodoService();  //create new todo instance. Properties will be set via ng-model on UI
		$scope.addTodo = function (){
			$scope.todo.$save(function(todo) {
				$scope.todo._id = todo._id;
				$scope.todos.push($scope.todo);
				alert("Todo successfully created!");
				$state.go('todos'); // on success go back to home i.e. todos state.
			});
		};
	}
]).
controller('TodoEditController', ['$scope', '$stateParams', '$state', 'TodoService', 
	function ($scope, $stateParams, $state, TodoService) {
		$scope.todo = {}
		/*
		TodoService.get({ id: $stateParams.id }).$promise.then(function(todo){
			$scope.todo = todo;
			$scope.todo.targetDate = new Date(todo.targetDate);
		}); // get a single todo. Issues a GET to /api/todos/:id
		*/
		$scope.todos.$promise.then(function (todos){
			var todo = todos.filter(function(todo){ return todo._id.$oid === $stateParams.id; });
			if (todo.length > 0){
				$scope.todo = todo[0];
				$scope.todo.targetDate = new Date($scope.todo.targetDate);
			}else{
				$state.go('todos');
			}
		});
		$scope.updateTodo = function (){
			$scope.todo.$update({id:$scope.todo._id.$oid}, function() {
				alert("Todo successfully updated!");
				$state.go('todos'); // on success go back to home i.e. todos state.
			});
		};
	}
]);