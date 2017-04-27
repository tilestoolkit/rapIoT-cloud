/* Controllers docs */
angular.module('tilesDocs.controllers', [])

	.controller('DocsCtrl', ['$scope', function ($scope) {
		$scope.toggleWrapper = function () {
			var wrapper = $(".wrapper").first();
			if (wrapper.hasClass("toggled")) {
				wrapper.removeClass("toggled");
			} else {
				wrapper.addClass("toggled");
			}
		}
		$scope.squarePrimitivesUrl = "#/docs-main5";
		$scope.selectDevEnvUrl = "#/docs-main4";
		$scope.tilestoolkitUrl = "http://tilestoolkit.io";

		$scope.getStartedUrl = "#/docs-main1";
		$scope.devProcessUrl = "#/docs-app0";
		$scope.extProcessUrl = "#/docs-ext0";
		$scope.JSdevUrl = "#/docs-js1";
		$scope.REdevUrl = "#/docs-re1";

		// Get navigation urls
		$scope.prevUrl = function () {
			var retVal = null;

			var anchors = $(".sidebar-nav > li > a");
			var lis = anchors.parent();
			lis.each(function (index) {
				if ($(this).hasClass("active") && index - 1 >= 0) {
					retVal = $(lis[index - 1]).find("a").attr("href");
					return retVal;
				}
			});
			return retVal;
		}
		$scope.nextUrl = function () {
			var retVal = null;

			var anchors = $(".sidebar-nav > li > a");
			var lis = anchors.parent();
			lis.each(function (index) {
				if ($(this).hasClass("active") && index + 1 < lis.length) {
					retVal = $(lis[index + 1]).find("a").attr("href");
					return retVal;
				}
			});
			return retVal;
		}

		// On Load
		var onLoad = function () {
			// Make sidebar sticky
			var $sticky = $('#sidebar-wrapper');
			if (!!$sticky.offset()) { // make sure ".sticky" element exists
				var stickyTop = $sticky.offset().top;
				var stickOffset = 0;

				$(window).scroll(function () { // scroll event
					var windowTop = $(window).scrollTop(); // returns number

					if (stickyTop < windowTop + stickOffset) {
						$sticky.css({ position: 'fixed', top: stickOffset });
					} else {
						$sticky.css({ position: 'absolute', top: 'initial' });
					}
				});
			}

			// scroll to top on anchor click
			$("a").click(function () {
				window.scrollTo(0, 0);
			});
		}
		onLoad();
	}]);