/*jslint plusplus: false, bitwise: true, eqeq: true, unparam: true, white: false, browser: true, onevar: false */
/*global console: true, window: true, chrome: true, $: true, require: true, exports: true, process: true, alert: true*/
$(function() {
    var KEY_ENTER = 13;
    var KEY_SPACE = 32;
    function pretty_print_last_line(){
        // works for all lines. But we just select the most recent
        var lines = $("#out").val().split("\n");
        lines = lines.slice(lines.length - 1);
        var maxEntries = 0;
        var tableRows = $.map(
            lines,
            function(line){
                var lineEntriesString = line.trim().split(/ /g)[2].trim();
                console.log(lineEntriesString);
                var lineEntries = lineEntriesString.split(/\d+/g).slice(1); // skip the first empty entry
                console.log(lineEntries);
                maxEntries = Math.max(maxEntries, lineEntries.length);
                var tableRow = $("<tr></tr>");
                $.each(lineEntries,
                       function(i, entry){
                           var tableData = $("<td></td>").text(entry);
                           tableRow.append(tableData);
                       });
                return tableRow;
            }
        );
        var header = $("<thead/>");
        for(var entryNumber = 0; entryNumber < maxEntries; entryNumber++){
            header.append($("<td>" + (entryNumber + 1) + "</td>"));
        }
        var $table = $("<table/>");
        $table.append(header);
        $.each(tableRows, function(i, row){
            $table.append(row);
        });
        // insert
        $("#out-pretty").empty();
        $("#out-pretty").append("Pretty current line:");
        $("#out-pretty").append($table);
        $("#out-pretty tr:even").css("background-color", "#DDDDDD");
        $("#out-pretty tr:odd").css("background-color", "#BBBBBB");
        $("#out-pretty td:empty").css("background-color", "#FF0000");
    }
    $('#output').focus();
    var newEntry = function() {
        var out = $('#out');
        var user = $('#user');
        var id = $('#id');
        var userVal = user.val();
        var idVal = id.val();
        if (userVal === "") {
            user.focus();
            return;
        }
        if (idVal === "") {
            id.focus();
            return;
        }
        var prefix = ((out.val() === '') ? '' : out.val() + '\n');
        out.val(prefix + userVal + ' ' + idVal + ' ');
        user.val('');
        id.val('');
        $('#answer').focus().val('');
        $('#number').val(1);
    };
    $('#number').val(1);
    $("#user").add('#id').keydown(function(e) {
        if (e.keyCode === KEY_ENTER || e.keyCode === KEY_SPACE) {
            newEntry();
            return false;
        }
        return true;
    });
    $('#answer').keydown(function(e) {
        var input = $('#answer');
        var number = $('#number');
        if (e.keyCode === KEY_SPACE || e.keyCode === KEY_ENTER) {
            var out = $('#out');
            var inputVal = input.val();
            if (inputVal === '') {
                inputVal = '-';
            }
            out.val(out.val() + number.val() + inputVal);
            out.scrollTop(
                out[0].scrollHeight - out.height()
            );
            number.val(parseInt(number.val(), 10) + 1);
            input.val('');
            pretty_print_last_line();
            if (e.keyCode === KEY_SPACE) {
                return false;
            }
        }
        if (e.keyCode === KEY_ENTER) {
            $('#number input').val(1);
            newEntry();
            return false;
        }
        if (e.keyCode >= 48 && e.keyCode <= 57) { // number
            alert("You haven entered a number!");
            return false;
        }
        return true;
    });
    $("input").add("textarea").attr("tabindex", -1);
});
