const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');
// Role:    On click of skip button, fetching Random Words and Displaying it above the Text Box Without Reloading the Page.
// Author:  Rangan Roy (roy.rangan7@gmail.com).
var counter = 0;
var score = 0;
var user = '';

function initFBshare(){
    var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';  // some color/style
    ctx.lineWidth = 2;  

    bg = new Image();
    bg.onload = function(){
        ctx.drawImage(bg,0,0)
    }
    bg.src = "static/template.png";
    function drawScrollbar () {
        var width = 145,
            height = 15,
            max = 100,
            val = 80,
            direction = 'horizontal';
        
        // Draw the background
        ctx.fillStyle = '#000';
        // ctx.clearRect(275, 153, width, height);
        // ctx.fillRect(275, 153, width, height);

        // Draw the fill
        ctx.fillStyle = '#777';
        var fillVal = Math.min(Math.max(val / max, 0), 1);
        if (direction === 'vertical') {
            ctx.fillRect(275, 153, width, (max-val)*height/max );
            // ctx.strokeRect(248, 98, 32, 150);

        } else {
            ctx.fillRect(275, 153, (max-val) * width/max, height);
        }
    }
    
    FB.init({
        appId            : '531999777464234',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v6.0'
    });
    FB.login(function(response) {
            if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            base_image = new Image();
            
            FB.api('/me', function(response) {

                
                user = response.id;
                base_image.onload = function(){
                    ctx.drawImage(base_image, 40, 66,160,154);
                    // ctx.strokeRect(36, 96, 154, 154);
                    
                    
                    ctx.font = "24px Arial";
                    ctx.fillText(response.name, 42, 40);
                    drawScrollbar();
                    var dataURL = canvas.toDataURL('image/jpeg');
                    console.log(dataURL);
                    $.ajax({
                        type: "POST", 
                        url: "put_im", 
                        data: { img: dataURL, uid: user }  
                    }).done(function(msg){ 
                        
                    });
                }
                base_image.crossOrigin = "anonymous";
                base_image.src = "https://graph.facebook.com/" + response.id + "/picture?type=large";
                
                
                
                
                

                console.log('Good to see you, ' + response.name + '.');
            });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
            
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
        console.log("Found docs", docs[0]["count"])
        $("#your_contrib").text(docs[0]["count"])
    }).catch(err => {
        console.error(err)
    });
    client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
        db.collection('total_words').find().asArray()
    ).then(docs => {
        // console.log("Found docs", docs)
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

function onClickHandler() {
    // const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');
    if(!isEmpty($('#en_text').val()) && !isEmpty($('#bn_text').text())) {
      $("#loading").show();
      const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('trans');
      client.auth.loginWithCredential(new stitch.AnonymousCredential()
      ).then(user =>
          db.collection('bn').updateOne({owner_id: client.auth.user.id}, {$push:{ words :{en: $('#en_text').val(),bn: $('#bn_text').text()}}}, {upsert:true})  
      ).then(function(){
        counter += 1;
        score += 1;
        document.getElementById("en_text").value = null;
        $("#loading").hide();
        fetchContributionAndProgress();
        fetchRandomWords();
        console.log(counter);
        if(counter == 3){
            $('#fbShareModal').modal('toggle');
            initFBshare();
        }
      }).catch(err => {
        console.error(err)
      });
    }
}

$(document).ready(function () {
    $("#loading").hide();
    fetchContributionAndProgress();
});

$("#loading").hide();
$("#btnSkip").click(function () {
    fetchRandomWords();
});
$("#btnSubmit").click(onClickHandler);
$("#en_text").keydown(function (event) {
    if (event.keyCode === 27) {
        fetchRandomWords();
    } else if (event.keyCode === 13) {
        onClickHandler();
    }
});

$("#btnFBShare").click(function(){
    console.log('https://bn-trans.herokuapp.com/get_im?q='+user);
        FB.ui({
        method: 'share',
        href: 'https://bn-trans.herokuapp.com/get_im?q='+user,
    }, function(response){});
});