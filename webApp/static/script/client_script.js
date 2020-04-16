const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');

function isEmpty(str) {
    return (!str || !str.trim() || 0 === str.trim().length);
}

function onClickHandler() {
    // const client = stitch.Stitch.initializeDefaultAppClient('bntransserve-fhipn');
    if (!isEmpty($('#en_text').val()) && !isEmpty($('#bn_text').text())) {
        $("#loading").show();
        const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('trans');

        client.auth.loginWithCredential(new stitch.AnonymousCredential()
        ).then(user =>
            db.collection('bn').updateOne({ owner_id: client.auth.user.id }, { $push: { words: { en: $('#en_text').val(), bn: $('#bn_text').text() } } }, { upsert: true })
        ).then(function () {
            //   db.close();

            location.reload();
        }).catch(err => {
            console.error(err)
        });
    }

}

$(document).ready(function () {
    $("#loading").hide();
    const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('trans');

    client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
        db.collection('contrib_by_owner').find({ owner_id: client.auth.user.id }, { limit: 100 }).asArray()
    ).then(docs => {
        $("#your_contrib").text(docs[0]["count"])
    }).catch(err => {
        console.error(err)
    });

    client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
        db.collection('total_words').find().asArray()
    ).then(docs => {
        $("#tot_words").text(docs[0]['total'] + " / 10,000");
        var valeur = parseInt(docs[0]['total']) / 100;
        $("#prog").attr("aria-valuenow", valeur).css('width', valeur + '%');
    }).catch(err => {
        console.error(err)
    });
});

$("#loading").hide();
$("#btnSkip").click(function () {
    location.reload();
});
$("#btnSubmit").click(onClickHandler);
$("#en_text").keydown(function (event) {
    if (event.keyCode === 27) {
        location.reload();
    } else if (event.keyCode === 13) {
        onClickHandler();
    }
});
