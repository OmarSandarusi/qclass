var SessionManager = require('./sessions'),
    AdminManager   = require('./adminManager'),
    Table          = require('../components/table'),
    SessionTable   = require('./sessionTable'),
    StudentTable   = require('./studentTable'),
    Exporter       = require('./exporter'),
    Importer       = require('./importer'),
    Editable       = require('../components/editable'),
    Duration       = require('../components/duration'),
    TableUpdater   = require('./tableUpdater');

var durationOptions = [ 
    new Duration('30 sec', 30000), 
    new Duration('45 sec', 45000), 
    new Duration('1 min', 60000),
    new Duration('1.5 min', 90000), 
    new Duration('2 min', 120000),
    new Duration('3 min', 180000), 
    new Duration('5 min', 300000), 
    new Duration('10 min', 600000), 
    new Duration('30 min', 1800000), 
    new Duration('1 hour', 3600000), 
    new Duration('3 hours', 10800000)
];

/**
 * Creates a class page, responsible for the central window of the professor site
*/
var ClassPage = function() {
    this.$element = $('.classpage');
    this.exporter = new Exporter();
    this.importer = new Importer();
    this.sessions = new SessionManager();
    this.adminManager = new AdminManager();
};

/**
 * Display's a course page given the course object
 * @param {Object} course The selected course the page should use to construct itself 
 * @param {string} course.cID
 * @param {string} course.cName
 * @param {string} course.cCode
 */
ClassPage.prototype.displayCourse = function (course) {
    this.course = course;

    // Clear the old page and build the new one
    this.$element.empty();
    build.call(this);
};

ClassPage.prototype.refreshTables = function () {
    this.tableUpdater.updateTables();
};

///////////////////////
// Private Functions //
///////////////////////

/**
 * Builds the classpage, adds it to the DOM
 */
function build () {
    var $topDiv      = $('<div>', { class: 'class-top-div' }),
        $titleDiv    = $('<div>', { class: 'class-title-div' }),
        $nameDiv     = $('<div>'),
        $codeDiv     = $('<div>'),
        $editDiv     = $('<div>', { class: 'class-edit-div' }),
        $titleCode   = $('<h2>', { class: 'class-title-code title-field', text: this.course.cCode }),
        $titleName   = $('<h3>', { class: 'class-title-name title-field', text: this.course.cName }),
        $attDiv      = $('<div>', { class: 'class-attendance-div' }),
        $attDivLeft  = $('<div>', { class: 'class-attendance-div-left'}),
        $attDivRight = $('<div>', { class: 'class-attendance-div-right'}),
        $startButton = $('<button>', { class: 'btn btn-danger btn-circle btn-xl', text: 'Start' }),
        $tableRow    = $('<div>', { class: 'class-content row' }),
        $tableCol1   = $('<div>', { class: 'class-table-column-div col' }),
        $tableCol2   = $('<div>', { class: 'class-table-column-div col' }),
        $sessionDiv  = $('<div>', { class: 'table-div' }),
        $studentDiv  = $('<div>', { class: 'table-div' });

    this.$element
        .append($topDiv
            .append($titleDiv
                .append($codeDiv
                    .append($titleCode))
                .append($nameDiv)
                    .append($titleName))
            .append($editDiv))
        .append($attDiv
            .append($attDivLeft
                .append($startButton))
            .append($attDivRight))
        .append($tableRow
            .append($tableCol1
                .append($sessionDiv))
            .append($tableCol2
                .append($studentDiv)));

    // Wrap the title and course code in divs so that Editable can append an edit icon in-line on hover
    this.titleName = new Editable($titleName, this.course.cID, 'name', '/professor/class/editName/' + this.course.cID);
    this.titleCode = new Editable($titleCode, this.course.cID, 'code', '/professor/class/editCode/' + this.course.cID);

    // Add the edit button if owner
    if (this.course.isOwner) {
        $('<button>', { text: 'Edit Administrators', class: 'btn btn-danger btn-square btn-xl' })
            .click(editAdministrators.bind(this))
            .appendTo($editDiv);
    }

    // Attendance section
    $('<label>', { text: 'Start an attendance session:', class: 'class-attendance-label' })
        .prependTo($attDiv);

    // Duration selection
    $('<label>', { text: 'Check-in duration:', class: 'class-duration-label' })
        .appendTo($attDivRight);
    this.$duration = getDurationSelect(this.course.cID)
        .appendTo($attDivRight);

    // Bind duration to start button press
    $startButton.click(function () { 
        this.sessions.startSession(this.course, this.$duration.val()); 
    }.bind(this));

    // The session table and export button
    this.sessionTable = new SessionTable(this.course, $sessionDiv);

    $('<button>', { class: 'class-export-button btn btn-danger btn-square btn-xl', text: 'Export Attendance' })
        .click(this.exporter.createExportModal.bind(this, this.course))
        .appendTo($sessionDiv);

    // The student table and associated buttons
    this.studentTable = new StudentTable(this.course, $studentDiv);

    $('<button>', { text: 'Import Classlist', class: 'class-import-button btn btn-danger btn-square btn-xl' })
        .click(this.importer.createImportModal.bind(this, this.course))
        .appendTo($studentDiv);

    $('<button>', { text: 'Add Student', class: 'class-addstudent-button btn btn-danger btn-square btn-xl' })
        .click(this.importer.createAddStudentModal.bind(this, this.course))
        .appendTo($studentDiv);

    // Initialize the tableUpdater and fill the tables
    this.tableUpdater = new TableUpdater(this.course.cID, this.sessionTable, this.studentTable);
    this.tableUpdater.updateTables();
}

function editAdministrators() {
    this.adminManager.buildAndShowModal(this.course);
}

/**
 * Constructs and returns the jQuery object for the duration drop-down
 * using the pre-defined durationOptions array
 */
function getDurationSelect(classID) {
    var $select = $('<select>', { class: 'class-duration-select' }),
        prevChoiceCookie = Cookies.get('last-duration-' + classID),
        prevChoice = null;

    // Parse the previously selected value
    if (prevChoiceCookie) {
        prevChoice = Number.parseInt(prevChoiceCookie);
        if (isNaN(prevChoice)) {
            prevChoice = null;        
        }
    }

    durationOptions.forEach(function (duration) {
        var $option = $('<option>', { 
            text: duration.text, 
            value: duration.milliseconds 
        });

        if (prevChoice && prevChoice === duration.milliseconds)
            $option.prop('selected', true);
        
        $select.append($option);
    });

    return $select;
}

module.exports = ClassPage;