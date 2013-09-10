'use strict';
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
	return {
		link: function(scope, elem, attrs) {
			var checkWhenEnabled, handler, scrollDistance, scrollEnabled, raw = elem[0],
			$window = angular.element($window);
			scrollDistance = 0;
			if (attrs.infiniteScrollDistance !== null) {
				scope.$watch(attrs.infiniteScrollDistance, function(value) {
					scrollDistance = parseInt(value, 10);
					return scrollDistance;
				});
			}
			scrollEnabled = true;
			checkWhenEnabled = false;
			if (attrs.infiniteScrollDisabled !== null) {
				scope.$watch(attrs.infiniteScrollDisabled, function(value) {
					scrollEnabled = !value;
					if (scrollEnabled && checkWhenEnabled) {
						checkWhenEnabled = false;
						return handler();
					}
				});
			}
			handler = function() {

				var elementBottom = raw.scrollTop + raw.offsetHeight, windowBottom = raw.scrollHeight, remaining = windowBottom-elementBottom, shouldScroll = remaining <= scrollDistance;

				if (shouldScroll && scrollEnabled) {
					if ($rootScope.$$phase) {
						return scope.$eval(attrs.infiniteScroll);
					} else {
						return scope.$apply(attrs.infiniteScroll);
					}
				} else if (shouldScroll) {
					checkWhenEnabled = true;
					return checkWhenEnabled;
				}
			};
			elem.on('scroll', handler);
			scope.$on('$destroy', function() {
				return elem.off('scroll', handler);
			});
			return $timeout(function() {
				if (attrs.infiniteScrollImmediateCheck) {
					if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
						return handler();
					}
				} else {
					return handler();
				}
			}, 0);
		}
	};
}
]);
