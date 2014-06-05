/**
 * Created by sascha on 27.05.14.
 */
var url = 'api.php';
var requested = false;

$('#db-btn-input').click(function() {

    var randomNumber = makeId();
    var keyCheck = sessionStorage.getItem('ghostGame');


    if(keyCheck == null || keyCheck == undefined) {
       sessionStorage.setItem('ghostGame', randomNumber);
    }

   var points = $('#points').text().split(" ");

    $.getJSON(url, {
        key: '123',
        email: $('#email').val(),
        name: $('#name').val(),
        sessionKey: sessionStorage.getItem('ghostGame'),
        score: points[0],
        format: "json"
    }).done(function( data ) {


        if(data.fail == undefined) {
           $('#input-data').fadeOut();
           fillHighscore(data);
        } else {
           $('#input-fail').children().remove();

           $.each(data, function(i, item) {
               if(data[i] != 'no' && data[i] != '1') {
                   $('#input-fail').append('<h3 style="color:red;">'+ data[i] + '</h3>');
               }
           });

        }

        $('.highscore-list').fadeIn();
    });
});

function requestHighscore() {

    if(requested == false) {
        $.getJSON(url, {
            read: '1'
        }).done(function(data) {
            console.log("data-fail" + data);
            console.log("data[0]" + data.fail);
            fillHighscore(data);
            $('.highscore-list').fadeIn();
        });
    }
    requested = true;
}

function fillHighscore(data) {
    $('#input-fail').children().remove();
    $('#table-data table').remove();
    $('#table-data').append('<table class="highscore-list">' +
                                    '<tr>' +
                                    '<th>Rank</th>' +
                                    '<th>Name</th>' +
                                    '<th>Score</th>' +
                                    '</tr></table>');
    $.each(data, function(i, item) {
        var rang = i+1;

        $('.highscore-list').append('' +
            '<tr>' +
            '<td>' + rang + '</td>' +
            '<td> ' + data[i].name +'</td>' +
            '<td>' + data[i].score + ' Points</td>' +
            '</tr>')
    });
}

function makeId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


