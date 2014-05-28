<?php
/*
$sql = "CREATE TABLE ghostgame
(
PID INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(PID),
email CHAR(255),
score CHAR(255),
created TIMESTAMP,
sessionKey char(255)
)";

 */

$key = '123';  // "registration key"
$dataBaseName = 'ghostgame';
$dataBase = 'ghost-game';
$dataBaseHost = 'localhost';
$dataBaseUser = '';
$dataBasePassword = '';

$connection = mysql_connect($dataBaseHost,$dataBaseUser,$dataBasePassword)or die("connection fail");

mysql_select_db($dataBase)or die("Database fail");

function failMessage($failMessage) {

   echo json_encode($failMessage);
    exit;
}

function checkGETData($userEmail, $userScore, $userName, $key) {

    $failMessage = array(
                            'fail'      => 'no',
                            'key'       => 'no',
                            'userEmail' => 'no',
                            'score'     => 'no',
                            'userName'  => 'no'
    );

    if($_GET['key'] != $key) {
        $failMessage['key'] = "Der Key ist falsch";
    }

    if(!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        $failMessage['userEmail'] = "Die angegebene Email ist falsch";
    }

    if($userScore !== '' && !is_numeric($userScore)) {
        $failMessage['score'] = 'Score Fehler';
    }

    if($userName == '') {
        $failMessage['userName'] = "Es ist kein Name angegeben";
    }

    foreach($failMessage as $index => $value)
    {

        if($value != 'no') {

            $failMessage['fail'] = "1";
            failMessage($failMessage);
        }

    }

}

function insertData($userEmail, $userScore, $userName, $sessionKey, $dataBaseName) {

    $result = mysql_query("SELECT * FROM " . $dataBaseName . " WHERE email ='".$userEmail."' ");
    $resultAssoc = mysql_fetch_assoc($result);



    if(mysql_num_rows($result) == 0 ) {

        $sql = "INSERT INTO " . $dataBaseName . " (name, email, score, sessionKey) VALUES ('" . $userName . "',
                                                                        '". $userEmail. "',
                                                                       '". $userScore. "',
                                                                       '". $sessionKey. "'
                                                                       ) ";
        mysql_query($sql);

    }
    elseif(mysql_num_rows($result) != 0 && $resultAssoc['sessionKey'] == $sessionKey) {

        $sql = "SELECT score, name FROM " . $dataBaseName . " WHERE email = '" . $userEmail . "' ";
        $result = mysql_query($sql);
        $row = mysql_fetch_row($result);

        if($row[0] < $userScore ) {
            $sql = "UPDATE " . $dataBaseName . " SET score ='" . $userScore . "' WHERE email ='" . $userEmail . "' ";
            mysql_query($sql);

        } else {

            $failMessage = array(   'fail'      => '1',
                                    'better' => "You were better than now");

            failMessage($failMessage);
        }


    }
    else {

        $failMessage = array(   'fail'      => '1',
                                'userEmail' => "Email Adresse ist schon vorhanden");

        failMessage($failMessage);
    }

}

function sendHighscoreList($dataBaseName) {

    $result = mysql_query("SELECT name, score, created FROM " . $dataBaseName . " ORDER BY score DESC LIMIT 0, 10");

    $highscoreList = array();

    while($scoreList = mysql_fetch_array($result, MYSQL_ASSOC)) {

        $dataBaseList = array( 'fail'   => '0',
                               'name'    => $scoreList['name'],
                               'score'   => $scoreList['score'],
                               'created' => $scoreList['created']
        );
        $highscoreList[] = $dataBaseList;

    }

    echo json_encode($highscoreList);
}



if(isset($_GET['key']) && is_numeric($_GET['key']) ) {

    $userEmail = $_GET['email'];
    $userScore = $_GET['score'];
    $userName = $_GET['name'];
    $sessionKey = $_GET['sessionKey'];



    checkGETData($userEmail, $userScore, $userName, $key);
    insertData($userEmail, $userScore, $userName, $sessionKey, $dataBaseName);
    sendHighscoreList($dataBaseName);

}

if(isset($_GET['read']) && $_GET['read'] == 1 ) {
    sendHighscoreList($dataBaseName);
}

