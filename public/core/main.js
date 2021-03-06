var NavBar      = require('../components/navbar'),
    ClassList   = require('../professor/classlist'),
    ClassPage   = require('../professor/classpage'),
    CheckIn     = require('../student/checkin')
    CI          = require('./ci');

SITE_NAME = "Q-Class";

var SignInApp = function () {};

/**
 * Build some common DOM items, then determine if we should
 * build the professor site or student sign in site
 */
SignInApp.prototype.init = function () {
    document.title = SITE_NAME;
    initToastNotifications();

    this.navbar = new NavBar();
    this.getUserInfo();
};

/**
 * Check if this is netID belongs to a prof
 */
SignInApp.prototype.getUserInfo = function () {
    ci.ajax({
        method: 'GET',
        url: '/user-info',
        done: function (data) { data.isProf ? this.buildProfDOM() : this.buildStudentDOM(); }.bind(this),
        fail: this.signOut
    });
};

/**
 * Build the professor DOM
 */
SignInApp.prototype.buildProfDOM = function () {
    var $container = $('.main-container');
    $container.empty();

    // Build the required div structure
    $('<div>', { class: "classlist" }).appendTo($container);
    $('<div>', { class: "classpage" }).appendTo($container);

    this.navbar.buildProfNavbar();

    this.classList = new ClassList();
    this.classPage = new ClassPage();
};

/**
 * Build the student DOM
 */
SignInApp.prototype.buildStudentDOM = function () {
    var $container = $('.main-container');
    $container.empty();

    this.navbar.buildStudentNavbar();
    this.studentCheckin = new CheckIn($container);
};

/**
 * Sign-out
 */
SignInApp.prototype.signOut = function () {
    window.location.href = "/logout";
};

function initToastNotifications () {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
}

// When the page is loaded, create our main ui object
$(function () {
    window.ci  = new CI();
    window.app = new SignInApp();
    window.app.init();
});

module.exports = SignInApp;
