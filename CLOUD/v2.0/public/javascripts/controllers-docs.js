/*
   Copyright 2017 Anders Riise Mæhlum

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/


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

					if (stickyTop + 1 < windowTop + stickOffset) {
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

			// Add class 'last' to last leaf of trees
			var trees = $(".tree");
			trees.each(function (index) {
				var element = trees[index];
				var lists = [element];
				for (var i = 0; i < element.getElementsByTagName("ul").length; i++)
					lists[lists.length] = element.getElementsByTagName("ul")[i];

				for (var i = 0; i < lists.length; i++) {
					var item = lists[i].lastChild;

					while (!item.tagName || item.tagName.toLowerCase() != "li")
						item = item.previousSibling;

					item.className += " last";
				}
			}, this);


		}
		onLoad();

		// Code template styling
		var addLines = function () {
			var templates = $(".code-template");
			templates.each(function () {
				var divs = $(this).children("div");
				$.each(divs, function (i) {
					var add = "<div class=\"code-template-line-number\"><span>" + (i+1) + "</span></div>";
					$(divs[i]).html(add + $(divs[i]).html());
					if(i==8) console.log(divs[i])
					// console.log($(divs[i]).html());
				});
			});
		}
		addLines();

		var colorKeyWords = function () {
			var tempDiv = $(".code-template");
			var aBlue = ['var', 'if', 'else', 'new', 'this', 'function'];
			tempDiv.each(function () {
				var array = $(this).html().split(' ');

				$.each(array, function (i) {
					if ($.inArray(array[i], aBlue) >= 0) {
						array[i] = '<span class="code-word">' + array[i] + '</span>';
					}
				});

				$(this).html(array.join(' '));
			});
		}
		colorKeyWords();

		var colorInts = function () {
			var tempDiv = $(".code-template");
			tempDiv.each(function () {
				var array = $(this).html().split('');
				var active = false;
				$.each(array, function (i) {
					if ($.isNumeric(array[i]) && !active) {
						array[i] = '<span class="code-numeric">' + array[i];
						active = true;
					}
					else if ((!($.isNumeric(array[i]))) && active) {
						active = false;
						array[i - 1] = array[i - 1] + '</span>';
					}
				});

				$(this).html(array.join(''));
			});
		}
		colorInts();

		var colorString = function () {
			var tempDiv = $(".code-template");
			tempDiv.each(function () {
				var array = $(this).html().split('');
				active = false;
				$.each(array, function (i) {
					if (array[i] === "'" && !active) {
						active = true;
						array[i] = '<span class="code-string">' + array[i];
					} else if (array[i] === "'" && active) {
						active = false;
						array[i] = array[i] + '</span>';
					}
				});

				$(this).html(array.join(''));
			});
		}
		colorString();

		var colorComment = function () {
			var tempDiv = $(".code-template");
			tempDiv.each(function () {
				var array = $(this).html().split('');
				var sLast = 0, eLast = 0, active = false;
				$.each(array, function (i) {
					if (array[i] === '/') sLast = i;
					if (array[i] === '*' && sLast === i - 1) {
						array[i - 1] = '<span class="code-comment">' + array[i - 1];
						active = true;
					}

					if (array[i] === '*' && sLast !== i - 1) eLast = i;
					if (array[i] === '/' && eLast === i - 1 && active) {
						active = false;
						array[i] = array[i] + '</span>';
					}
				});

				$(this).html(array.join(''));
			});
		}
		colorComment();
	}]);