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


$(function () {
    var setActiveNav = function (li) {
        $(".nav").find(".active").removeClass("active");
        li.addClass("active");
    }

    $(".nav a").on("click", function () {
        setActiveNav($(this).parent());
    });
    $(".navbar-brand").on("click", function () {
        setActiveNav($(".nav > li").first());
    });

    var hash = window.location.hash;
    if (hash != ''){
        var anchor = $(".nav a[href='" + hash + "'");
        if(!!anchor.offset()) setActiveNav(anchor.parent());
    } 
});