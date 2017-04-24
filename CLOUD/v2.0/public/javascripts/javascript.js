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
    if(hash != '') setActiveNav($(".nav a[href='" + hash + "'").parent());
});