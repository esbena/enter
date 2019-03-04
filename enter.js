$(function() {
    var KEY_ENTER = 13;
    var KEY_SPACE = 32;

    /**
     * Plays a sound file. Invokes a callback afterwards.
     *
     * Will play the empty sound if sound is not forced by and it is
     * disabled by the user.
     */
    function playSound(sound, callback, forceUseSound){
        if(forceUseSound || $("#sound").is(":checked")){
            sound = sound || sounds.error;
        }else{
            sound = sounds.none;
        }
        if(callback){
            function handler(){
                sound.removeEventListener("ended", handler);
                callback();
            }
            sound.addEventListener("ended", handler)
        }
        sound.play();
    }

    /**
     * Pretty prints the state in tabular form.
     */
    function prettyPrint(){
        // TODO improve structure here
        try{
            // show the most recent answers first
            var lines = $("#out").val().split("\n").reverse();
            var maxAnswers = 0;
            var tableRows = $.map(
                lines,
                function(line){
                    var components = line.trim().split(/ /g);
                    var studentId = components[0];
                    var setId = components[1];
                    var answers = components[2];
                    var answersArray = answers? answers.trim().split(/\d+/g).slice(1): [];
                    maxAnswers = Math.max(maxAnswers, answersArray.length);

                    var lineEntries = [studentId, setId, $("<button>Playback</button>").click(
                        function(){
                            var toPlay = answersArray;
                            playAnswers(toPlay);
                        }
                    )];
                    lineEntries = lineEntries.concat(answersArray);
                    var tableRow = $("<tr></tr>");
                    $.each(lineEntries,
                           function(i, entry){
                               var tableData = $("<td></td>").append(entry);
                               tableRow.append(tableData);
                           });
                    return tableRow;
                }
            );
            var header = $("<thead/>");

            header.append($("<td>Student ID</td>"));
            header.append($("<td>Set ID</td>"));
            header.append($("<td>Sound</td>"));
            for(var entryNumber = 0; entryNumber < maxAnswers; entryNumber++){
                header.append($("<td>" + (entryNumber + 1) + "</td>"));
            }


            var $table = $("<table/>");
            $table.append(header);
            $.each(tableRows, function(i, row){
                $table.append(row);
            });
            // insert
            $("#out-pretty").empty();
            $("#out-pretty").append($table);
            $("#out-pretty tr:even").css("background-color", "#DDDDDD");
            $("#out-pretty tr:odd").css("background-color", "#BBBBBB");
            $("#out-pretty td:empty").css("background-color", "#FF0000");
        }catch(e){
            console.error("Could not pretty print state, illegal content in state.");
            console.error(e.stack);
        }
    }


    /**
     * Creates a new entry in the state area, depending on the current
     * values of student id and set id.
     */
    var newEntry = function() {
        var out = $('#out');
        var student = $('#student');
        var id = $('#id');
        var studentVal = student.val();
        var idVal = id.val();
        if (studentVal === "") {
            student.focus();
            return;
        }
        if (idVal === "") {
            id.focus();
            return;
        }
        var prefix = ((out.val() === '') ? '' : out.val() + '\n');
        out.val(prefix + studentVal + ' ' + idVal + ' ');
        out.change();
        student.val('');
        id.val('');
        $('#answer').focus().val('');
        $('#number').val(1);
        playSound(sounds.next_set);
    };

    /**
     * Callback for when the user does a keypress in the answer input area:
     * - space: next question
     * - enter: next set
     * - number: error (ignored)
     * - char: appended to the other answers to the question
     */
    var answerInputKeyPress = function(e) {
        var input = $('#answer');
        var number = $('#number');
        if (e.keyCode === KEY_SPACE || e.keyCode === KEY_ENTER) {
            var out = $('#out');
            var inputVal = input.val();
            if (inputVal === '') {
                inputVal = '-';
            }
            out.val(out.val() + number.val() + inputVal);
            prettyPrint();
            out.scrollTop(
                out[0].scrollHeight - out.height()
            );
            var numberValue = parseInt(number.val(), 10) + 1;
            number.val(numberValue);
            if(numberValue in sounds){
                playSound(sounds[numberValue]);
            }

            input.val('');
            if (e.keyCode === KEY_SPACE) {
                playSound(sounds.next_question);
                e.preventDefault();
                return;
            }
        }
        if (e.keyCode === KEY_ENTER) {
            $('#number input').val(1);
            newEntry();
            e.preventDefault();
            return;
        }
        if (e.keyCode >= 48 && e.keyCode <= 57) { // number
            playSound(sounds.error);
            alert("You have entered a number!");
            e.preventDefault();
            return;
        }
        
        var answer = String.fromCharCode(e.keyCode).toLowerCase();
        if(answer in sounds){
            playSound(sounds[answer]);
        }else{
            playSound(sounds.no_letter);
        }
    };
    /**
     * enter/space event hook for creating a new entry in the state.
     */
    var studentInputKeyPress = function(e) {
        if (e.keyCode === KEY_ENTER || e.keyCode === KEY_SPACE) {
            newEntry();
            e.preventDefault();
            return;
        };
    };

    /**
     * Plays the sounds for an array of answer strings.
     */
    function playAnswers(answersArray){
        function playAnswer(answerArray, callback){
            if(answerArray.length === 0){
                playSound(sounds.next_question, callback, true);
                return;
            }
            var head = answerArray[0];
            var tail = answerArray.slice(1);
            var sound = sounds[head] || sounds.no_letter;
            playSound(sound, 
                      function(){
                          playAnswer(tail, callback);
                      }, 
                      true
                     );
        }
        if(answersArray.length === 0){
            playSound(sounds.next_set, undefined, true);
            return;
        }
        var head = answersArray[0];
        var tail = answersArray.slice(1);
        var answerArray = head.split("").sort();
        playAnswer(answerArray, function(){playAnswers(tail);});
    }

    $('#number').val(1);
    $("#student").add('#id').keydown(studentInputKeyPress);
    $('#answer').keydown(answerInputKeyPress);
    $("input").add("textarea").attr("tabindex", -1);
    $('#out').on("change keyup", prettyPrint);

    var sounds = {};
    $.each("a b c d e f g h".split(' '), 
           function(i, v){
               var file = 'letter-'+ v +'.mp3';
               sounds[v] = new Audio(file);
           }
          );

    for(var i = 10; i <= 100; i+=10){
        var file = 'number-'+ i +'.mp3';
        sounds[i] = new Audio(file);
    }

    sounds.next_question = new Audio('beep.mp3');
    sounds.next_set = new Audio('wubup.mp3');
    sounds.no_letter = new Audio('blunk.mp3');
    sounds.no_answers = new Audio('buzz.mp3');
    sounds.error = new Audio('long-buzz.mp3');
    sounds.none = new Audio('none.mp3');

});
