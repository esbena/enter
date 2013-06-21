$(function() {
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
        if (e.keyCode === 13 || e.keyCode === 32) {
            newEntry();
            return false;
        }
        return true;
    });
    $('#answer').keydown(function(e) {
        var input = $('#answer');
        var number = $('#number');
        if (e.keyCode === 32 || e.keyCode === 13) {
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
            if (e.keyCode === 32) return false;
        }
        if (e.keyCode === 13) {
            $('#number input').val(1);
            newEntry();
            return false;
        }
        if (e.keyCode >= 48 && e.keyCode <= 57) return false;
        return true;
    });
});
