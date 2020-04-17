const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');
// Role:    On click of skip button, fetching Random Words and Displaying it above the Text Box Without Reloading the Page.
// Author:  Rangan Roy (roy.rangan7@gmail.com).
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
        fetchContributionAndProgress();
        fetchRandomWords();
        //   db.close();
      }).catch(err => {
      console.error(err)
      });
    }
    document.getElementById("en_text").value = null;
    $("#loading").hide();
    // location.reload();
    // $.post("add",{en: $('#en_text').val(),bn: $('#bn_text').text()},function(data,status){

    // });
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
