var ModalWindow = require('../modalwindow'),
    regex       = require('../lib/regex');

var CourseManager = function () {};

CourseManager.prototype.createCourse = function () {
    var modal         = new ModalWindow({id: "addClassModal", title: "Add Class"}),
        $cCodeInput   = $('<input>', { type: 'text', name: 'cCode', id: 'cCode' }),
        $cNameInput   = $('<input>', { type: 'text', name: 'cName', id: 'cName' }),
        $submitButton = $('<button>', { type: 'submit', class: 'btn btn-primary',  text: 'Submit', id: 'submitAddClasses' });

    modal.$body
        .append($('<p>', {text: 'Course Code:'}))
        .append($cCodeInput)
        .append($('<p>', {text: 'Course Name:'}))
        .append($cNameInput);
    modal.$footer
        .prepend($submitButton);
    $submitButton
        .click(function () {
            $submitButton.remove();
            modal.$body.empty();
            modal.$body
                .spin()
                .addClass('spin-min-height');

            $.post({
                url: '/professor/class/add',
                data: { code: $cCodeInput.val(), name: $cNameInput.val() },
                dataType: 'json'
            }).done(function(data, status, xhr) {
                modal.success("Success", $cCodeInput.val() + ' successfully added!');
                window.app.classList.updateClasses();
            }).fail(function(xhr, status, errorThrown) {
                modal.error("Error", xhr.responseText);
            }).always(function(a, status, b) {
                modal.$body.spin(false);
            });
        });
    modal.show();
};

CourseManager.prototype.deleteCourse = function (course, sessions) {
    this.modal = new ModalWindow({ title: 'Delete Course'});
    
    this.$deleteButton = $('<button>', { type: 'submit', class: 'btn btn-danger',  text: 'Delete', id: 'deleteButton' })
        .click(removeCourse.bind(this, course, sessions));

    this.modal.$body
        .append($('<p>', { text: 'Are you sure you want to delete ' + course.cCode + '?' }))
        .append($('<div>', { class: 'alert alert-warning' })
            .append($('<strong>', { text: 'Warning: ' }))
            .append($('<p>', { text: 'Deleting a course removes all associated session and enrollment information!'})));
    
    this.modal.$footer
        .prepend(this.$deleteButton);
};

function removeCourse (course, sessions) {
    this.$deleteButton.remove();
    this.modal.$body.empty();
    this.modal.$body
        .spin()
        .addClass('spin-min-height');

    $.ajax({
        url: '/professor/class/' + course.cID,
        method: 'DELETE'
    })
    .done(function (data, status, xhr) {
        this.modal.success('Success', course.cCode + ' successfully deleted!');
        window.app.classList.updateClasses();
    }.bind(this))
    .fail(function (xhr, status, errorThrown) {
        this.modal.error('Error', xhr.responseText);
    }.bind(this))
    .always(function(a, status, b) {
        this.modal.$body.spin(false);
    }.bind(this));
}

module.exports = CourseManager;