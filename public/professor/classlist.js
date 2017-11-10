var ClassPage = require('./classpage');
var ModalWindow = require('../modalwindow');


var ClassList = function () {
    this._$element = $('.classlist');
    this.classes = [];
    this.updateClasses();
};


ClassList.prototype.updateClasses = function () {
    $.get('/professor/classes')
        .done(updateSuccess.bind(this))
        .fail(updateFail.bind(this));
};

ClassList.prototype.selectFirstClass = function () {
    if (this.classes.length !== 0)
        selectClass(this.classes[0]);
};

///////////////////////
// Private Functions //
///////////////////////

function buildList () {
    // Clear any old list items
    this._$element.empty();

    // Create the basic sidebar
    var $sidebar = $('<nav>', { class: "d-block bg-list sidebar" });

    // If there are no classes, show an informational message
    if (this.classes.length === 0) {
        var $message = $('<p>', { class: "sidebar-empty-message text-light" });
        $message.append($('<i>', { text: "Add classes to have them show up here."} ));
        $message.appendTo($sidebar);
    } else {
        // Create the container for the list items
        var $list = $('<ul>', { class: "nav nav-pills flex-column" });

        // Create a list tag for each class
        this.classes.forEach(function (course) {
            $('<li>', { class: 'nav-item classlist-item' })
                .append($('<a>', { id: course.cID, class: 'nav-link classlist-link text-truncate text-white', href: '#', text: course.cCode + ":\n" + course.cName }))
                .click(selectClass.bind(this, course))
                .appendTo($list);
        });

        // Add an empty, non-interactive empty element so that
        // we can scroll items above the add class button
        $('<li>', { class: 'nav-item classlist-item classlist-spacer'})
            .appendTo($list);
        
        // Append everything to the sidebar
        $list.appendTo($sidebar);
    }

    // Append the add class button

    var $button = $('<button>', { type: "button", text: "Add Class", class: "add-class-btn btn btn-danger justify-content-end" })
        .click(function () {
        var modal = new ModalWindow({id: "addClassModal", title: "Add Class"});
        var $cCodeInput = $('<input>', {type: 'text', name: 'cCode', id: 'cCode' })
        $('#addClassModal .modal-body')
            .append($('<p>', {text: 'Course Code:'}))
            .append($cCodeInput) 
            .append($('<p>', {text: 'Course Name:'}))
            .append($('<input>', {type: 'text', name: 'cName', id: 'cName' }));
        $('#addClassModal .modal-footer')
            .prepend($('<button>', { type: 'submit', class: 'btn btn-primary',  text: 'Submit', id: 'submitAddClasses' }))
                .click(function () {

                })

        modal.show();
        });


    // TODO Button on click
    // $button.onClick(function () {})

    $button.appendTo($sidebar);

    // Append the sidebar to the page
    $sidebar.appendTo(this._$element);
}

function selectClass (course) {
    $('.classlist-item').removeClass('classlist-item-selected');
    $('#' + course.cID).parent().addClass('classlist-item-selected');
    var classPage = new ClassPage(course);
    classPage.build();
}

function updateSuccess (data, textStatus, jqXHR) {
    this.classes = _.sortBy(data, 'cCode');
    buildList.call(this);
    this.selectFirstClass();
}

function updateFail (jqXHR, textStatus, errorThrown) {
    console.log("Error updating class list - " + textStatus + " - " + errorThrown);
    // Build the empty class list anyways, to display the empty
    // classlist message
    buildList.call(this);
}


module.exports = ClassList;