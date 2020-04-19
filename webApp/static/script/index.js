const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');
// Role:    On click of skip button, fetching Random Words and Displaying it above the Text Box Without Reloading the Page.
// Author:  Rangan Roy (roy.rangan7@gmail.com).
var counter = 0;
var score = 0;
var nscore = 0;
var canvas ;
var ctx;
var user = '';
var avro = OmicronLab.Avro.Phonetic;
var fbresponse ;
var max_c = 5;

function isFacebookApp() {
    var ua = navigator.userAgent || navigator.vendor || window.opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
}

function initFBshare(){
    
    base_image = new Image();
    
    FB.api('/me', function(response) {
        ctx.clearRect(0, 0, 500, 280);
        user = response.id;
        base_image.onload = function(){
            bg = new Image();
            bg.onload = function(){
                ctx.drawImage(bg,0,0);
                ctx.drawImage(base_image, 42, 66,160,154);
                ctx.font = "24px Arial";
                ctx.fillStyle = '#000';
                ctx.fillText(response.name, 42, 40);
                ctx.save()
                ctx.fillStyle = '#f11';
                ctx.fillText($("#score-area").text(),313,175);
                // ctx.rotate(-0.05*Math.PI);
                var dataURL = canvas.toDataURL('image/jpeg');
                //console.log(dataURL);
                user = user + Math.random().toString(36).slice(2);
                $.ajax({
                    type: "POST", 
                    url: "put_im", 
                    data: { img: dataURL, uid: user }  
                }).done(function(msg){ 
                    
                });
            }
            bg.src = "static/img/template.png";
            
        }
        base_image.crossOrigin = "anonymous";
        base_image.src = "https://graph.facebook.com/" + response.id + "/picture?type=large";
        //console.log('Good to see you, ' + response.name + '.');
    });
    
}

function fetchRandomWords(){
$.ajax({
        type : "GET",
        url : '/fetchRandomWord',
        success: function (data) {
            document.getElementById("bn_text").innerHTML = data;
            document.getElementById("en_text").value = null;
        }
        });
    };
            
// Role:       Fetching Users Contribution and Total Number of Words contributed by all the users.
// Updated By: Rangan Roy (roy.rangan7@gmail.com).
function fetchContributionAndProgress(){
    $("#loading").hide();
    const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('trans');
    client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
        db.collection('contrib_by_owner').find({owner_id: client.auth.user.id}, { limit: 100}).asArray()
    ).then(docs => {
        //console.log("Found docs", docs[0]["count"])
        $("#your_contrib").text(docs[0]["count"])
    }).catch(err => {
        console.error(err)
    });
    client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
        db.collection('total_words').find().asArray()
    ).then(docs => {
        // //console.log("Found docs", docs)
        $("#tot_words").text(docs[0]['total']+" / 10,000");
        var valeur = parseInt(docs[0]['total'])/100;
        $("#prog").attr("aria-valuenow",valeur).css('width', valeur+'%');
    }).catch(err => {
        console.error(err)
    });
}

function isEmpty(str) {
    return (!str || !str.trim() || 0 === str.trim().length);
}

function updateScore() {
    document.getElementById("score-area").innerHTML = score;
}

function getScoreFromSimilarityScore(simscore){
    if (simscore >= 0.7)
        return Math.random() * (1 - 0.85) + 0.85;
    else
        return Math.random() * (0.85 - 0.6) + 0.6;
}

function onClickHandler() {
    // const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');
    var d = new Date();
    var ct = d.getTime();
    if(!isEmpty($('#en_text').val()) && !isEmpty($('#bn_text').text())) {
      $("#loading").show();
      var user_input = $('#en_text').val();
      var avro_output = avro.parse(user_input);
      //console.log('Avro output: ' + avro_output);
      var bn_text = $('#bn_text').text();
      const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('trans');
      client.auth.loginWithCredential(new stitch.AnonymousCredential()
      ).then(user =>
          db.collection('bn').updateOne({owner_id: client.auth.user.id}, {$push:{ words :{en: user_input,bn: bn_text,t:ct}}}, {upsert:true})  
      ).then(function(){
        counter += 1;
        var valeur = counter*100/max_c;
        $('#pb').css('width', valeur+'%');
        var currentScore = levenshteinenator(avro_output, bn_text);
        var normalizedScore = getScoreFromSimilarityScore(currentScore);
        nscore += normalizedScore
        score = Math.round((nscore / counter) * 100)
        //console.log("Counter : " + counter + " Present Score : " + currentScore + " Normalized Score : " + normalizedScore + " Total Score : " + score);
        updateScore();
        document.getElementById("en_text").value = null;
        $("#loading").hide();
        fetchContributionAndProgress();
        fetchRandomWords();
        updateScore();
        //console.log("Counter : " + counter + " Present Score : " + currentScore + " Total Score : " + score);
        if(parseInt(counter) >= max_c){
            //console.log('trigger Calc Score');
            $("#pbd").hide();
            $("#btnCalcScore").show();

        }
      }).catch(err => {
        console.error(err)
      });
    }
}

$(document).ready(function () {
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    $("#btnGetStarted").click(function(){
        $("#instructModal").modal('hide');
    });
    $("#loading").hide();
    $("#btnSkip").click(function () {
        fetchRandomWords();
    });
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';  // some color/style
    ctx.lineWidth = 2;  

    bg = new Image();
    bg.onload = function(){
        ctx.drawImage(bg,0,0)
    }
    bg.src = "static/img/template.png";
    $("#btnSubmit").click(onClickHandler);
    $("#en_text").keydown(function (event) {
        if (event.keyCode === 27) {
            fetchRandomWords();
        } else if (event.keyCode === 13) {
            onClickHandler();
        }
    });

    
        FB.init({
            appId            : '531999777464234',
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v6.0'
        });

        FB.getLoginStatus(function(response) {
            console.log(response)
            if(response.status == "connected"){
                $("#loading").hide();
                $("#btnCalcScore").hide();
                $("#instructModal").modal('show');
                fetchContributionAndProgress();
                updateScore();
                console.log("already logged in");
            }else{
                if(isFacebookApp() || isMobile){
                    $("#fbLoginModal").modal('show');
                }else{
                    FB.login(function(response) {
                        location.reload();
                        console.log("login");
                    });
                    
                }
                
            }
        });
    
    $("#btnCalcScore").click(function(){
        $('#fbShareModal').modal('toggle');
        initFBshare();
    });

    $("#btnFBShare").click(function(){
        console.log('https://bn-trans.herokuapp.com/get_im?q='+user);
            FB.ui({
            method: 'share',
            href: 'https://bn-trans.herokuapp.com/get_im?q='+user,
        }, function(response){});
    });
});

