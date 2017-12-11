/**
 * Generic implementation for fixed size, scrollable tables
 * @param {string[]=} classList 
 * @param {Number} height
 * @param {Number} width
 * @param {*[]} columns Should be an array of string-number pairs, with the string specifying 
 * the text of the column header and the number denoting its fixed width in pixels
 * @param {*} $appendTarget
 */
var Table = function (classList, height, width, columns, $appendTarget) {    
    // Format class attribute
    var classes = 'qtable table-bordered table-sm table-hover ';
    if (classList && classList.length > 0) {
        classList.forEach(function (element) {
            classes += element + ' ';
        });
    }
    
    // Store references
    this.$element = $('<div>', { class: 'table-container' });
    this.columns = columns;

    // Set table as two separate tables to allow for fixed headers while scrolling
    this.$table1 = $('<table>', { 
        class: classes + 'qtable1', 
        width: width
    }).appendTo(this.$element);
    this.$table2 = $('<table>', { 
        class: classes + 'qtable2', 
        width: width   
    }).appendTo(this.$element);

    // Add headers
    var $tr = $('<tr>');
    this.columns.forEach(function (column) {
        $tr.append($('<th>', {
            text: column[0], 
            style: formatColumnWidth(column[1]) 
        }));
    });
    this.$thead = $('<thead>')
        .append($tr)
        .appendTo(this.$table1);

    // Basic body structure    
    this.$spinDiv = $('<div>', { class: 'spin-div' });
    this.$tbody = $('<tbody>', { height: height - 36.5  })
        .append($('<tr>')
            .append($('<td>', { colspan: this.columns.length })
                .append($(this.$spinDiv))))
        .appendTo(this.$table2);

    // Append to DOM early
    $appendTarget.append(this.$element);

    this.$spinDiv.spin();
    this.$element.show();
};

/**
 * Fills the table based on the nested data object.
 * 
 * Each element of data should be an array that represents a row, with each row element
 * being the value of that column. If the value is a jquery object it will be inserted 
 * directly, otherwise it will be converted into a basic <td> as a string
 * @param {*[][]} data 
 */
Table.prototype.fill = function (data) {
    // Clear body and spinner
    this.$tbody.empty();
    
    data.forEach(function (row) { 
        var $tr = $('<tr>');
        for (var i = 0; i < row.length; i++) {
            if (row[i] instanceof $) {
                $tr.append(row[i]
                    .css('min-width', this.columns[i][1])
                    .css('max-width', this.columns[i][1]));
            } else {
                $tr.append($('<td>', { 
                    text: row[i], 
                    style: formatColumnWidth(this.columns[i][1]) 
                }));
            }
        };
        this.$tbody.append($tr);
    }.bind(this));
};

Table.prototype.error = function (message) {
    this.$table1.addClass('table-danger');
    this.$table2.addClass('table-danger');
    this.$tbody
        .empty()
        .append($('<p>', { class: 'text-danger', text: message }));
};

function formatColumnWidth(width) {
    return 'max-width: ' + width + 'px; min-width: ' + width + 'px;'
}

module.exports = Table;